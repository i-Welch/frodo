# Registers the two Windows scheduled tasks for article automation.
# Both run from the dedicated clone (~/projects/frodo-automation), updated to
# origin/master before each run, so they always use the merged scripts.
# Remove with:
#   Unregister-ScheduledTask -TaskName 'RAVEN Article','RAVEN Auto-Publish' -Confirm:$false

$Clone = Join-Path $env:USERPROFILE 'projects\frodo-automation'
$LogDir = Join-Path $env:USERPROFILE '.raven\logs'
New-Item -ItemType Directory -Force $LogDir | Out-Null

if (-not (Test-Path $Clone)) {
    gh repo clone i-Welch/frodo $Clone
    Push-Location (Join-Path $Clone 'dashboard'); bun install; Pop-Location
}

$Settings = New-ScheduledTaskSettingsSet -WakeToRun -StartWhenAvailable -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Hours 2) -MultipleInstances IgnoreNew
$Update = "git -C '$Clone' fetch -q origin master; git -C '$Clone' checkout -q -f master; git -C '$Clone' reset -q --hard origin/master"

# Tue/Wed/Thu 8:00 local time (this PC runs Eastern).
$articleAction = New-ScheduledTaskAction -Execute 'powershell.exe' `
    -Argument "-NoProfile -ExecutionPolicy Bypass -Command `"$Update; & '$Clone\automation\run-article.ps1'`""
$articleTrigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Tuesday, Wednesday, Thursday -At 8:00am
Register-ScheduledTask -TaskName 'RAVEN Article' -Action $articleAction -Trigger $articleTrigger `
    -Settings $Settings -Description 'Writes one RAVEN blog article and opens an auto-publish PR' -Force | Out-Null

# Hourly: merge PRs past the 24h window, post queued LinkedIn updates.
$publishLog = Join-Path $LogDir 'auto-publish.log'
$publishAction = New-ScheduledTaskAction -Execute 'powershell.exe' `
    -Argument "-NoProfile -ExecutionPolicy Bypass -Command `"$Update; bun '$Clone\automation\auto-publish.ts' *>> '$publishLog'`""
$publishTrigger = New-ScheduledTaskTrigger -Once -At (Get-Date).Date.AddMinutes(5) `
    -RepetitionInterval (New-TimeSpan -Hours 1)
Register-ScheduledTask -TaskName 'RAVEN Auto-Publish' -Action $publishAction -Trigger $publishTrigger `
    -Settings $Settings -Description 'Merges auto-publish PRs after 24h and posts LinkedIn updates' -Force | Out-Null

Get-ScheduledTask -TaskName 'RAVEN Article', 'RAVEN Auto-Publish' |
    Select-Object TaskName, State, @{ n = 'NextRun'; e = { ($_ | Get-ScheduledTaskInfo).NextRunTime } }
