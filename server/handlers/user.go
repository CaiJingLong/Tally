package handlers

import (
	"net/http"

	"tally/database"
	"tally/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type UpdateUsernameRequest struct {
	NewUsername string `json:"new_username" binding:"required"`
}

type UpdatePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=6"`
}

type UserInfoResponse struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
}

// GetCurrentUser 获取当前用户信息
func GetCurrentUser(c *gin.Context) {
	userID := uint(c.MustGet("user_id").(float64))

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, UserInfoResponse{
		ID:       user.ID,
		Username: user.Username,
	})
}

// UpdateUsername 修改用户名
func UpdateUsername(c *gin.Context) {
	userID := uint(c.MustGet("user_id").(float64))

	var req UpdateUsernameRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// 检查新用户名是否已存在
	var existingUser models.User
	if err := database.DB.Where("username = ? AND id != ?", req.NewUsername, userID).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
		return
	}

	// 更新用户名
	if err := database.DB.Model(&models.User{}).Where("id = ?", userID).Update("username", req.NewUsername).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update username"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Username updated successfully"})
}

// UpdatePassword 修改密码
func UpdatePassword(c *gin.Context) {
	userID := uint(c.MustGet("user_id").(float64))

	var req UpdatePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request, password must be at least 6 characters"})
		return
	}

	// 获取当前用户
	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// 验证旧密码
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.OldPassword)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid old password"})
		return
	}

	// 生成新密码哈希
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// 更新密码
	if err := database.DB.Model(&models.User{}).Where("id = ?", userID).Update("password", string(hashedPassword)).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password updated successfully"})
}
