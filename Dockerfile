FROM nginx:1.15-alpine
COPY dist/hypertrace-ui /usr/share/nginx/html
COPY conf/default.conf /etc/nginx/conf.d/default.conf