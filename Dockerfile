# Stage 1: Build an Angular Docker Image
FROM node:16.14.2-alpine as build
WORKDIR /app
COPY donor-registry/package*.json /app/
RUN npm install --legacy-peer-deps
COPY donor-registry /app
ARG configuration=production
RUN npm run build -- --outputPath=./dist/out
# Stage 2, use the compiled app, ready for production with Nginx
FROM dockerhub/sunbird-rc-nginx
COPY --from=build /app/dist/out/ /usr/share/nginx/html/admin
RUN rm /usr/share/nginx/html/admin/ngsw.json
COPY /nginx.conf /etc/nginx/conf.d/default.conf
