package services

import (
	"bytes"
	"github.com/signintech/gopdf"
	log "github.com/sirupsen/logrus"
	"io"
	"os"
	"strings"
)

type PdfService struct {
	pdf gopdf.GoPdf
}

func (p *PdfService) loadFonts() error {
	entries, err := os.ReadDir("./fonts")
	if err != nil {
		log.Error("Error reading fonts directory", err)
	}

	for _, e := range entries {
		if !e.IsDir() && strings.Contains(e.Name(), "ttf") {
			if err := p.pdf.AddTTFFont(strings.Split(e.Name(), ".")[0], "fonts/"+e.Name()); err != nil {
				log.Error("Error while loading font,", err)
				return err
			}
		}
	}

	return nil
}

func (p *PdfService) setData(dataConfig CertificateDataConfig, certificateData Certificate) error {
	p.pdf.SetX(dataConfig.x)
	p.pdf.SetY(dataConfig.y)
	data, err := dataConfig.template.render(certificateData)
	if err != nil {
		log.Error(err)
		return err
	}
	if err := p.pdf.SetFont("Lato-Regular", "", dataConfig.fontSize); err != nil {
		log.Error("Error while setting font ", err)
		return err
	}
	if dataConfig.formatter != nil {
		data, err = dataConfig.formatter(data)
		if err != nil {
			log.Error("Error executing formatter function", err)
			return err
		}
	}
	if dataConfig.getConfigType() == TextConfigType {
		err := p.setTextData(dataConfig, data)
		if err != nil {
			return err
		}
	} else if dataConfig.getConfigType() == ImageConfigType {
		err := p.setImageData(dataConfig, data)
		if err != nil {
			return err
		}
	}
	return nil
}

func (p *PdfService) setTextData(dataConfig CertificateDataConfig, data string) error {
	if dataConfig.width > 0 {
		splitText, err := p.pdf.SplitTextWithWordWrap(data, dataConfig.width)
		if err != nil {
			log.Error("Error splitting text", err)
			return err
		}
		for i, text := range splitText {
			err = p.pdf.Cell(nil, text)
			if err != nil {
				log.Error("Error while setting text", err)
				return err
			}
			p.pdf.SetY(dataConfig.y + (float64(i+1) * dataConfig.fontSize))
			p.pdf.SetX(dataConfig.x)
		}
	} else {
		err := p.pdf.Cell(nil, data)
		if err != nil {
			log.Error("Error while setting text", err)
			return err
		}
	}
	return nil
}

func (p *PdfService) setImageData(dataConfig CertificateDataConfig, data string) error {
	holder, err := gopdf.ImageHolderByBytes([]byte(data))
	if err = p.pdf.ImageByHolder(holder, dataConfig.x, dataConfig.y, &gopdf.Rect{W: dataConfig.width, H: dataConfig.height}); err != nil {
		log.Error("Error adding qrcode to PDF ", err)
		return err
	}
	return nil
}

func NewPdfService(pageSize *gopdf.Rect, templateBytes []byte) *PdfService {
	pdfService := PdfService{
		pdf: gopdf.GoPdf{},
	}
	pdfService.pdf.Start(gopdf.Config{PageSize: *pageSize})
	pdfService.pdf.AddPage()
	readSteam := io.ReadSeeker(bytes.NewReader(templateBytes))
	templateId := pdfService.pdf.ImportPageStream(&readSteam, 1, "/MediaBox")
	pdfService.pdf.UseImportedTemplate(templateId, 0, 0, 0, 0)
	return &pdfService
}
