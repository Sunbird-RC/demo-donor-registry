package server

import (
	"certificate-pdf/config"
	"certificate-pdf/controllers"
	"certificate-pdf/middlewares"
	"github.com/gin-gonic/gin"
)

func NewRouter() *gin.Engine {
	gin.SetMode(config.Config.MODE)
	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	health := new(controllers.HealthController)

	router.GET("/health", health.Status)
	router.Use(middlewares.AuthMiddleware())

	v1 := router.Group("/api/v1/")
	{
		certificateAPI := controllers.CertificateAPI{}
		v1.POST("certificatePDF", certificateAPI.CreatePDFCertificateHandler)
	}
	return router

}
