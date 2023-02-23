package main

var CertificateUrlMapping map[string]map[string]map[string]string

func load() {
	CertificateUrlMapping = map[string]map[string]map[string]string{
		"english": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"hindi": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"assamese": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"bangla": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"dogri": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"gujarati": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"kannada": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"malayalam": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"marathi": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"odia": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"punjabi": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"tamil": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"telugu": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"urdu": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"AndamanAndNicobarIslands": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"AndhraPradesh": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"ArunachalPradesh": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"Assam": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"Bihar": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"Chandigarh": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"Chhattisgarh": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"DadraAndNagarHaveli": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"DamanAndDiu": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"Delhi": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"Goa": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"Gujarat": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"Haryana": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"HimachalPradesh": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"JammuAndKashmir": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"Jharkhand": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"Karnataka": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"Kerala": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"Ladakh": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"Lakshadweep": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"MadhyaPradesh": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"Maharashtra": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"Manipur": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"Meghalaya": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"Mizoram": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"Nagaland": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"Odisha": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"Puducherry": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"Punjab": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"Rajasthan": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"Sikkim": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"TamilNadu": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"Telangana": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"Tripura": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"UttarPradesh": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"Uttarakhand": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
		"WestBengal": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_portrait_withoutOtherOrgan.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_otherOrgan.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/certificate_template_pdf/pledgecertificates/hindi_english_landscape_withoutOtherOrgan.pdf",
			},
		},
	}
}
