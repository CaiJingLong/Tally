package main

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
	"os"
	"strings"

	"tally/config"
	"tally/database"
	"tally/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// 嵌入前端构建产物
//
//go:embed dist/*
var distFS embed.FS

// 版本信息（通过 ldflags 注入）
var (
	Version   = "dev"
	BuildTime = "unknown"
)

func main() {
	// 初始化数据库
	database.InitDB()

	// 设置 Gin 模式
	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()

	// CORS 配置（开发模式）
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// 注册 API 路由
	routes.SetupRoutes(r)

	// 托管嵌入的前端静态文件
	setupStaticFiles(r)

	port := config.GetPort()
	log.Printf("Tally Server v%s (built: %s)", Version, BuildTime)
	log.Printf("Server running on http://localhost:%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

// setupStaticFiles 配置静态文件服务
func setupStaticFiles(r *gin.Engine) {
	// 从嵌入的文件系统中获取 dist 子目录
	distSubFS, err := fs.Sub(distFS, "dist")
	if err != nil {
		log.Printf("Warning: No embedded dist folder found, static files disabled")
		return
	}

	// 创建文件服务器
	fileServer := http.FileServer(http.FS(distSubFS))

	// 处理静态文件请求
	r.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path

		// API 路由不处理
		if strings.HasPrefix(path, "/api") {
			c.JSON(http.StatusNotFound, gin.H{"error": "Not found"})
			return
		}

		// 尝试提供静态文件
		// 检查文件是否存在
		if f, err := distSubFS.Open(strings.TrimPrefix(path, "/")); err == nil {
			f.Close()
			fileServer.ServeHTTP(c.Writer, c.Request)
			return
		}

		// 对于 SPA，所有非文件请求都返回 index.html
		c.Request.URL.Path = "/"
		fileServer.ServeHTTP(c.Writer, c.Request)
	})
}
