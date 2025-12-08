#!/bin/bash

# Tally 单文件打包脚本
# 将前端代码嵌入到 Go 二进制中
# 使用纯 Go SQLite 驱动，支持跨平台编译

set -e

echo "=== Tally Build Script ==="

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

# Step 3: 构建 Go 二进制
echo -e "${YELLOW}[3/3] Building Go binary...${NC}"
cd "$SERVER_DIR"
go mod tidy

# 获取版本信息
VERSION=$(date +%Y%m%d)
BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# 构建不同平台（使用纯 Go SQLite，禁用 CGO）
echo "Building for macOS (arm64)..."
CGO_ENABLED=0 GOOS=darwin GOARCH=arm64 go build -ldflags="-s -w -X main.Version=$VERSION -X main.BuildTime=$BUILD_TIME" -o "$OUTPUT_DIR/tally-darwin-arm64" .

echo "Building for macOS (amd64)..."
CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 go build -ldflags="-s -w -X main.Version=$VERSION -X main.BuildTime=$BUILD_TIME" -o "$OUTPUT_DIR/tally-darwin-amd64" .

echo -e "${GREEN}=== Build Complete ===${NC}"
echo "Output files:"
ls -lh "$OUTPUT_DIR"
