# Scheduled /article run (Tue/Wed/Thu, see register-tasks.ps1).
# Works in a dedicated clone so it never touches the main working copy.

$ErrorActionPreference = 'Stop'
$Clone = Join-Path $env:USERPROFILE 'projects\frodo-automation'
$LogDir = Join-Path $env:USERPROFILE '.raven\logs'
New-Item -ItemType Directory -Force $LogDir | Out-Null
$Log = Join-Path $LogDir ("article-{0:yyyy-MM-dd-HHmm}.log" -f (Get-Date))
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

    # The article run verifies pages on its own dev server, away from port 3000.
    $env:ARTICLE_DEV_PORT = '3100'

    $allowed = @(
        'Read', 'Edit', 'Write', 'Glob', 'Grep', 'WebSearch', 'WebFetch',
        'Bash(git *)', 'Bash(gh *)', 'Bash(bun *)', 'Bash(curl *)', 'Bash(node *)',
        'Bash(grep *)', 'Bash(wc *)', 'Bash(cat *)', 'Bash(ls *)', 'Bash(head *)',
        'Bash(tail *)', 'Bash(sed -n *)', 'Bash(sleep *)'
    )
    claude -p '/article auto' --permission-mode acceptEdits --allowedTools $allowed --output-format text
    if ($LASTEXITCODE -ne 0) { throw "claude exited with $LASTEXITCODE" }
}
catch {
    Write-Output "ARTICLE RUN FAILED: $_"
    exit 1
}
finally {
    # Stop any dev server the run left on the automation port.
    Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue |
        ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
    Stop-Transcript | Out-Null
}
