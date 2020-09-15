package model

import (
	"github.com/jinzhu/gorm"
)

type Privatechat struct {
	gorm.Model
	Roomname string `gorm:"type:varchar(100)" json:"roomname" binding:"required"`
	Sender string `gorm:"type:varchar(100)" json:"sender" binding:"required"`
	Receiver string `gorm:"type:varchar(100)" json:"receiver" binding:"required"`
}