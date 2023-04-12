package main

import (
	"certificate-pdf/cache"
	"certificate-pdf/config"
	"certificate-pdf/server"
	"fmt"
	log "github.com/sirupsen/logrus"
)

func main() {
	config.Initialize()
	cache.Initialize()
	ll, err := log.ParseLevel(config.Config.LogLevel)
	if err != nil {
		fmt.Print("Failed parsing log level")
	}
	log.SetLevel(ll)
	log.Info("Log level: %s", config.Config.LogLevel)
	server.Init()
}
