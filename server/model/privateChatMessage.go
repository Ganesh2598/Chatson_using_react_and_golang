package model

import (
	"github.com/jinzhu/gorm"
)

type PrivateChatMessage struct {
	gorm.Model
	Roomname string `gorm:"type:varchar(100)" json:"roomname" binding:"required"`
	User string `gorm:"type:varchar(100)" json:"user" binding:"required"`
	Message string `gorm:"type:varchar(100)" json:"message" binding:"required"`
}