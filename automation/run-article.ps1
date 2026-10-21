# Scheduled Claude run (see register-tasks.ps1). Defaults to /article, the
# Tue/Wed/Thu article; the audit-request task passes its own prompt, clone and port.
# Each task works in its own clone so runs never touch each other or the main
# working copy.

param(
    [string]$Prompt = '/article auto',
    [string]$CloneName = 'frodo-automation',
    [int]$Port = 3100,
    [string]$LogName = 'article'
)

$ErrorActionPreference = 'Stop'
$Clone = Join-Path $env:USERPROFILE "projects\$CloneName"
$LogDir = Join-Path $env:USERPROFILE '.raven\logs'
New-Item -ItemType Directory -Force $LogDir | Out-Null
$Log = Join-Path $LogDir ("$LogName-{0:yyyy-MM-dd-HHmm}.log" -f (Get-Date))
Start-Transcript -Path $Log | Out-Null

try {
    if (-not (Test-Path $Clone)) {
        gh repo clone i-Welch/frodo $Clone
    }
    Set-Location $Clone
    git fetch origin master
    git checkout -f master
    git reset --hard origin/master
    git clean -fd

    Set-Location (Join-Path $Clone 'dashboard')
    bun install
    Set-Location $Clone

    # The run verifies pages on its own dev server, away from port 3000.
    $env:ARTICLE_DEV_PORT = "$Port"

    $allowed = @(
        'Read', 'Edit', 'Write', 'Glob', 'Grep', 'WebSearch', 'WebFetch',
        'Bash(git *)', 'Bash(gh *)', 'Bash(bun *)', 'Bash(curl *)', 'Bash(node *)',
        'Bash(grep *)', 'Bash(wc *)', 'Bash(cat *)', 'Bash(ls *)', 'Bash(head *)',
        'Bash(tail *)', 'Bash(sed -n *)', 'Bash(sleep *)'
    )
    claude -p $Prompt --permission-mode acceptEdits --allowedTools $allowed --output-format text | Tee-Object -Variable claudeOut
    if ($LASTEXITCODE -ne 0) {
        # A usage limit is not a bug: say so, with the reset time, so the alert is actionable.
        $limit = $claudeOut | Where-Object { $_ -match 'hit your .*limit' } | Select-Object -First 1
        if ($limit) { throw "Claude usage limit, run skipped: $limit" }
        throw "claude exited with $LASTEXITCODE"
    }
}
catch {
    Write-Output "RUN FAILED ($Prompt): $_"
    $subject = if ("$_" -match 'usage limit') { "$Prompt skipped (Claude usage limit)" } else { "$Prompt run failed" }
    bun (Join-Path $Clone 'automation\alert.ts') "run-$LogName" $subject "$_`n`nTranscript: $Log"
    exit 1
}
finally {
    # Stop any dev server the run left on its port.
    Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
        ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
    Stop-Transcript | Out-Null
}
