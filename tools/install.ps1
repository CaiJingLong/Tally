$ErrorActionPreference = "Stop"

$REPO = "CaiJingLong/Tally"

$BINARY_NAME = "tally-windows-amd64.exe"
Write-Host "Will download: $BINARY_NAME"

# 获取最新版本
Write-Host "Fetching latest version..."
try {
    $release = Invoke-RestMethod -Uri "https://api.github.com/repos/$REPO/releases/latest"
    $LATEST_RELEASE = $release.tag_name
} catch {
    Write-Host "Failed to fetch latest version. Please check your network connection."
    exit 1
}

Write-Host "Latest version: $LATEST_RELEASE"

# 下载二进制文件
$DOWNLOAD_URL = "https://github.com/$REPO/releases/download/$LATEST_RELEASE/$BINARY_NAME"
Write-Host "Downloading: $DOWNLOAD_URL"

Invoke-WebRequest -Uri $DOWNLOAD_URL -OutFile "tally.exe"

Write-Host ""
Write-Host "Installation complete!"
Write-Host "Run .\tally.exe to start the server"
Write-Host "Default port: 8080"
Write-Host "Default credentials: admin / password"
