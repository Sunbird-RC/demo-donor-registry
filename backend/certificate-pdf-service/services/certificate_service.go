package services

import (
	"archive/zip"
	"bytes"
	"certificate-pdf/cache"
	"certificate-pdf/config"
	"compress/flate"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"text/template"
	"time"

	"github.com/coderhaoxin/handlebars"
	"github.com/signintech/gopdf"
	log "github.com/sirupsen/logrus"
	"github.com/skip2/go-qrcode"
)

const URL = "URL"
const URLW3CVC = "URL_W3C_VC"

type Certificate struct {
	Context         []string `json:"@context"`
	Type            []string `json:"type"`
	IssuanceDate    string   `json:"issuanceDate"`
	NonTransferable string   `json:"nonTransferable"`
	Issuer          string   `json:"issuer"`
	Id              string   `json:"id"`
	Proof           struct {
		Type               string    `json:"type"`
		Created            time.Time `json:"created"`
		VerificationMethod string    `json:"verificationMethod"`
		ProofPurpose       string    `json:"proofPurpose"`
		Jws                string    `json:"jws"`
	} `json:"proof"`
	CredentialSubject struct {
		Type       string `json:"type"`
		Dob        string `json:"dob"`
		BloodGroup string `json:"bloodGroup"`
		Name       string `json:"name"`
		Gender     string `json:"gender"`
		FatherName string `json:"fatherName"`
		NottoId    string `json:"nottoId"`
		Id         string `json:"id"`
		Emergency  struct {
			Name          string `json:"name"`
			MobileNumber  string `json:"mobileNumber"`
			Relation      string `json:"relation"`
			OtherRelation string `json:"otherRelation"`
		} `json:"emergency"`
		Pledge struct {
			AdditionalOrgans string `json:"additionalOrgans"`
			Organs           string `json:"organs"`
			Tissues          string `json:"tissues"`
			Type             string `json:"type"`
		} `json:"pledge"`
		Address struct {
			AddressLine1 string `json:"addressLine1"`
			AddressLine2 string `json:"addressLine2"`
			Country      string `json:"country"`
			District     string `json:"district"`
			Pincode      string `json:"pincode"`
			State        string `json:"state"`
		} `json:"address"`
	} `json:"credentialSubject"`
	Evidence []struct {
		EvidenceDocument string   `json:"evidenceDocument"`
		RefId            string   `json:"refId"`
		SubjectPresence  string   `json:"subjectPresence"`
		Type             []string `json:"type"`
		Verifier         string   `json:"verifier"`
	} `json:"evidence"`
	QrCode           string
	Photo            string
	EmergencyContact string
}

type entityMap map[string]interface{}

func (e entityMap) getMap(key string) entityMap {
	return e[key].(map[string]interface{})
}

func (e entityMap) getValue(key string) string {
	return e[key].(string)
}

type CreateCertificateRequest struct {
	Certificate string    `json:"certificate"`
	Entity      entityMap `json:"entity"`
	EntityId    string    `json:"entityId"`
	EntityName  string    `json:"entityName"`
	TemplateUrl string    `json:"templateUrl"`
}

type StringTemplate string

func (s StringTemplate) render(data any) (string, error) {
	tmpl, err := template.New("template").Parse(string(s))
	if err != nil {
		log.Error("Error while reading the template string,", err)
		return "", err
	}
	buf := bytes.Buffer{}
	err = tmpl.Execute(&buf, data)
	if err != nil {
		log.Error("Error while executing template string,", err)
		return "", err
	}
	return buf.String(), nil
}

type ConfigType string

var TextConfigType ConfigType = "Text"
var ImageConfigType ConfigType = "Image"

type CertificateDataConfig struct {
	x          float64
	y          float64
	fontSize   float64
	width      float64
	height     float64
	template   StringTemplate
	image      []byte
	formatter  func(string) (string, error)
	configType ConfigType
}

func (c CertificateDataConfig) getConfigType() ConfigType {
	if c.configType == "" {
		return TextConfigType
	} else {
		return c.configType
	}
}

var landscapeDataList []CertificateDataConfig
var portraitDataList = []CertificateDataConfig{
	{
		x:        206,
		y:        238,
		fontSize: 18,
		template: "{{.CredentialSubject.Name}}",
		width:    0,
	},
	{
		x:        205,
		y:        409,
		fontSize: 11,
		template: "{{.CredentialSubject.FatherName}}",
		width:    112,
	},
	{
		x:        205,
		y:        644,
		fontSize: 11,
		template: "{{.IssuanceDate}}",
		width:    0,
		formatter: func(text string) (string, error) {
			date, err := time.Parse(time.RFC3339, text)
			if err != nil {
				log.Error("Error while parsing time", err)
				return "", err
			}
			return date.Format("02 Jan 2006"), nil
		},
	},
	{
		x:        205,
		y:        447,
		fontSize: 11,
		template: "{{ (index .Evidence 0).RefId}}",
		width:    0,
	},
	{
		x:        487.21,
		y:        447,
		fontSize: 11,
		template: "{{.CredentialSubject.BloodGroup}}",
		width:    0,
	},
	{
		x:        205,
		y:        484,
		fontSize: 11,
		template: "{{.CredentialSubject.NottoId}}",
		width:    0,
	},
	{
		x:        487.21,
		y:        484,
		fontSize: 11,
		template: "{{.EmergencyContact}}",
		width:    0,
	},
	{
		x:        205,
		y:        524,
		fontSize: 11,
		template: "{{.CredentialSubject.Pledge.Organs}}",
		width:    0,
	},
	{
		x:        205,
		y:        564,
		fontSize: 11,
		template: "{{.CredentialSubject.Pledge.Tissues}}",
		width:    0,
	},
	{
		x:          153,
		y:          685,
		fontSize:   0,
		width:      119,
		height:     119,
		template:   "{{.QrCode}}",
		formatter:  nil,
		configType: ImageConfigType,
	},
	{
		x:          56,
		y:          235,
		fontSize:   0,
		width:      119,
		height:     126,
		template:   "{{.Photo}}",
		formatter:  nil,
		configType: ImageConfigType,
	},
}

func CreatePDFCertificate(certificateRequest CreateCertificateRequest, acceptType string) ([]byte, error) {
	qrCodeBytes, err := createQRCodeImage(certificateRequest)
	if err != nil {
		log.Error("Error create qr code", err)
		return nil, err
	}
	if acceptType == "application/pdf" {
		var certificateData Certificate
		if err := json.Unmarshal([]byte(certificateRequest.Certificate), &certificateData); err != nil {
			log.Error("%v", err)
			return nil, err
		}
		templateBytes, err := getPDFTemplate(certificateRequest.TemplateUrl, certificateData)
		if err != nil {
			log.Error("Error while fetching certificate template, ", err)
			return nil, err
		}
		certificateData.QrCode = string(qrCodeBytes)
		photoStr, err := base64.StdEncoding.DecodeString(
			certificateRequest.Entity.getMap("personalDetails").getValue("photo"))
		if err != nil {
			return nil, err
		}
		certificateData.Photo = string(photoStr)
		certificateData.EmergencyContact = certificateRequest.Entity.getMap("emergencyDetails").getValue("mobileNumber")

		if strings.Contains(certificateRequest.TemplateUrl, "portrait") {
			return renderDataToPDFTemplate(certificateData, portraitDataList, gopdf.PageSizeA4, templateBytes)
		} else {
			return renderDataToPDFTemplate(certificateData, landscapeDataList, gopdf.PageSizeA4Landscape, templateBytes)
		}
	} else if acceptType == "image/svg+xml" || acceptType == "text/html" {
		//TODO: logic not yet added
		return getCertificateInImage(certificateRequest, qrCodeBytes)
	}
	return nil, nil
}

func createQRCodeImage(certificateRequest CreateCertificateRequest) ([]byte, error) {
	qrData, err := getQRCodeData(certificateRequest)
	if err != nil {
		log.Error("Error getting qr code data", err)
		return nil, err
	}
	qrCode, err := qrcode.New(qrData, qrcode.Medium)
	if err != nil {
		log.Error("Error creating qr code object", err)
		return nil, err
	}
	imageBytes, err := qrCode.PNG(380)
	if err != nil {
		log.Error("Error creating qr code png image", err)
		return nil, err
	}
	return imageBytes, err
}

func getQRCodeData(certificateRequest CreateCertificateRequest) (string, error) {
	var qrData string
	if qrCodeType := config.Config.QrType; strings.ToUpper(qrCodeType) == URL {
		qrData = fmt.Sprintf("%s/certs/%s?t=%s&entity=%s%s", config.Config.CertDomainUrl,
			certificateRequest.EntityId, qrCodeType, certificateRequest.EntityName,
			config.Config.AdditionalQueryParams)
		qrData = config.Config.CertDomainUrl + "/certs/" + certificateRequest.EntityId + "?t=" + qrCodeType +
			"&entity=" + certificateRequest.EntityName + config.Config.AdditionalQueryParams
	} else {
		compressedBuffer, err := compress(certificateRequest.Certificate)
		if err != nil {
			log.Error("Error compressing certificate data", err)
			return "", err
		}
		if strings.ToUpper(qrCodeType) == URLW3CVC {
			qrData = fmt.Sprintf("%s/certs/%s?t=%s&data=%s&entity=%s%s", config.Config.CertDomainUrl,
				certificateRequest.EntityId, qrCodeType, compressedBuffer.String(), certificateRequest.EntityName,
				config.Config.AdditionalQueryParams)
		} else {
			qrData = compressedBuffer.String()
		}
	}
	return qrData, nil
}

func downloadFile(url string) ([]byte, error) {
	log.Infof("Downloading URL : %v", url)
	response, err := http.Get(url)
	if err != nil {
		log.Error("Error while downloading certificate template", err)
		return nil, err
	}
	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {
			log.Error("Error closing request body", err)
		}
	}(response.Body)

	if response.StatusCode != 200 {
		err := errors.New(fmt.Sprintf("received non 200 response code for URL %s", URL))
		log.Error("Error: ", err)
		return nil, err
	}
	if response.ContentLength == 0 {
		err := errors.New(fmt.Sprintf("Invalid template URL %s, received empty content", url))
		log.Error("Error", err)
		return nil, err
	}
	pdfBytes, err := io.ReadAll(response.Body)
	if err != nil {
		log.Error("Error while reading certificate template", err)
		return nil, err
	}
	return pdfBytes, nil
}

func getTemplateFile(certificateUrl string) ([]byte, error) {
	cachedCertificate, err := cache.GetCache(certificateUrl)
	if err != nil {
		log.Error("Error while getting value from cache, ", err)
	}
	if err != nil || cachedCertificate == nil {
		pdfBytes, err := downloadFile(certificateUrl)
		if err != nil {
			log.Error("Error while downloading file", err)
			return nil, err
		}
		err = cache.SetCacheWithoutExpiry(certificateUrl, pdfBytes)
		if err != nil {
			log.Error("Error while saving cache", err)
			return nil, err
		}
		return pdfBytes, nil
	}
	return cachedCertificate, nil
}

func renderDataToPDFTemplate(certificateData Certificate, dataConfigs []CertificateDataConfig, pageSize *gopdf.Rect,
	templateBytes []byte) ([]byte, error) {
	pdfService := NewPdfService(pageSize, templateBytes)
	err := pdfService.loadFonts()
	if err != nil {
		return nil, err
	}
	pdf := &pdfService.pdf

	for _, dataConfig := range dataConfigs {
		err := pdfService.setData(dataConfig, certificateData)
		if err != nil {
			log.Error("Error while setting data ", err)
			continue
		}
	}

	var b bytes.Buffer
	_ = pdf.Write(&b)
	return b.Bytes(), nil
}

func getPDFTemplate(templateUrl string, certificate Certificate) ([]byte, error) {
	templateUrl = modifyURLIfDataPresent(templateUrl, certificate)
	templateBytes, err := getTemplateFile(templateUrl)

	if err != nil {
		log.Error("Error while downloading certificate template", err)
		return nil, err
	}
	return templateBytes, nil
}

func modifyURLIfDataPresent(templateUrl string, certificate Certificate) string {
	withOtherOrgansSuffix := "with_other_organs.pdf"
	withoutOtherOrgansSuffix := "without_other_organs.pdf"
	if certificate.CredentialSubject.Pledge.AdditionalOrgans != "" {
		return fmt.Sprintf("%s%s", templateUrl, withOtherOrgansSuffix)
	} else {
		return fmt.Sprintf("%s%s", templateUrl, withoutOtherOrgansSuffix)
	}
}

func getCertificateInImage(certificateRequest CreateCertificateRequest, qrCode []byte) ([]byte, error) {
	var qrData string
	if qrCodeType := config.Config.QrType; strings.ToUpper(qrCodeType) == URL {
		qrData = config.Config.CertDomainUrl + "/certs/" + certificateRequest.EntityId + "?t=" + qrCodeType + "&entity=" +
			certificateRequest.EntityName + config.Config.AdditionalQueryParams
	} else {
		qrData, _ = getQRCodeImageBytes(certificateRequest.Certificate)
	}
	var certificateData map[string]interface{}
	err := json.Unmarshal([]byte(certificateRequest.Certificate), &certificateData)
	if err != nil {
		return nil, err
	}
	certificateData["qrCode"] = qrData
	// content, err := ioutil.ReadFile("./certificate.svg")
	// if err != nil {
	// 	return nil, err
	// }
	tpl := handlebars.RenderFile("./certificate.svg", certificateData)
	return []byte(tpl), nil
	// data, err := tpl.Exec(certificateData)
	// if err != nil {
	// 	return nil, err
	// }
	// return data, nil
}

func getQRCodeImageBytes(certificateText string) (string, error) {
	buf, err := compress(certificateText)

	qrCode, err := qrcode.New(buf.String(), qrcode.Medium)
	if err != nil {
		return "", err
	}
	imageBytes, err := qrCode.PNG(380)
	if err != nil {
		log.Printf("%v", err.Error())
	}
	return string(imageBytes[:]), err
}

func decompress(buf *bytes.Buffer, err error) {
	r, err := zip.NewReader(bytes.NewReader(buf.Bytes()), int64(buf.Len()))
	if err != nil {
		log.Error(err)
	}
	for _, f := range r.File {
		log.Infof("Contents of %s:\n", f.Name)
		rc, err := f.Open()
		if err != nil {
			log.Error(err)
		}
		_, err = io.CopyN(os.Stdout, rc, int64(buf.Len()))
		if err != nil {
			log.Fatal(err)
		}
		rc.Close()
	}
}

func compress(certificateText string) (*bytes.Buffer, error) {
	buf := new(bytes.Buffer)
	w := zip.NewWriter(buf)
	w.RegisterCompressor(zip.Deflate, func(out io.Writer) (io.WriteCloser, error) {
		return flate.NewWriter(out, flate.BestCompression)
	})
	f, err := w.Create("certificate.json")
	if err != nil {
		log.Error(err)
	}
	_, err = f.Write([]byte(certificateText))
	if err != nil {
		log.Error(err)
	}
	err = w.Close()
	if err != nil {
		log.Error(err)
	}
	return buf, err
}
