PORTAL_RELEASE_VERSION = v0.0.1-beta
build:
	docker build -t tejashjl/sunbird-rc-donor-portal .

release: build
	docker tag dockerhub/sunbird-rc-donor-portal dockerhub/sunbird-rc-donor-portal:$(PORTAL_RELEASE_VERSION)
	docker push dockerhub/sunbird-rc-donor-portal:latest
	docker push dockerhub/sunbird-rc-donor-portal:$(PORTAL_RELEASE_VERSION)
