package database

import (
	"log"

	"tally/config"
	"tally/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	var err error
	DB, err = gorm.Open(sqlite.Open(config.DatabasePath), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect database:", err)
	}

	// 自动迁移
	if err := DB.AutoMigrate(&models.User{}, &models.Resource{}); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// 初始化默认用户
	initDefaultUser()
}

func initDefaultUser() {
	var count int64
	DB.Model(&models.User{}).Count(&count)
	if count == 0 {
		hashedPassword, err := bcrypt.GenerateFromPassword(
			[]byte(config.DefaultPassword),
			bcrypt.DefaultCost,
		)
		if err != nil {
			log.Fatal("Failed to hash password:", err)
		}

		user := models.User{
			Username: config.DefaultUsername,
			Password: string(hashedPassword),
		}
		if err := DB.Create(&user).Error; err != nil {
			log.Fatal("Failed to create default user:", err)
		}
		log.Printf("Created default user: %s", config.DefaultUsername)
	}
}
