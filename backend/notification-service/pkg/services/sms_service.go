package services

import (
	"bytes"
	"encoding/json"
	"errors"
	"github.com/imroc/req"
	log "github.com/sirupsen/logrus"
	"github.com/sunbirdrc/notification-service/config"
	"strings"
	"text/template"
)

type SMSRequest struct {
	Message    string `json:"message"`
	TemplateID string `json:"templateId"`
}

func SendSMS(mobileNumber string, message string) (map[string]interface{}, error) {
	if config.Config.SmsAPI.Enable {
		smsRequest := SMSRequest{}
		err := json.Unmarshal([]byte(message), &smsRequest)
		header := req.Header{
			"authkey":      config.Config.SmsAPI.AuthKey,
			"Content-Type": "application/json",
		}
		queryParam := req.QueryParam{
			"username":    config.Config.SmsAPI.UserName,
			"password":    config.Config.SmsAPI.Password,
			"type":        5,
			"dlr":         1,
			"destination": "91" + mobileNumber,
			"source":      config.Config.SmsAPI.Source,
			"message":     smsRequest.Message,
			"entityid":    config.Config.SmsAPI.EntityId,
			"tempid":      smsRequest.TemplateID,
		}
		log.Info("SMS request ", config.Config.SmsAPI.URL, header)
		response, err := req.Post(config.Config.SmsAPI.URL, header, queryParam)
		if err != nil {
			log.Errorf("SMS API failed %+v", err)
			return nil, nil
		}
		if response.Response().StatusCode != 200 {
			responseStr, _ := response.ToString()
			return nil, errors.New(responseStr)
		}
		responseStr, err := response.ToString()
		if !strings.HasPrefix(responseStr, "1701") {
			return nil, errors.New("Sending SMS failed with status" + responseStr)
		}
		responseObject := map[string]interface{}{}
		err = response.ToJSON(&responseObject)
		if err != nil {
			return nil, nil
		}
		log.Infof("Response %+v", responseObject)
		if responseObject["a"] != "SUCCESSFUL" {
			log.Infof("Response %+v", responseObject)
			return nil, nil
		}
		return responseObject, nil
	}
	log.Infof("SMS notifier disabled")
	return nil, nil
}

func GetSmsRequestPayload(message string, mobileNumber string) map[string]interface{} {
	smsRequestTemplate := template.Must(template.New("").Parse(config.Config.SmsAPI.RequestTemplate))
	buf := bytes.Buffer{}
	if err := smsRequestTemplate.Execute(&buf, map[string]interface{}{
		"message": message,
		"to":      mobileNumber,
	}); err == nil {
		smsRequest := make(map[string]interface{})
		if err = json.Unmarshal(buf.Bytes(), &smsRequest); err == nil {
			return smsRequest
		} else {
			log.Error(err)
		}
	}
	return nil
}
