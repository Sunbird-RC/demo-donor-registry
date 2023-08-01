PORTAL_RELEASE_VERSION = v0.0.1-beta
build:
	docker build -t ghcr.io/sunbird-rc/demo-donor-registry/donor-service backend/donor-service
	docker build -t ghcr.io/sunbird-rc/demo-donor-registry/sunbird-rc-donor-portal .
	docker build -t ghcr.io/sunbird-rc/demo-donor-registry/notification-service backend/notification-service
	docker build -t ghcr.io/sunbird-rc/demo-donor-registry/certificate-pdf-service backend/certificate-pdf-service


release: build
	docker tag ghcr.io/sunbird-rc/demo-donor-registry/sunbird-rc-donor-portal ghcr.io/sunbird-rc/demo-donor-registry/sunbird-rc-donor-portal:$(PORTAL_RELEASE_VERSION)
	docker tag ghcr.io/sunbird-rc/demo-donor-registry/donor-service ghcr.io/sunbird-rc/demo-donor-registry/donor-service:$(PORTAL_RELEASE_VERSION)
	docker tag ghcr.io/sunbird-rc/demo-donor-registry/notification-service ghcr.io/sunbird-rc/demo-donor-registry/notification-service:$(PORTAL_RELEASE_VERSION)
	docker tag ghcr.io/sunbird-rc/demo-donor-registry/certificate-pdf-service ghcr.io/sunbird-rc/demo-donor-registry/certificate-pdf-service:$(PORTAL_RELEASE_VERSION)
	docker push ghcr.io/sunbird-rc/demo-donor-registry/sunbird-rc-donor-portal:latest
	docker push ghcr.io/sunbird-rc/demo-donor-registry/sunbird-rc-donor-portal:$(PORTAL_RELEASE_VERSION)
	docker push ghcr.io/sunbird-rc/demo-donor-registry/donor-service:latest
	docker push ghcr.io/sunbird-rc/demo-donor-registry/donor-service:$(PORTAL_RELEASE_VERSION)
	docker push ghcr.io/sunbird-rc/demo-donor-registry/notification-service:latest
	docker push ghcr.io/sunbird-rc/demo-donor-registry/notification-service:$(PORTAL_RELEASE_VERSION)
	docker push ghcr.io/sunbird-rc/demo-donor-registry/certificate-pdf-service:latest
	docker push ghcr.io/sunbird-rc/demo-donor-registry/certificate-pdf-service:$(PORTAL_RELEASE_VERSION)
