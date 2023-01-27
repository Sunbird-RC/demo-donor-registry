PORTAL_RELEASE_VERSION = v0.0.1-beta
build:
	docker build -t tejashjl/donor-service backend/donor-service
	docker build -t tejashjl/sunbird-rc-donor-portal .

release: build
	docker tag tejashjl/sunbird-rc-donor-portal tejashjl/sunbird-rc-donor-portal:$(PORTAL_RELEASE_VERSION)
	docker push tejashjl/sunbird-rc-donor-portal:latest
	docker push tejashjl/sunbird-rc-donor-portal:$(PORTAL_RELEASE_VERSION)
	docker push tejashjl/donor-service
