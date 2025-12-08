package main

import (
	"log"
	"os"

	"tally/config"
	"tally/database"
	"tally/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
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
		AllowMethods:     []string{"GET", "POST", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// 注册路由
	routes.SetupRoutes(r)

	// 生产模式下托管前端静态文件
	if os.Getenv("GIN_MODE") == "release" {
		r.Static("/assets", "./dist/assets")
		r.StaticFile("/", "./dist/index.html")
		r.NoRoute(func(c *gin.Context) {
			c.File("./dist/index.html")
		})
	}

	port := config.GetPort()
	log.Printf("Server running on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
