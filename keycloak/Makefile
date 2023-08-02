build:
	echo "Building docker image"
	@docker build -t srprasanna/keycloak .

release:
	@docker tag srprasanna/keycloak srprasanna/demo-donor-registry-keycloak:nhamain
	@docker push srprasanna/demo-donor-registry-keycloak:nhamain