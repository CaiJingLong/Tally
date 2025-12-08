#!/bin/bash
set -e

REPO="CaiJingLong/Tally"

# 检测系统和架构
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

case "$OS" in
    linux)
        OS="linux"
        ;;
    darwin)
        OS="darwin"
        ;;
    *)
        echo "Unsupported OS: $OS"
        exit 1
        ;;
esac

case "$ARCH" in
    x86_64|amd64)
        ARCH="amd64"
        ;;
    aarch64|arm64)
        ARCH="arm64"
        ;;
    *)
        echo "Unsupported architecture: $ARCH"
        exit 1
        ;;
esac

BINARY_NAME="tally-${OS}-${ARCH}"
echo "Detected system: ${OS}/${ARCH}"
echo "Will download: ${BINARY_NAME}"

# 获取最新版本
echo "Fetching latest version..."
LATEST_RELEASE=$(curl -s "https://api.github.com/repos/${REPO}/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')

if [ -z "$LATEST_RELEASE" ]; then
    echo "Failed to fetch latest version. Please check your network connection."
    exit 1
fi

echo "Latest version: ${LATEST_RELEASE}"

# 下载二进制文件
DOWNLOAD_URL="https://github.com/${REPO}/releases/download/${LATEST_RELEASE}/${BINARY_NAME}"
echo "Downloading: ${DOWNLOAD_URL}"

curl -L -o tally "${DOWNLOAD_URL}"
chmod +x tally

echo ""
echo "Installation complete!"
echo "Run ./tally to start the server"
echo "Default port: 8080"
echo "Default credentials: admin / password"
