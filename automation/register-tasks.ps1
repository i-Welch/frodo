# Registers the two Windows scheduled tasks for article automation.
# Re-run after moving the repo. Remove with:
#   Unregister-ScheduledTask -TaskName 'RAVEN Article','RAVEN Auto-Publish' -Confirm:$false

$Here = $PSScriptRoot
$Settings = New-ScheduledTaskSettingsSet -WakeToRun -StartWhenAvailable -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Hours 2) -MultipleInstances IgnoreNew

# Tue/Wed/Thu 8:00 local time (this PC runs Eastern).
$articleAction = New-ScheduledTaskAction -Execute 'powershell.exe' `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$Here\run-article.ps1`""
$articleTrigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Tuesday, Wednesday, Thursday -At 8:00am
Register-ScheduledTask -TaskName 'RAVEN Article' -Action $articleAction -Trigger $articleTrigger `
    -Settings $Settings -Description 'Writes one RAVEN blog article and opens an auto-publish PR' -Force | Out-Null

# Hourly: merge PRs past the 24h window, post queued LinkedIn updates.
$publishLog = Join-Path $env:USERPROFILE '.raven\logs\auto-publish.log'
$publishAction = New-ScheduledTaskAction -Execute 'powershell.exe' `
    -Argument "-NoProfile -ExecutionPolicy Bypass -Command `"New-Item -ItemType Directory -Force (Split-Path '$publishLog') | Out-Null; bun '$Here\auto-publish.ts' *>> '$publishLog'`""
$publishTrigger = New-ScheduledTaskTrigger -Once -At (Get-Date).Date.AddMinutes(5) `
    -RepetitionInterval (New-TimeSpan -Hours 1)
Register-ScheduledTask -TaskName 'RAVEN Auto-Publish' -Action $publishAction -Trigger $publishTrigger `
    -Settings $Settings -Description 'Merges auto-publish PRs after 24h and posts LinkedIn updates' -Force | Out-Null

Get-ScheduledTask -TaskName 'RAVEN Article', 'RAVEN Auto-Publish' |
    Select-Object TaskName, State, @{ n = 'NextRun'; e = { ($_ | Get-ScheduledTaskInfo).NextRunTime } }
