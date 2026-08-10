param([string]$Stage, [string]$Zip)
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$bsl = [char]92
$fwd = [char]47
if (Test-Path -LiteralPath $Zip) { Remove-Item -LiteralPath $Zip -Force }

$fs = [System.IO.File]::Open($Zip, [System.IO.FileMode]::Create)
$arch = New-Object System.IO.Compression.ZipArchive($fs, [System.IO.Compression.ZipArchiveMode]::Create)
$base = (Resolve-Path -LiteralPath $Stage).Path.TrimEnd($bsl) + $bsl

foreach ($f in (Get-ChildItem -LiteralPath $Stage -Recurse -File -Force)) {
  $rel = $f.FullName.Substring($base.Length).Replace($bsl, $fwd)
  $entry = $arch.CreateEntry($rel, [System.IO.Compression.CompressionLevel]::Optimal)
  $stream = $entry.Open()
  $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
  $stream.Write($bytes, 0, $bytes.Length)
  $stream.Dispose()
}
$arch.Dispose()
$fs.Dispose()

$z = [System.IO.Compression.ZipFile]::OpenRead($Zip)
$bs = @($z.Entries.FullName | Where-Object { $_.Contains($bsl) }).Count
$legal = @($z.Entries.FullName | Where-Object { $_ -match 'content/legal/en' }).Count
$tot = $z.Entries.Count
$z.Dispose()
Write-Output "entries=$tot backslash=$bs legalEn=$legal"
