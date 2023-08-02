FROM ghcr.io/sunbird-rc/demo-donor-registry/sunbird-rc-keycloak:v0.0.13-4

ADD themes /opt/jboss/keycloak/themes
ADD imports /opt/jboss/keycloak/imports

ENTRYPOINT ["/opt/jboss/tools/docker-entrypoint.sh"]