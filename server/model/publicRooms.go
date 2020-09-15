package model

import (
	"github.com/jinzhu/gorm"
)

type Publicroom struct {
	gorm.Model
	Roomname string `gorm:"type:varchar(100)" json:"name" binding:"required"`
}