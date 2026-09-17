param([switch]$Local, [switch]$LinkedDev)
$ErrorActionPreference = 'Stop'
if ($Local.IsPresent -eq $LinkedDev.IsPresent) { throw 'Choose exactly one of -Local or -LinkedDev.' }
$repoPath = Split-Path $PSScriptRoot -Parent
if ($LinkedDev) {
  $linkedRef = (Get-Content -LiteralPath (Join-Path $repoPath 'supabase/.temp/project-ref') -Raw).Trim()
  if ($linkedRef -ne 'finbvtwjddrmbuuuyeni') { throw 'Refusing seed: this is not the allowed DEV project.' }
}
$seedText = Get-Content -LiteralPath (Join-Path $repoPath 'supabase/seeds/dev_kabatos.sql') -Raw
$seedFile = Join-Path $repoPath '.vercel/dev-seed-session.sql'
New-Item -ItemType Directory -Force -Path (Split-Path $seedFile -Parent) | Out-Null
# The custom setting and guarded seed execute in one database connection.
Set-Content -LiteralPath $seedFile -Value ("SET app.kabatos_environment = 'development';`n" + $seedText)
Push-Location $repoPath
try {
  if ($Local) { supabase db query --local --file $seedFile }
  else { supabase db query --linked --file $seedFile }
  if ($LASTEXITCODE -ne 0) { throw 'DEV seed failed.' }
} finally { Pop-Location }
