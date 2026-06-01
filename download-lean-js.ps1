# Download all VitePress lean.js content files
$ErrorActionPreference = "Continue"
$BaseUrl = "https://wtgehs.netlify.app"
$OutputDir = "E:\claude desktop\mywebsite-Envision\downloaded-site"
$UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

function Get-RemoteFile($url, $outPath) {
    $dir = Split-Path $outPath -Parent
    if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    try {
        Invoke-WebRequest -Uri $url -OutFile $outPath -UserAgent $UA -TimeoutSec 30 -UseBasicParsing
        Write-Host "[OK] $url"
    } catch {
        Write-Host "[FAIL] $url ($($_.Exception.Message))"
    }
}

# Extract hash map from index.html
$html = Get-Content "$OutputDir\index.html" -Raw
if ($html -match 'window\.__VP_HASH_MAP__=JSON\.parse\("([^"]+)"\)') {
    $jsonStr = $Matches[1] -replace '\\"', '"' -replace '\\/', '/'
    try {
        $hashMap = $jsonStr | ConvertFrom-Json -AsHashtable
        $urls = @()
        foreach ($key in $hashMap.Keys) {
            $hash = $hashMap[$key]
            # Convert key like "cases_accidents_index" to "/assets/cases/accidents/index.md.HASH.lean.js"
            $assetPath = "assets/" + ($key -replace '_', '/') + ".md." + $hash + ".lean.js"
            $urls += $assetPath
        }
        $urls = $urls | Sort-Object -Unique
        Write-Host "Found $($urls.Count) lean.js files to download..."
        foreach ($url in $urls) {
            Get-RemoteFile "$BaseUrl/$url" "$OutputDir\$url"
        }
    } catch {
        Write-Host "Error parsing hash map: $_"
    }
} else {
    Write-Host "Could not find hash map in index.html"
}

# Also check for any missing .lean.js by looking at each HTML page
Write-Host "`nChecking all pages for missing assets..."
$pages = Get-ChildItem $OutputDir -Recurse -Filter "*.html"
foreach ($page in $pages) {
    $content = Get-Content $page.FullName -Raw
    # Find all /assets/... references
    $assets = [regex]::Matches($content, '["\''](/assets/[^"\'']+\.(css|js|woff2?|svg|png|jpg|jpeg|webp|ico|json))') | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
    foreach ($asset in $assets) {
        $localPath = $asset -replace '^/', ''
        $fullPath = "$OutputDir\$localPath"
        if (!(Test-Path $fullPath)) {
            Get-RemoteFile "$BaseUrl$asset" $fullPath
        }
    }
}
Write-Host "`nDone."
