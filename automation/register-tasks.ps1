# Registers the Windows scheduled tasks for RAVEN automation. Each task has its
# own clone under ~/projects, updated to origin/master before each run, so they
# always use the merged scripts and never reset each other's work in progress.
# Remove with:
#   Unregister-ScheduledTask -TaskName 'RAVEN Article','RAVEN Auto-Publish','RAVEN Audit Requests','RAVEN Newsletter','RAVEN Digest','RAVEN De Novo Watch','RAVEN Visibility Check' -Confirm:$false

$Projects = Join-Path $env:USERPROFILE 'projects'
$LogDir = Join-Path $env:USERPROFILE '.raven\logs'
New-Item -ItemType Directory -Force $LogDir | Out-Null

function Initialize-Clone([string]$Name) {
    $path = Join-Path $Projects $Name
    if (-not (Test-Path $path)) {
        gh repo clone i-Welch/frodo $path
        Push-Location (Join-Path $path 'dashboard'); bun install; Pop-Location
    }
    return $path
}

function Get-UpdateCommand([string]$Clone) {
    "git -C '$Clone' fetch -q origin master; git -C '$Clone' checkout -q -f master; git -C '$Clone' reset -q --hard origin/master"
}

$ArticleClone = Initialize-Clone 'frodo-automation'
$PublishClone = Initialize-Clone 'frodo-publish'
$AuditClone = Initialize-Clone 'frodo-audits'

$Settings = New-ScheduledTaskSettingsSet -WakeToRun -StartWhenAvailable -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Hours 2) -MultipleInstances IgnoreNew

# Tue/Wed/Thu 8:00 local time (this PC runs Eastern).
$articleAction = New-ScheduledTaskAction -Execute 'powershell.exe' `
    -Argument "-NoProfile -ExecutionPolicy Bypass -Command `"$(Get-UpdateCommand $ArticleClone); & '$ArticleClone\automation\run-article.ps1'`""
$articleTrigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Tuesday, Wednesday, Thursday -At 8:00am
Register-ScheduledTask -TaskName 'RAVEN Article' -Action $articleAction -Trigger $articleTrigger `
    -Settings $Settings -Description 'Writes one RAVEN blog article and opens an auto-publish PR' -Force | Out-Null

# Weekdays 11:00: build audits for free-audit requests from the site.
$auditAction = New-ScheduledTaskAction -Execute 'powershell.exe' `
    -Argument ("-NoProfile -ExecutionPolicy Bypass -Command `"$(Get-UpdateCommand $AuditClone); & '$AuditClone\automation\run-article.ps1' " +
        "-Prompt '/audit-request auto' -CloneName 'frodo-audits' -Port 3101 -LogName 'audit-request'`"")
$auditTrigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday, Tuesday, Wednesday, Thursday, Friday -At 11:00am
Register-ScheduledTask -TaskName 'RAVEN Audit Requests' -Action $auditAction -Trigger $auditTrigger `
    -Settings $Settings -Description 'Builds audit pages for free-audit requests and opens auto-publish PRs' -Force | Out-Null

# Mondays 6:00: re-verify the De Novo Watch tracker. Shares the audits clone,
# which is idle until the 11:00 audit run (runs are capped at 2 hours).
$deNovoAction = New-ScheduledTaskAction -Execute 'powershell.exe' `
    -Argument ("-NoProfile -ExecutionPolicy Bypass -Command `"$(Get-UpdateCommand $AuditClone); & '$AuditClone\automation\run-article.ps1' " +
        "-Prompt '/de-novo-update auto' -CloneName 'frodo-audits' -Port 3101 -LogName 'de-novo-update'`"")
$deNovoTrigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At 6:00am
Register-ScheduledTask -TaskName 'RAVEN De Novo Watch' -Action $deNovoAction -Trigger $deNovoTrigger `
    -Settings $Settings -Description 'Re-verifies the De Novo Watch tracker and opens an auto-publish PR' -Force | Out-Null

# Every fourth Monday 8:30: search/AI visibility check that feeds /article topics.
# Shares the audits clone between the 6:00 De Novo run and the 11:00 audit run.
$visibilityAction = New-ScheduledTaskAction -Execute 'powershell.exe' `
    -Argument ("-NoProfile -ExecutionPolicy Bypass -Command `"$(Get-UpdateCommand $AuditClone); & '$AuditClone\automation\run-article.ps1' " +
        "-Prompt '/visibility-check auto' -CloneName 'frodo-audits' -Port 3101 -LogName 'visibility-check'`"")
$visibilityTrigger = New-ScheduledTaskTrigger -Weekly -WeeksInterval 4 -DaysOfWeek Monday -At 8:30am
Register-ScheduledTask -TaskName 'RAVEN Visibility Check' -Action $visibilityAction -Trigger $visibilityTrigger `
    -Settings $Settings -Description 'Monthly search/AI visibility check; writes topic ideas for /article' -Force | Out-Null

# Fridays 9:30: weekly newsletter of the week's articles (skipped when there are none).
$newsletterLog = Join-Path $LogDir 'newsletter.log'
$newsletterAction = New-ScheduledTaskAction -Execute 'powershell.exe' `
    -Argument "-NoProfile -ExecutionPolicy Bypass -Command `"$(Get-UpdateCommand $PublishClone); bun '$PublishClone\automation\newsletter.ts' *>> '$newsletterLog'`""
$newsletterTrigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Friday -At 9:30am
Register-ScheduledTask -TaskName 'RAVEN Newsletter' -Action $newsletterAction -Trigger $newsletterTrigger `
    -Settings $Settings -Description 'Emails the weekly RAVEN newsletter to subscribers' -Force | Out-Null

# Mondays 7:30: weekly digest email to the founder.
$digestLog = Join-Path $LogDir 'digest.log'
$digestAction = New-ScheduledTaskAction -Execute 'powershell.exe' `
    -Argument "-NoProfile -ExecutionPolicy Bypass -Command `"$(Get-UpdateCommand $PublishClone); bun '$PublishClone\automation\digest.ts' *>> '$digestLog'`""
$digestTrigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At 7:30am
Register-ScheduledTask -TaskName 'RAVEN Digest' -Action $digestAction -Trigger $digestTrigger `
    -Settings $Settings -Description 'Emails the founder a weekly summary of leads, articles and automation health' -Force | Out-Null

# Hourly: merge PRs past the 24h window, post queued LinkedIn updates, email finished audits.
$publishLog = Join-Path $LogDir 'auto-publish.log'
$publishAction = New-ScheduledTaskAction -Execute 'powershell.exe' `
    -Argument "-NoProfile -ExecutionPolicy Bypass -Command `"$(Get-UpdateCommand $PublishClone); bun '$PublishClone\automation\auto-publish.ts' *>> '$publishLog'`""
$publishTrigger = New-ScheduledTaskTrigger -Once -At (Get-Date).Date.AddMinutes(5) `
    -RepetitionInterval (New-TimeSpan -Hours 1)
Register-ScheduledTask -TaskName 'RAVEN Auto-Publish' -Action $publishAction -Trigger $publishTrigger `
    -Settings $Settings -Description 'Merges auto-publish PRs after 24h, posts LinkedIn updates, emails finished audits' -Force | Out-Null

Get-ScheduledTask -TaskName 'RAVEN Article', 'RAVEN Auto-Publish', 'RAVEN Audit Requests', 'RAVEN Newsletter', 'RAVEN Digest', 'RAVEN De Novo Watch', 'RAVEN Visibility Check' |
    Select-Object TaskName, State, @{ n = 'NextRun'; e = { ($_ | Get-ScheduledTaskInfo).NextRunTime } }
