# Tally - 资源到期管理系统

一个简洁的资源到期时间管理应用，帮助你追踪各类资源（如域名、服务器、订阅等）的到期时间。

## 技术栈

- **后端**: Go + Gin + GORM + SQLite
- **前端**: React + TypeScript + Tailwind CSS + Vite

## 功能特性

- 用户登录认证（JWT）
- 资源管理（添加、删除、续约）
- 分组筛选和搜索
- 到期时间提醒（剩余天数高亮显示）
- 响应式 UI 设计

## 快速开始

### 后端

```bash
cd server
go mod tidy
go run main.go
```

后端服务将在 `http://localhost:8080` 启动。

默认账号：`admin` / `password`

### 前端（开发模式）

```bash
cd web
bun install
bun run dev
```

前端开发服务器将在 `http://localhost:5173` 启动，API 请求会自动代理到后端。

### 单文件打包部署

使用打包脚本生成包含前端的单文件二进制：

```bash
chmod +x build.sh
./build.sh
```

生成的二进制文件在 `output/` 目录，可直接运行：

```bash
./output/tally-darwin-arm64
```

### 手动生产部署

1. 构建前端：
```bash
cd web
bun run build
```

2. 将 `web/dist` 目录复制到 `server/dist`

3. 以生产模式启动后端：
```bash
cd server
GIN_MODE=release go run main.go
```

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

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| PORT | 8080 | 服务端口 |
| GIN_MODE | debug | Gin 运行模式 |
| JWT_SECRET | tally-secret-key-change-in-production | JWT 密钥 |

## 数据库

使用 SQLite，数据文件存储在 `server/data.db`。
