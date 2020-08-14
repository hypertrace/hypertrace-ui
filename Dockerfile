FROM nginx:1.15-alpine
COPY dist/hypertrace-ui /usr/share/nginx/html
COPY conf/default.conf /etc/nginx/conf.d/default.conf
# expose port for UI
EXPOSE 2020
# Healthcheck to check if client can connect to UI port
HEALTHCHECK --interval=1s --retries=5 --timeout=1s CMD wget -qO- http://127.0.0.1:2020 &> /dev/null || exit 1
