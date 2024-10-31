package config

import (
	"log"
	"os"

	"github.com/spf13/viper"
)

func LoadConfigENV() {
	var err error
	currDir, err := os.Getwd()
	if err != nil {
		log.Panic("Unable to load curr dir", err)
	}
	viper.SetConfigFile(currDir + "/.env")
	//viper.SetConfigType("")
	err = viper.ReadInConfig()
	if err != nil {
		log.Panic("Unable to Read Config")
	}

}

func GetEnv(key string) string {
	val := viper.Get(key)
	if val == nil {
		log.Panic("NO ENV FOUND: Key", key)
	}
	return val.(string)
}
