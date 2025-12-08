$ErrorActionPreference = "Stop"

$REPO = "CaiJingLong/Tally"

# GitHub 代理前缀（用于中国大陆加速）
# 可通过环境变量 GHPROXY 设置，例如: $env:GHPROXY="http://ghfast.top"; .\install.ps1
$GHPROXY = $env:GHPROXY

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
$GITHUB_URL = "https://github.com/$REPO/releases/download/$LATEST_RELEASE/$BINARY_NAME"

# 如果设置了代理前缀，则使用代理
if ($GHPROXY) {
    # 移除末尾的斜杠（如果有）
    $GHPROXY = $GHPROXY.TrimEnd('/')
    $DOWNLOAD_URL = "$GHPROXY/$GITHUB_URL"
    Write-Host "Using proxy: $GHPROXY"
} else {
    $DOWNLOAD_URL = $GITHUB_URL
}

Write-Host "Downloading: $DOWNLOAD_URL"

Invoke-WebRequest -Uri $DOWNLOAD_URL -OutFile "tally.exe"

Write-Host ""
Write-Host "Installation complete!"
Write-Host "Run .\tally.exe to start the server"
Write-Host "Default port: 8080"
Write-Host "Default credentials: admin / password"
