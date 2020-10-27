FROM alpine:3.12.1
RUN apk add --no-cache bash geth nginx tini \
    && mkdir -p /run/nginx
COPY init_container.sh /usr/local/bin/
COPY nginx-geth.conf /etc/nginx/conf.d/nginx-geth.conf
EXPOSE 80
ENTRYPOINT ["/sbin/tini", "--", "/usr/local/bin/init_container.sh"]