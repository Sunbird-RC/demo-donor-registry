package controllers

import (
	"certificate-pdf/services"
	"encoding/json"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"net/http"
)

type CertificateAPI struct {
}

type ErrorResponse struct {
	Status  string `json:"status"`
	Message string `json:"message"`
}

func (c CertificateAPI) CreatePDFCertificateHandler(context *gin.Context) {
	log.Info("Get CreatePDFCertificate API triggered")
	var certificateRequest services.CreateCertificateRequest
	if err := json.NewDecoder(context.Request.Body).Decode(&certificateRequest); err != nil {
		context.JSON(http.StatusBadRequest, err)
		return
	}
	acceptHeader := context.GetHeader("Accept")
	certificateBytes, err := services.CreatePDFCertificate(certificateRequest, acceptHeader)
	if err != nil {
		log.Errorf("Error in creating certificate pdf")
		context.JSON(500, getErrorResponseObject(err))
	} else {
		context.Data(200, acceptHeader, certificateBytes)
	}
}

func getErrorResponseObject(err error) ErrorResponse {
	var errorResponse ErrorResponse
	errorResponse.Message = err.Error()
	errorResponse.Status = "500"
	return errorResponse
}
