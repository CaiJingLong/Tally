package models

import (
	"math"
	"time"
)

type Resource struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"not null" json:"name"`
	GroupName string    `gorm:"column:group_name;index" json:"group"`
	ExpireAt  time.Time `gorm:"not null" json:"expire_at"`
	CreatedAt time.Time `json:"created_at"`
}

// ResourceResponse 包含计算后的剩余天数，时间使用 Unix 时间戳
type ResourceResponse struct {
	ID            uint   `json:"id"`
	Name          string `json:"name"`
	GroupName     string `json:"group"`
	ExpireAt      int64  `json:"expire_at"`
	CreatedAt     int64  `json:"created_at"`
	RemainingDays int    `json:"remaining_days"`
}

// ToResponse 转换为响应格式，计算剩余天数，时间转为 Unix 时间戳
func (r *Resource) ToResponse() ResourceResponse {
	now := time.Now()
	duration := r.ExpireAt.Sub(now)
	days := int(math.Ceil(duration.Hours() / 24))

	return ResourceResponse{
		ID:            r.ID,
		Name:          r.Name,
		GroupName:     r.GroupName,
		ExpireAt:      r.ExpireAt.Unix(),
		CreatedAt:     r.CreatedAt.Unix(),
		RemainingDays: days,
	}
}
