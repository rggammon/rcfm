FROM alpine:3.12.1
RUN apk add --no-cache bash geth tini
COPY init_container.sh /usr/local/bin/
EXPOSE 8545
ENTRYPOINT ["/sbin/tini", "--", "/usr/local/bin/init_container.sh"]