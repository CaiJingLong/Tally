# Tally

English | [简体中文](./README.md)

A simple resource expiration management application to help you track the expiration dates of various resources (such as domains, servers, subscriptions, etc.).

> **Disclaimer**: This is a personal project for my own use. No commitment is made for bug fixes, new features, or technical support. Breaking changes may occur at any time. Use at your own risk.

## Features

- User authentication (JWT)
- Resource management (add, edit, delete, renew)
- Group filtering and advanced search (supports pinyin, glob, regex)
- Expiration reminders (remaining days highlighted)
- Data backup and restore
- Responsive UI design (mobile/desktop)
- Multi-language support (Chinese/English)
- Single-file deployment (frontend embedded in binary)

## Tech Stack

- **Backend**: Go + Gin + GORM + SQLite
- **Frontend**: React + TypeScript + Tailwind CSS + Vite

## Quick Start

### Option 1: Single-file Deployment (Recommended)

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

Visit `http://localhost:8080`, default credentials: `admin` / `password`

### Option 2: Development Mode

```bash
# Start backend
cd server
go mod tidy
go run main.go

# Start frontend (new terminal)
cd web
bun install
bun run dev
```

Frontend dev server: `http://localhost:5173`

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/login | User login |
| GET | /api/resources | Get resource list |
| POST | /api/resources | Create resource |
| PUT | /api/resources/:id | Update resource |
| PATCH | /api/resources/:id/renew | Renew resource |
| DELETE | /api/resources/:id | Delete resource |
| GET | /api/groups | Get group list |
| GET | /api/backup | Export JSON backup |
| POST | /api/backup/restore | Restore JSON backup |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 8080 | Server port |
| GIN_MODE | debug | Gin run mode |
| JWT_SECRET | tally-secret-key-change-in-production | JWT secret (change in production) |

## Data Storage

Uses SQLite, data file stored at `data.db` (same directory as binary).

## License

[MIT License](./LICENSE)
