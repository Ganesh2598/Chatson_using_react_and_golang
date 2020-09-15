package database

import (
	"github.com/jinzhu/gorm"
	_ "github.com/go-sql-driver/mysql"
	"log"
	"../model"
	"os"
	"github.com/joho/godotenv"
)

var Db *gorm.DB = nil
var err error

func Connection()  {

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	Db, err = gorm.Open(os.Getenv("DB"),os.Getenv("DBUSER")+":"+os.Getenv("DBPASSWORD")+"@/"+os.Getenv("DBNAME")+"?parseTime=true")
	if err != nil {
		log.Fatal("Not Connected",err)
	}

	Db.AutoMigrate(&model.Request{})
	Db.AutoMigrate(&model.User{})
	Db.AutoMigrate(&model.Publicroom{})
	Db.AutoMigrate(&model.Privateroom{})
	Db.AutoMigrate(&model.Message{})
	Db.AutoMigrate(&model.Privatechat{})
	Db.AutoMigrate(&model.PrivateChatMessage{})
	Db.LogMode(true)

}