$ErrorActionPreference = "Stop"

$ServiceRoot = Split-Path -Parent $PSScriptRoot
$VenvPath = Join-Path $ServiceRoot ".venv"
$PythonPath = Join-Path $VenvPath "Scripts\python.exe"
$PipCachePath = Join-Path $ServiceRoot ".pip-cache"
$TempPath = Join-Path $ServiceRoot ".tmp"

New-Item -ItemType Directory -Force -Path $PipCachePath | Out-Null
New-Item -ItemType Directory -Force -Path $TempPath | Out-Null

$env:PIP_CACHE_DIR = $PipCachePath
$env:TEMP = $TempPath
$env:TMP = $TempPath

foreach ($Name in @("CURL_CA_BUNDLE", "REQUESTS_CA_BUNDLE", "SSL_CERT_FILE")) {
  $Value = [Environment]::GetEnvironmentVariable($Name)
  if ($Value -and !(Test-Path $Value)) {
    Remove-Item "Env:\$Name" -ErrorAction SilentlyContinue
  }
}

if (!(Test-Path $PythonPath)) {
  python -m venv $VenvPath
}

& $PythonPath -m pip install --upgrade pip
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

& $PythonPath -m pip install -r (Join-Path $ServiceRoot "requirements.txt")
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

$EnvPath = Join-Path $ServiceRoot ".env"
$ExampleEnvPath = Join-Path $ServiceRoot ".env.example"
if (!(Test-Path $EnvPath)) {
  Copy-Item $ExampleEnvPath $EnvPath
}

& $PythonPath (Join-Path $ServiceRoot "scripts\diagnose.py")
if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "Dependencies are installed. Add provider credentials to .env, then rerun scripts\diagnose.py."
  exit 0
}
