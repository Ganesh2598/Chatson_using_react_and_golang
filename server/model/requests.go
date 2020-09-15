package model

import (
	"github.com/jinzhu/gorm"
)

type Request struct {
	gorm.Model
	Toname string `gorm:"type:varchar(100)" json:"to" binding:"required"`
	Roomname string `gorm:"type:varchar(100)" json:"name" binding:"required"`
	Fromname string `gorm:"type:varchar(100)" json:"from" binding:"required"`
}