package main

import (
	"archive/zip"
	"bytes"
	"compress/flate"
	"encoding/json"
	"flag"
	"io"
	"net/http"
	"os"
	"strings"

	"github.com/gorilla/mux"
	"github.com/signintech/gopdf"
	log "github.com/sirupsen/logrus"
	"github.com/skip2/go-qrcode"
)

var addr = flag.String("listen-address", ":8003", "The address to listen on for HTTP requests.")

const URL = "URL"
const URL_W3C_VC = "URL_W3C_VC"

func main() {
	router := mux.NewRouter()
	router.HandleFunc("/api/v1/certificate", getCertificate).Methods("POST")
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
	bodyKeyUrl := []string{"templateUrl", "certificate", "entityName", "entityId"}
	for i := range bodyKeyUrl {
		if _, ok := body[bodyKeyUrl[i]]; !ok {
			http.Error(w, "Required parameters missing", http.StatusBadRequest)
		}
	}
	templateUrl := body["templateUrl"]
	certificate := body["certificate"]
	entityName := body["entityName"]
	entityId := body["entityId"]

	if accept == "application/pdf" {
		getCertificateInPDF(templateUrl.(string), certificate.(string), entityName.(string), entityId.(string))
	} else if accept == "image/svg+xml" || accept == "text/html" {
		getCertificateInImage(templateUrl.(string), certificate.(string), entityName.(string), entityId.(string))
	}
}

func getCertificateInPDF(templateUrl string, certificate string, entityName string, entityId string) (interface{}, error) {
	var qrData string
	var certificateData map[string]interface{}
	log.Printf("Till here")
	if qrCodeType := Config.QrType; strings.ToUpper(qrCodeType) == URL {
		qrData = Config.CertDomainUrl + "/certs/" + entityId + "?t=" + qrCodeType + "&entity=" + entityName + Config.AdditionalQueryParams
	} else {
		qrData, _ = getQRCodeImageBytes(certificate)
	}
	certificateData, err := prepareDataForCertificateWithQRCode(certificate, qrData)
	if err != nil {
		return nil, err
	}
	return renderToPDFTemplate(certificateData), nil
}

func renderToPDFTemplate(certificateData map[string]interface{}) interface{} {
	for k, v := range certificateData {
		log.Println("Key : %v-----Value : %v", k, v)
	}
	return nil
}

func getCertificateInImage(templateUrl string, certificate string, entityName string, entityId string) {

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
	imageBytes, err := qrCode.PNG(-3)
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
