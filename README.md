# Tally

[English](./README_EN.md) | 简体中文

一个简洁的资源到期时间管理应用，帮助你追踪各类资源（如域名、服务器、订阅等）的到期时间。

> **声明**：本项目为个人自用项目，不承诺任何功能修复、新功能开发或技术支持。项目可能随时发生 Breaking Change，请自行评估风险后使用。

## 功能特性

- 用户登录认证（JWT）
- 资源管理（添加、编辑、删除、续约）
- 分组筛选和高级搜索（支持拼音、Glob、正则）
- 到期时间提醒（剩余天数高亮显示）
- 数据备份与还原
- 响应式 UI 设计（移动端/桌面端）
- 多语言支持（中文/英文）
- 单文件部署（前端嵌入二进制）

## 技术栈

- **后端**: Go + Gin + GORM + SQLite
- **前端**: React + TypeScript + Tailwind CSS + Vite

## 快速开始

### 方式一：一键安装（推荐）

```bash
# Linux / macOS
curl -fsSL https://raw.githubusercontent.com/CaiJingLong/Tally/main/tools/install.sh | bash

# Windows (PowerShell)
iwr -useb https://raw.githubusercontent.com/CaiJingLong/Tally/main/tools/install.ps1 | iex
```

### 方式二：单文件部署

```bash
# macOS
chmod +x build.sh
./build.sh
./output/tally-darwin-arm64

# Linux
chmod +x build-linux.sh
./build-linux.sh
./output/tally-linux-amd64
```

访问 `http://localhost:8080`，默认账号：`admin` / `password`

### 方式二：开发模式

```bash
# 启动后端
cd server
go mod tidy
go run main.go

# 启动前端（新终端）
cd web
bun install
bun run dev
```

前端开发服务器：`http://localhost:5173`

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/login | 用户登录 |
| GET | /api/resources | 获取资源列表 |
| POST | /api/resources | 创建资源 |
| PUT | /api/resources/:id | 更新资源 |
| PATCH | /api/resources/:id/renew | 续约资源 |
| DELETE | /api/resources/:id | 删除资源 |
| GET | /api/groups | 获取分组列表 |
| GET | /api/backup | 导出 JSON 备份 |
| POST | /api/backup/restore | 还原 JSON 备份 |

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| PORT | 8080 | 服务端口 |
| GIN_MODE | debug | Gin 运行模式 |
| JWT_SECRET | tally-secret-key-change-in-production | JWT 密钥（生产环境请修改） |

## 数据存储

使用 SQLite，数据文件存储在 `data.db`（与二进制同目录）。

## 许可证

[MIT License](./LICENSE)
