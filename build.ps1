$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$temp = Join-Path $env:TEMP ([guid]::NewGuid().ToString('N'))
$runA = Join-Path $temp 'run-a'
$runB = Join-Path $temp 'run-b'
try {
    New-Item -ItemType Directory -Force -Path $runA, $runB | Out-Null
    $env:MAKEFUN_OUTPUT_DIR = $runA
    node --experimental-strip-types (Join-Path $root 'main.ts')
    $env:MAKEFUN_OUTPUT_DIR = $runB
    node --experimental-strip-types (Join-Path $root 'main.ts')
    $hashA = (Get-FileHash (Join-Path $runA 'entry.png') -Algorithm SHA256).Hash
    $hashB = (Get-FileHash (Join-Path $runB 'entry.png') -Algorithm SHA256).Hash
    $hashSource = (Get-FileHash (Join-Path $root 'entry.png') -Algorithm SHA256).Hash
    if ($hashA -ne $hashB -or $hashA -ne $hashSource) { throw 'Outputs are not byte-identical.' }
    Write-Host 'PASS: two independent runs produced identical bytes.' -ForegroundColor Green
    Write-Host "SHA-256: $hashA"
    Write-Host "Bytes: $((Get-Item (Join-Path $runA 'entry.png')).Length)"
} finally {
    Remove-Item Env:MAKEFUN_OUTPUT_DIR -ErrorAction SilentlyContinue
    Remove-Item $temp -Recurse -Force -ErrorAction SilentlyContinue
}
