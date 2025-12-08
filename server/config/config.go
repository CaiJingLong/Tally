package config

import "os"

const (
	DefaultPort      = "8080"
	JWTSecret        = "tally-secret-key-change-in-production"
	JWTExpireHours   = 24 * 7 // 7 天
	DefaultUsername  = "admin"
	DefaultPassword  = "password"
	DatabasePath     = "./data.db"
)

func GetPort() string {
	if port := os.Getenv("PORT"); port != "" {
		return port
	}
	return DefaultPort
}

func GetJWTSecret() string {
	if secret := os.Getenv("JWT_SECRET"); secret != "" {
		return secret
	}
	return JWTSecret
}
