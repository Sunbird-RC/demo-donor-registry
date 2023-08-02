PORTAL_RELEASE_VERSION = v0.0.1-beta
build:
	docker build -t srprasanna/donor-service backend/donor-service
	docker build -t srprasanna/sunbird-rc-donor-portal .
	docker build -t srprasanna/notification-service backend/notification-service
	docker build -t srprasanna/certificate-pdf-service backend/certificate-pdf-service


release:
	docker tag srprasanna/sunbird-rc-donor-portal srprasanna/sunbird-rc-donor-portal:$(PORTAL_RELEASE_VERSION)
	docker tag srprasanna/donor-service srprasanna/donor-service:$(PORTAL_RELEASE_VERSION)
	docker tag srprasanna/notification-service srprasanna/notification-service:$(PORTAL_RELEASE_VERSION)
	docker tag srprasanna/certificate-pdf-service srprasanna/certificate-pdf-service:$(PORTAL_RELEASE_VERSION)
	docker push srprasanna/sunbird-rc-donor-portal:latest
	docker push srprasanna/sunbird-rc-donor-portal:$(PORTAL_RELEASE_VERSION)
	docker push srprasanna/donor-service:latest
	docker push srprasanna/donor-service:$(PORTAL_RELEASE_VERSION)
	docker push srprasanna/notification-service:latest
	docker push srprasanna/notification-service:$(PORTAL_RELEASE_VERSION)
	docker push srprasanna/certificate-pdf-service:latest
	docker push srprasanna/certificate-pdf-service:$(PORTAL_RELEASE_VERSION)
