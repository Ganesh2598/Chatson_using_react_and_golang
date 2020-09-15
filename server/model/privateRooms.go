package model

import (
	"github.com/jinzhu/gorm"
)

type Privateroom struct {
	gorm.Model
	Roomname string `gorm:"type:varchar(100)" json:"roomname" binding:"required"`
	Username string `gorm:"type:varchar(100)" json:"username" binding:"required"`
	Admin string `gorm:"type:varchar(100)" json:"admin" binding:"required"`
	Status string `gorm:"type:varchar(100)" json:"status" binding:"required"`
	Privilege string `gorm:"type:varchar(100)" json:"privilege" binding:"required"`
}