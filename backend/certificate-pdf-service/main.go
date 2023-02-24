package main

import (
	"archive/zip"
	"bytes"
	"compress/flate"
	"encoding/base64"
	"encoding/json"
	"errors"
	"flag"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/coderhaoxin/handlebars"
	"github.com/gorilla/mux"
	"github.com/signintech/gopdf"
	log "github.com/sirupsen/logrus"
	"github.com/skip2/go-qrcode"
)

var addr = flag.String("listen-address", ":8003", "The address to listen on for HTTP requests.")

const URL = "URL"
const URL_W3C_VC = "URL_W3C_VC"

func main() {
	load()
	router := mux.NewRouter()
	router.HandleFunc("/api/v1/certificatePDF", getCertificate).Methods("POST")
	http.Handle("/", router)
	_ = http.ListenAndServe(*addr, nil)
}

func getCertificate(w http.ResponseWriter, r *http.Request) {
	accept := r.Header.Get("Accept")
	var body map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}
	bodyKeyUrl := []string{"templateUrl", "certificate", "entityName", "entityId", "entityName"}
	for i := range bodyKeyUrl {
		if _, ok := body[bodyKeyUrl[i]]; !ok {
			http.Error(w, "Required parameters missing", http.StatusBadRequest)
		}
	}
	templateUrl := body["templateUrl"].(string)[7:]
	certificate := body["certificate"]
	entityName := body["entityName"]
	entityId := body["entityId"]
	entity := body["entity"].(map[string]interface{})
	if accept == "application/pdf" {
		if pdfBytes, err := getCertificateInPDF(templateUrl, certificate.(string), entityName.(string), entityId.(string), entity); err != nil {
			log.Errorf("Error in creating certificate pdf")
		} else {
			w.WriteHeader(200)
			_, _ = w.Write(pdfBytes)
			return
		}
	} else if accept == "image/svg+xml" || accept == "text/html" {
		if certificate, err := getCertificateInImage(templateUrl, certificate.(string), entityName.(string), entityId.(string)); err != nil {
			log.Errorf("Error %v", err)
		} else {
			w.WriteHeader(200)
			_, _ = w.Write([]byte(certificate.(string)))
		}

	}
}

func getCertificateInPDF(templateUrl string, certificate string, entityName string, entityId string, entity map[string]interface{}) ([]byte, error) {
	var qrData string
	if qrCodeType := Config.QrType; strings.ToUpper(qrCodeType) == URL {
		qrData = Config.CertDomainUrl + "/certs/" + entityId + "?t=" + qrCodeType + "&entity=" + entityName + Config.AdditionalQueryParams
	} else {
		qrData, _ = getQRCodeImageBytes(certificate)
	}
	personalDetailsMap := entity["personalDetails"].(map[string]interface{})
	return renderToPDFTemplate(templateUrl, certificate, []byte(qrData), []byte(personalDetailsMap["photo"].(string)))
}

func DownloadFile(url string, fileName string) error {
	log.Printf("URL : %v", url)
	response, err := http.Get(url)
	if err != nil {
		return err
	}
	defer response.Body.Close()

	if response.StatusCode != 200 {
		return errors.New("Received non 200 response code")
	}
	//Create a empty file
	file, err := os.Create(fileName)
	if err != nil {
		return err
	}
	defer file.Close()

	//Write the bytes to the fiel
	_, err = io.Copy(file, response.Body)
	if err != nil {
		return err
	}
	return nil
}

func getTemplateFile(certificateUrl string, fileName string) error {
	_, err := os.Stat(fileName)
	if os.IsNotExist(err) {
		return DownloadFile(certificateUrl, fileName)
	}
	return nil
}

func getOtherOrganCertificateType(otherOrgans string) string {
	withOtherOrgans := "withOtherOrgans"
	withoutOtherOrgans := "withoutOtherOrgans"
	if otherOrgans != "" {
		return withOtherOrgans
	}
	return withoutOtherOrgans
}

func renderToPDFTemplate(templateUrl string, certificate string, qrData []byte, photo []byte) ([]byte, error) {
	var certificateData Certificate
	if err := json.Unmarshal([]byte(certificate), &certificateData); err != nil {
		return nil, err
	}
	pdf := gopdf.GoPdf{}
	pdf.Start(gopdf.Config{PageSize: *gopdf.PageSizeA4})
	pdf.AddPage()
	if err := pdf.AddTTFFont("dev", "NotoSansDevanagari.ttf"); err != nil {
		log.Printf(err.Error())
		return nil, err
	}

	otherOrganCertificateType := getOtherOrganCertificateType(certificateData.CredentialSubject.Pledge.AdditionalOrgans)
	certificateUrl := CertificateUrlMapping[templateUrl]["portrait"][otherOrganCertificateType]
	err := getTemplateFile(certificateUrl, templateUrl+"_"+"portrait_"+otherOrganCertificateType+".pdf")
	if err != nil {
		log.Printf("Error in certificate download : %v", err)
		return nil, err
	}
	tpl1 := pdf.ImportPage(templateUrl+"_"+"portrait_"+otherOrganCertificateType+".pdf", 1, "/MediaBox")
	pdf.UseImportedTemplate(tpl1, 0, 0, 0, 0)
	if err := pdf.SetFont("dev", "", 18); err != nil {
		log.Print(err.Error())
		return nil, err
	}
	offsetX := 190.0
	offsetY := 190.0
	pdf.SetX(offsetX)
	pdf.SetY(offsetY)
	_ = pdf.Cell(nil, certificateData.CredentialSubject.Name)
	if err := pdf.SetFont("dev", "", 10); err != nil {
		log.Print(err.Error())
		return nil, err
	}
	offsetX = 190.0
	offsetY = 350.0
	pdf.SetX(offsetX)
	pdf.SetY(offsetY)
	date, err := time.Parse(time.RFC3339, certificateData.IssuanceDate)
	if err != nil {
		return nil, err
	}
	_ = pdf.Cell(nil, date.Format("02-03-2006"))
	offsetX = 432.0
	offsetY = 350.0
	pdf.SetX(offsetX)
	pdf.SetY(offsetY)
	_ = pdf.Cell(nil, certificateData.CredentialSubject.FatherName)
	offsetX = 190.0
	offsetY = 387.0
	pdf.SetX(offsetX)
	pdf.SetY(offsetY)
	_ = pdf.Cell(nil, certificateData.Evidence[0].RefId)
	offsetX = 432.0
	offsetY = 387.0
	pdf.SetX(offsetX)
	pdf.SetY(offsetY)
	_ = pdf.Cell(nil, certificateData.CredentialSubject.BloodGroup)
	offsetX = 190.0
	offsetY = 424.0
	pdf.SetX(offsetX)
	pdf.SetY(offsetY)
	_ = pdf.Cell(nil, certificateData.CredentialSubject.NottoId)
	offsetX = 432.0
	offsetY = 424.0
	pdf.SetX(offsetX)
	pdf.SetY(offsetY)
	_ = pdf.Cell(nil, certificateData.CredentialSubject.EmergencyContacts.Contact)
	offsetX = 190.0
	offsetY = 461.0
	pdf.SetX(offsetX)
	pdf.SetY(offsetY)
	_ = pdf.Cell(nil, certificateData.CredentialSubject.Pledge.Organs)
	offsetX = 190.0
	offsetY = 498.0
	pdf.SetX(offsetX)
	pdf.SetY(offsetY)
	_ = pdf.Cell(nil, certificateData.CredentialSubject.Pledge.Tissues)
	holder, err := gopdf.ImageHolderByBytes(qrData)
	if err = pdf.ImageByHolder(holder, 47, 576, &gopdf.Rect{W: 210, H: 210}); err != nil {
		log.Errorf("Error creating QR Code")
	}
	photoStr, err := base64.StdEncoding.DecodeString(string(photo))
	if err != nil {
		return nil, err
	}
	holder, err = gopdf.ImageHolderByBytes(photoStr)
	if err = pdf.ImageByHolder(holder, 47, 191, &gopdf.Rect{W: 120, H: 120}); err != nil {
		log.Errorf("Error creating Profile photo")
	}
	var b bytes.Buffer
	_ = pdf.Write(&b)
	return b.Bytes(), nil
}

func setValueAtOffsets(pdf gopdf.GoPdf, offsetX float64, offsetY float64, data string) {
	pdf.SetX(offsetX)
	pdf.SetY(offsetY)
	_ = pdf.Cell(nil, data)
}

func getCertificateInImage(templateUrl string, certificate string, entityName string, entityId string) (interface{}, error) {
	var qrData string
	if qrCodeType := Config.QrType; strings.ToUpper(qrCodeType) == URL {
		qrData = Config.CertDomainUrl + "/certs/" + entityId + "?t=" + qrCodeType + "&entity=" + entityName + Config.AdditionalQueryParams
	} else {
		qrData, _ = getQRCodeImageBytes(certificate)
	}
	var certificateData map[string]interface{}
	err := json.Unmarshal([]byte(certificate), &certificateData)
	if err != nil {
		return nil, err
	}
	certificateData["qrCode"] = qrData
	// content, err := ioutil.ReadFile("./certificate.svg")
	// if err != nil {
	// 	return nil, err
	// }
	tpl := handlebars.RenderFile("./certificate.svg", certificateData)
	return tpl, nil
	// data, err := tpl.Exec(certificateData)
	// if err != nil {
	// 	return nil, err
	// }
	// return data, nil
}

func prepareDataForCertificateWithQRCode(certificate string, qrcode interface{}) (map[string]interface{}, error) {
	var certificateMap map[string]interface{}
	if err := json.Unmarshal([]byte(certificate), &certificateMap); err != nil {
		return nil, err
	}
	certificateMap["qrCode"] = qrcode
	return certificateMap, nil
}

func pasteQrCodeOnPage(certificateText string, pdf *gopdf.GoPdf) error {
	imageBytes, e := getQRCodeImageBytes(certificateText)
	if e != nil {
		return e
	}
	holder, err := gopdf.ImageHolderByBytes([]byte(imageBytes))
	err = pdf.ImageByHolder(holder, 290, 30, nil)
	if err != nil {
		log.Errorf("Error while creating QR code")
	}
	return nil
}

func getQRCodeImageBytes(certificateText string) (string, error) {
	buf, err := compress(certificateText)
	if err != nil {
		log.Error("Error compressing certificate data", err)
		return "", err
	}
	qrCode, err := qrcode.New(buf.String(), qrcode.Medium)
	if err != nil {
		return "", err
	}
	imageBytes, err := qrCode.PNG(380)
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
		Type              string `json:"type"`
		Dob               string `json:"dob"`
		BloodGroup        string `json:"bloodGroup"`
		Name              string `json:"name"`
		Gender            string `json:"gender"`
		FatherName        string `json:"fatherName"`
		NottoId           string `json:"nottoId"`
		Id                string `json:"id"`
		EmergencyContacts struct {
			Name     string `json:"name"`
			Contact  string `json:"contact"`
			Relation string `json:"relation"`
		} `json:"emergencyContacts"`
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
}
