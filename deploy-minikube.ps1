param(
    [string]$Profile = 'devops-reto',
    [string]$Namespace = 'reto',
    [string]$ImageTag = '1.0'
)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Find-Tool([string]$Name, [string]$Fallback) {
    $command = Get-Command $Name -ErrorAction SilentlyContinue
    if ($command) { return $command.Source }
    if (Test-Path -LiteralPath $Fallback) { return $Fallback }
    throw "No se encontró $Name. Instálalo antes de desplegar."
}
function Invoke-Checked([string]$File, [string[]]$Arguments) {
    & $File @Arguments
    if ($LASTEXITCODE -ne 0) { throw "Falló $File con código $LASTEXITCODE." }
}

$minikube = Find-Tool 'minikube' "$env:LOCALAPPDATA\DevOpsTools\minikube.exe"
$helm = Find-Tool 'helm' "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Helm.Helm_Microsoft.Winget.Source_8wekyb3d8bbwe\windows-amd64\helm.exe"
$kubectl = (Get-Command kubectl -ErrorAction Stop).Source
$statusText = & $minikube status --profile $Profile --output=json
if ($LASTEXITCODE -ne 0) { throw "El perfil $Profile no está iniciado." }
$status = $statusText | ConvertFrom-Json
if ($status.Host -ne 'Running' -or $status.APIServer -ne 'Running' -or $status.Kubelet -ne 'Running') {
    throw "El clúster $Profile todavía no está listo."
}

Push-Location $PSScriptRoot
try {
    Invoke-Checked $helm @('lint', './helm')
    Invoke-Checked $minikube @('image', 'build', '--profile', $Profile, '-t', "repos-api:$ImageTag", '.')
    Invoke-Checked $helm @('upgrade', '--install', 'repos-api', './helm', '--kube-context', $Profile, '--namespace', $Namespace, '--create-namespace', '--set-string', "image.tag=$ImageTag", '--atomic', '--wait', '--timeout', '180s')
    Invoke-Checked $kubectl @('--context', $Profile, '-n', $Namespace, 'rollout', 'status', 'deployment/repos-api', '--timeout=180s')
    Invoke-Checked $kubectl @('--context', $Profile, '-n', $Namespace, 'get', 'pods,svc')
    Invoke-Checked $kubectl @('--context', $Profile, '-n', $Namespace, 'exec', 'deployment/repos-api', '--', 'node', '-e', "fetch('http://repos-api:3000/healthz').then(async r=>{if(!r.ok)process.exit(1);console.log(await r.text())}).catch(()=>process.exit(1))")
} finally {
    Pop-Location
}
