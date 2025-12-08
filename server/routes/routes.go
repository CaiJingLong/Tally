package routes

import (
	"tally/handlers"
	"tally/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		// 公开路由
		api.POST("/login", handlers.Login)

		// 需要认证的路由
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			protected.GET("/resources", handlers.GetResources)
			protected.POST("/resources", handlers.CreateResource)
			protected.PUT("/resources/:id", handlers.UpdateResource)
			protected.PATCH("/resources/:id/renew", handlers.RenewResource)
			protected.DELETE("/resources/:id", handlers.DeleteResource)
			protected.GET("/groups", handlers.GetGroups)
			protected.GET("/backup", handlers.ExportBackup)
			protected.POST("/backup/restore", handlers.ImportBackup)

			// 用户管理
			protected.GET("/user", handlers.GetCurrentUser)
			protected.PUT("/user/username", handlers.UpdateUsername)
			protected.PUT("/user/password", handlers.UpdatePassword)
		}
	}
}
