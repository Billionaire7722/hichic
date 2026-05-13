$ErrorActionPreference = "Stop"

$ServiceRoot = Split-Path -Parent $PSScriptRoot
$PythonPath = Join-Path $ServiceRoot ".venv\Scripts\python.exe"

if (!(Test-Path $PythonPath)) {
  throw "Virtual environment not found. Run scripts\setup.ps1 first."
}

foreach ($Name in @("CURL_CA_BUNDLE", "REQUESTS_CA_BUNDLE", "SSL_CERT_FILE")) {
  $Value = [Environment]::GetEnvironmentVariable($Name)
  if ($Value -and !(Test-Path $Value)) {
    Remove-Item "Env:\$Name" -ErrorAction SilentlyContinue
  }
}

& $PythonPath -m uvicorn app.main:app --app-dir $ServiceRoot --host 0.0.0.0 --port 8001 --reload
