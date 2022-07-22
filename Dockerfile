FROM nginx:1.21-alpine
COPY dist/hypertrace-ui /usr/share/nginx/html
COPY conf/default.conf /etc/nginx/conf.d/default.conf
COPY copy-secrets.sh /docker-entrypoint.d/
RUN chmod a+w /var/cache/nginx /var/run
EXPOSE 2020
HEALTHCHECK --interval=1s --retries=5 --timeout=1s CMD wget -qO- http://localhost:2020/graphql?query={__schema{queryType{name}}} &> /dev/null || exit 1
