package controllers

import (
	"certificate-pdf/services"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
)

type CertificateAPI struct {
}

func (d CertificateAPI) GetCertificateHandler(c *gin.Context) {
	log.Info("Get GetCertificate API triggered")
	services.GetCertificate(c)

}
