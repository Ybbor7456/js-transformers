param(
  [string]$Script    = ".\day1_transformer.js",
  [string]$InputPath = ".\data.json",
  [string]$OutPath   = ".\out.json",
  [string]$Team,
  [int]$MinScore
)

if (-not (Test-Path $Script))    { throw "Missing script: $Script" }
if (-not (Test-Path $InputPath)) { throw "Missing input:  $InputPath" }

# Build args safely as an array
$cmd = @($Script, "--input", $InputPath, "--out", $OutPath)

if ($Team) { $cmd += @("--team", $Team) }

# Only add minScore if user provided it
if ($PSBoundParameters.ContainsKey("MinScore")) {
  $cmd += @("--minScore", $MinScore)
}

node @cmd
if ($LASTEXITCODE -ne 0) { throw "Transformer failed with exit code $LASTEXITCODE" }

if (-not (Test-Path $OutPath)) { throw "Expected output not found: $OutPath" }

Write-Host "`nWrote $OutPath" -ForegroundColor Green
Get-Content $OutPath -TotalCount 40



