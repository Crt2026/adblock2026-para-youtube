Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\Lenovo_\.gemini\antigravity-ide\brain\751bd891-1e3b-41b3-9935-01266b67ff1a\adblock_cyber_logo_1791218291331.jpg"
$baseDir = (Get-Location).Path
$targetDir = Join-Path $baseDir "icons"

if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}

$srcImg = [System.Drawing.Image]::FromFile($srcPath)
$sizes = @(16, 32, 48, 128, 256, 512)

foreach ($s in $sizes) {
    $destBitmap = New-Object System.Drawing.Bitmap $s, $s
    $graphics = [System.Drawing.Graphics]::FromImage($destBitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $graphics.DrawImage($srcImg, 0, 0, $s, $s)
    $outPath = Join-Path $targetDir ("icon" + $s + ".png")
    $destBitmap.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $destBitmap.Dispose()
    Write-Output "Generated icon $s x $s"
}

$srcImg.Dispose()
Write-Output "All icons generated successfully!"
