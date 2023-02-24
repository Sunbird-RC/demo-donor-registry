package main

var CertificateUrlMapping map[string]map[string]map[string]string

func load() {
	CertificateUrlMapping = map[string]map[string]map[string]string{
		"english": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"hindi": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"assamese": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"bangla": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"dogri": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"gujarati": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"kannada": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"malayalam": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"marathi": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"odia": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"punjabi": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"tamil": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"telugu": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"urdu": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"AndamanAndNicobarIslands": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"AndhraPradesh": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"ArunachalPradesh": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"Assam": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"Bihar": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"Chandigarh": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"Chhattisgarh": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"DadraAndNagarHaveli": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"DamanAndDiu": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"Delhi": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"Goa": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"Gujarat": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"Haryana": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"HimachalPradesh": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"JammuAndKashmir": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"Jharkhand": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"Karnataka": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"Kerala": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"Ladakh": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"Lakshadweep": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"MadhyaPradesh": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"Maharashtra": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"Manipur": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"Meghalaya": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"Mizoram": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"Nagaland": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"Odisha": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"Puducherry": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"Punjab": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"Rajasthan": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"Sikkim": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"TamilNadu": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"Telangana": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"Tripura": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"UttarPradesh": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"Uttarakhand": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
		"WestBengal": {
			"portrait": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_portrait_withoutOtherOrgans.pdf",
			},
			"landscape": {
				"withOtherOrgans":    "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_otherOrgans.pdf",
				"withoutOtherOrgans": "https://raw.githubusercontent.com/Sunbird-RC/demo-donor-registry/main/pledgecertificates/hindi_english_landscape_withoutOtherOrgans.pdf",
			},
		},
	}
}
