package handlers

import (
	"net/http"
	"sort"
	"time"

	"tally/database"
	"tally/models"

	"github.com/gin-gonic/gin"
)

type CreateResourceRequest struct {
	Name      string `json:"name" binding:"required"`
	GroupName string `json:"group"`
	ExpireAt  int64  `json:"expire_at" binding:"required"` // Unix 时间戳
}

type RenewRequest struct {
	Days     *int   `json:"days"`
	ExpireAt *int64 `json:"expire_at"` // Unix 时间戳
}

type UpdateResourceRequest struct {
	Name      *string `json:"name"`
	GroupName *string `json:"group"`
	ExpireAt  *int64  `json:"expire_at"` // Unix 时间戳
}

// GetResources 获取所有资源
func GetResources(c *gin.Context) {
	var resources []models.Resource
	if err := database.DB.Find(&resources).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch resources"})
		return
	}

	// 转换为响应格式并按到期时间排序
	responses := make([]models.ResourceResponse, len(resources))
	for i, r := range resources {
		responses[i] = r.ToResponse()
	}

	// 按到期时间升序排列（快到期的在前）
	sort.Slice(responses, func(i, j int) bool {
		return responses[i].ExpireAt < responses[j].ExpireAt
	})

	c.JSON(http.StatusOK, responses)
}

// CreateResource 创建新资源
func CreateResource(c *gin.Context) {
	var req CreateResourceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	resource := models.Resource{
		Name:      req.Name,
		GroupName: req.GroupName,
		ExpireAt:  time.Unix(req.ExpireAt, 0),
	}

	if err := database.DB.Create(&resource).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create resource"})
		return
	}

	c.JSON(http.StatusCreated, resource.ToResponse())
}

// RenewResource 续约资源
func RenewResource(c *gin.Context) {
	id := c.Param("id")

	var req RenewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// 必须提供 days 或 expire_at 其中之一
	if req.Days == nil && req.ExpireAt == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Must provide either 'days' or 'expire_at'"})
		return
	}

	var resource models.Resource
	if err := database.DB.First(&resource, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Resource not found"})
		return
	}

	// 更新到期时间
	if req.ExpireAt != nil {
		resource.ExpireAt = time.Unix(*req.ExpireAt, 0)
	} else if req.Days != nil {
		// 如果已过期，从今天开始计算；否则从当前到期日开始
		baseTime := resource.ExpireAt
		if baseTime.Before(time.Now()) {
			baseTime = time.Now()
		}
		resource.ExpireAt = baseTime.AddDate(0, 0, *req.Days)
	}

	if err := database.DB.Save(&resource).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to renew resource"})
		return
	}

	c.JSON(http.StatusOK, resource.ToResponse())
}

// UpdateResource 更新资源信息
func UpdateResource(c *gin.Context) {
	id := c.Param("id")

	var req UpdateResourceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	var resource models.Resource
	if err := database.DB.First(&resource, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Resource not found"})
		return
	}

	// 更新提供的字段
	if req.Name != nil {
		resource.Name = *req.Name
	}
	if req.GroupName != nil {
		resource.GroupName = *req.GroupName
	}
	if req.ExpireAt != nil {
		resource.ExpireAt = time.Unix(*req.ExpireAt, 0)
	}

	if err := database.DB.Save(&resource).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update resource"})
		return
	}

	c.JSON(http.StatusOK, resource.ToResponse())
}

// DeleteResource 删除资源
func DeleteResource(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.Resource{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete resource"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Resource deleted"})
}

// GetGroups 获取所有唯一分组名
func GetGroups(c *gin.Context) {
	var groups []string
	if err := database.DB.Model(&models.Resource{}).
		Distinct().
		Where("group_name != '' AND group_name IS NOT NULL").
		Pluck("group_name", &groups).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch groups: " + err.Error()})
		return
	}

	if groups == nil {
		groups = []string{}
	}
	c.JSON(http.StatusOK, groups)
}

// BackupResource 备份资源结构
type BackupResource struct {
	Name      string `json:"name"`
	GroupName string `json:"group"`
	ExpireAt  int64  `json:"expire_at"`
	CreatedAt int64  `json:"created_at"`
}

// BackupData 备份数据结构
type BackupData struct {
	Version   string           `json:"version"`
	ExportAt  int64            `json:"export_at"`
	Resources []BackupResource `json:"resources"`
}

// ExportBackup 导出所有资源为 JSON 备份
func ExportBackup(c *gin.Context) {
	var resources []models.Resource
	if err := database.DB.Find(&resources).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch resources"})
		return
	}

	backup := BackupData{
		Version:   "1.0",
		ExportAt:  time.Now().Unix(),
		Resources: make([]BackupResource, len(resources)),
	}

	for i, r := range resources {
		backup.Resources[i] = BackupResource{
			Name:      r.Name,
			GroupName: r.GroupName,
			ExpireAt:  r.ExpireAt.Unix(),
			CreatedAt: r.CreatedAt.Unix(),
		}
	}

	c.JSON(http.StatusOK, backup)
}

// ImportBackupRequest 导入备份请求
type ImportBackupRequest struct {
	Mode string     `json:"mode" binding:"required"` // "overwrite" 或 "append"
	Data BackupData `json:"data" binding:"required"`
}

// ImportBackup 从 JSON 备份还原资源
func ImportBackup(c *gin.Context) {
	var req ImportBackupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	// 验证模式
	if req.Mode != "overwrite" && req.Mode != "append" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Mode must be 'overwrite' or 'append'"})
		return
	}

	// 如果是覆盖模式，先删除所有现有资源
	if req.Mode == "overwrite" {
		if err := database.DB.Exec("DELETE FROM resources").Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear existing resources"})
			return
		}
	}

	// 导入资源
	imported := 0
	for _, r := range req.Data.Resources {
		resource := models.Resource{
			Name:      r.Name,
			GroupName: r.GroupName,
			ExpireAt:  time.Unix(r.ExpireAt, 0),
		}
		// 如果有 created_at，使用它；否则使用当前时间
		if r.CreatedAt > 0 {
			resource.CreatedAt = time.Unix(r.CreatedAt, 0)
		}

		if err := database.DB.Create(&resource).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":    "Failed to import resource: " + r.Name,
				"imported": imported,
			})
			return
		}
		imported++
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Backup restored successfully",
		"imported": imported,
		"mode":     req.Mode,
	})
}
