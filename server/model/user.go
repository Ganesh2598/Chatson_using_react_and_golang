package model

import (
	"github.com/jinzhu/gorm"
)

type User struct {
	gorm.Model
	Name string `gorm:"type:varchar(100)" json:"name" binding:"required"`
	Email string `gorm:"type:varchar(100)" json:"email" binding:"required"`
	Password string `gorm:"type:varchar(100)" json:"password" binding:"required"`
}
