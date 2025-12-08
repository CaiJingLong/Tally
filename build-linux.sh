#!/bin/bash

# Tally Linux x86_64 交叉编译脚本
# 使用纯 Go SQLite 驱动，无需 CGO，可直接交叉编译

set -e

echo "=== Tally Linux Build Script ==="

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目根目录
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
WEB_DIR="$ROOT_DIR/web"
SERVER_DIR="$ROOT_DIR/server"
OUTPUT_DIR="$ROOT_DIR/output"

# 创建输出目录
mkdir -p "$OUTPUT_DIR"

# Step 1: 构建前端
echo -e "${YELLOW}[1/3] Building frontend...${NC}"
cd "$WEB_DIR"
bun install
bun run build

# Step 2: 复制前端构建产物到 server/dist
echo -e "${YELLOW}[2/3] Copying frontend assets...${NC}"
rm -rf "$SERVER_DIR/dist"
cp -r "$WEB_DIR/dist" "$SERVER_DIR/dist"

# Step 3: 交叉编译 Linux 版本
echo -e "${YELLOW}[3/3] Cross-compiling for Linux x86_64...${NC}"

# 获取版本信息
VERSION=$(date +%Y%m%d)
BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

cd "$SERVER_DIR"
go mod tidy

# 使用纯 Go SQLite 驱动，禁用 CGO 进行交叉编译
echo "Building for Linux amd64..."
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-s -w -X main.Version=$VERSION -X main.BuildTime=$BUILD_TIME" \
    -o "$OUTPUT_DIR/tally-linux-amd64" .

echo -e "${GREEN}=== Build Complete ===${NC}"
echo "Output file:"
ls -lh "$OUTPUT_DIR/tally-linux-amd64"

echo ""
echo "Usage:"
echo "  scp $OUTPUT_DIR/tally-linux-amd64 user@server:/path/to/app/"
echo "  ssh user@server 'chmod +x /path/to/app/tally-linux-amd64 && /path/to/app/tally-linux-amd64'"
