# Build a deployable archive for one domain.
#
#   powershell -File deploy\stage.ps1 -Site net -Zip H:\tmp\cc_net.zip
#   powershell -File deploy\stage.ps1 -Site nl  -Zip H:\tmp\cc_nl.zip
#
# Hostinger builds from SOURCE on the server (npm install + npm run build), so the
# archive ships source plus the right .env - never node_modules or dist.
#
# The parameter is -Site, not -Env: a parameter named $Env would shadow PowerShell's
# $env: provider inside this script.
param(
  [Parameter(Mandatory = $true)][ValidateSet('nl', 'net')][string]$Site,
  [Parameter(Mandatory = $true)][string]$Zip,
  [string]$Stage
)
$ErrorActionPreference = 'Stop'

$repo    = Split-Path -Parent $PSScriptRoot
$makezip = Join-Path $PSScriptRoot 'make-zip.ps1'
$envFile = Join-Path $PSScriptRoot "env.$Site"
if (-not $Stage) { $Stage = Join-Path $env:TEMP "cc-stage-$Site" }
if (-not (Test-Path -LiteralPath $envFile)) { throw "Missing $envFile" }

if (Test-Path -LiteralPath $Stage) { Remove-Item -LiteralPath $Stage -Recurse -Force }
New-Item -ItemType Directory -Force -Path $Stage | Out-Null

# Both domains are already seeded, so the 23MB seed media is dropped: seed-articles.js
# is idempotent and the images already live in UPLOAD_DIR.
#
# NOTE: bare names match a directory at ANY depth, which once silently ate
# public/wp-content/uploads/ (the BIMI logo). Anchor anything that is not meant to be
# excluded everywhere to its full path.
$xd = @(
  'node_modules', 'dist', '.astro', '.git', '.github', '.claude',
  (Join-Path $repo 'uploads'),
  (Join-Path $repo 'tools'),
  (Join-Path $repo 'deploy'),
  (Join-Path $repo 'backend\scripts\seed\media')
)
$xf = @('.mcp.json', '.env', '*.log')
$rc = @($repo, $Stage, '/E', '/NFL', '/NDL', '/NJH', '/NJS', '/NP', '/XD') + $xd + @('/XF') + $xf
robocopy @rc | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy failed: $LASTEXITCODE" }
$global:LASTEXITCODE = 0

Copy-Item -LiteralPath $envFile -Destination (Join-Path $Stage '.env') -Force

foreach ($k in 'SITE_URL', 'ALLOW_INDEXING', 'DB_NAME') {
  $line = (Select-String -LiteralPath (Join-Path $Stage '.env') -Pattern "^$k=").Line
  Write-Output "  $line"
}

& powershell -NoProfile -ExecutionPolicy Bypass -File $makezip -Stage $Stage -Zip $Zip
Write-Output ("  zip: {0} - {1:N0} KB" -f $Zip, ((Get-Item $Zip).Length / 1KB))
