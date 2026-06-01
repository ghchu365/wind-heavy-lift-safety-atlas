# Download script for wtgehs site
$ErrorActionPreference = "Continue"
$BaseUrl = "https://wtgehs.netlify.app"
$OutputDir = "E:\claude desktop\mywebsite-Envision\downloaded-site"
$UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

function Get-RemoteFile($url, $outPath) {
    $dir = Split-Path $outPath -Parent
    if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    try {
        $resp = Invoke-WebRequest -Uri $url -OutFile $outPath -UserAgent $UA -TimeoutSec 30 -UseBasicParsing
        Write-Host "[OK] $url -> $outPath"
    } catch {
        Write-Host "[FAIL] $url ($($_.Exception.Message))"
    }
}

# Pages from the hash map
$pages = @(
    "/",
    "/laws/domestic/",
    "/laws/domestic/oversize-transport-detailed/",
    "/laws/domestic/highway-safety-protection/",
    "/laws/domestic/road-freight-transport/",
    "/laws/domestic/hazardous-transport/",
    "/laws/domestic/oversize-transport/",
    "/laws/domestic/road-traffic-law/",
    "/laws/domestic/vehicle-registration/",
    "/laws/domestic/local-regulations/",
    "/laws/international/",
    "/laws/international/adr/",
    "/laws/international/eu-directive/",
    "/laws/international/fhwa/",
    "/laws/international/iso/",
    "/laws/standards/",
    "/laws/standards/gb-37669/",
    "/laws/standards/gb1589/",
    "/laws/standards/nb10209-wind-road/",
    "/practice/planning/",
    "/practice/securing/",
    "/practice/routing/",
    "/practice/emergency/",
    "/cases/accidents/",
    "/cases/accidents/rear-end-prevention/",
    "/cases/near-misses/",
    "/cases/reports/",
    "/equipment/components/",
    "/equipment/components/blade-transport/",
    "/equipment/components/tower-transport/",
    "/equipment/oversize/",
    "/equipment/loading/",
    "/equipment/escort/",
    "/equipment/escort/transport-plan/",
    "/feedback/submit/",
    "/feedback/faq/",
    "/feedback/contact/"
)

# Assets discovered from index.html
$assets = @(
    "/assets/style.DOLzLSYU.css",
    "/vp-icons.css",
    "/assets/app.C2tq4-Dy.js",
    "/assets/inter-roman-latin.Di8DUHzh.woff2",
    "/assets/chunks/theme.BGzsJFey.js",
    "/assets/chunks/framework.BPKcPtvA.js",
    "/assets/index.md.Dzffgo_B.lean.js",
    "/favicon.svg",
    "/logo.svg"
)

Write-Host "Downloading pages..."
foreach ($page in $pages) {
    $localPath = $page -replace '/$', '/index.html'
    $localPath = $localPath -replace '^/', ''
    if ($localPath -eq '') { $localPath = 'index.html' }
    Get-RemoteFile "$BaseUrl$page" "$OutputDir\$localPath"
}

Write-Host "`nDownloading assets..."
foreach ($asset in $assets) {
    $localPath = $asset -replace '^/', ''
    Get-RemoteFile "$BaseUrl$asset" "$OutputDir\$localPath"
}

# Try to find more assets by fetching a page and extracting asset links
Write-Host "`nDiscovering more assets from pages..."
$discoveredAssets = @()
foreach ($page in $pages[0..3]) {
    try {
        $html = Invoke-WebRequest -Uri "$BaseUrl$page" -UserAgent $UA -UseBasicParsing | Select-Object -ExpandProperty Content
        # Extract asset URLs
        $hrefs = [regex]::Matches($html, 'href="(/[^"]+)"') | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
        $srcs = [regex]::Matches($html, 'src="(/[^"]+)"') | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
        $discoveredAssets += $hrefs | Where-Object { $_ -match '\.(css|js|woff2?|svg|png|jpg|jpeg|webp|ico|json)$' -and $_ -notmatch '^http' }
        $discoveredAssets += $srcs | Where-Object { $_ -match '\.(css|js|woff2?|svg|png|jpg|jpeg|webp|ico|json)$' -and $_ -notmatch '^http' }
    } catch {}
}
$discoveredAssets = $discoveredAssets | Sort-Object -Unique
foreach ($asset in $discoveredAssets) {
    if ($asset -notmatch '^/') { continue }
    $localPath = $asset -replace '^/', ''
    if (Test-Path "$OutputDir\$localPath") { continue }
    Get-RemoteFile "$BaseUrl$asset" "$OutputDir\$localPath"
}

Write-Host "`nDone. Listing downloaded files:"
Get-ChildItem $OutputDir -Recurse -File | Select-Object FullName
