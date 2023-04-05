package config

import "github.com/jinzhu/configor"

func Initialize() {
	err := configor.Load(&Config, "./config/application-default.yml")
	if err != nil {
		panic("Unable to read configurations")
	}
}

var Config = struct {
	QrType                string `default:"W3C-VC" env:"QR_TYPE"`
	CertDomainUrl         string `default:"https://dev.sunbirded.org" env:"CERTIFICATE_DOMAIN_URL"`
	PrivateKeyPem         string `default:"" env:"CERTIFICATE_PRIVATE_KEY"`
	PublicKeyPem          string `default:"" env:"CERTIFICATE_PUBLIC_KEY"`
	AdditionalQueryParams string `default:"" env:"ADDITIONAL_QUERY_PARAMS"`
	MODE                  string `default:"debug" env:"MODE"`
	LogLevel              string `env:"LOG_LEVEL" yaml:"log_level" default:"info"`
	Host                  string `env:"HOST" yaml:"host" default:"0.0.0.0"`
	Port                  string `env:"PORT" yaml:"port" default:"8003"`
}{}
