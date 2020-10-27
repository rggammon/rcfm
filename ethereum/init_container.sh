#!/usr/bin/env bash
# See: https://ahmet.im/blog/minimal-init-process-for-containers/
set -e

/usr/sbin/nginx -g "daemon off;" &

if [ -d /mnt/rcfm/geth ]
then
    /usr/bin/geth \
        --networkid 206 \
        --ipcdisable \
        --nodiscover \
        --datadir /mnt/rcfm/geth/data \
        --http \
        --http.addr 0.0.0.0 \
        --http.port 8545 \
        --http.api eth,web3,personal,net \
        --http.vhosts "*" \
        --nousb \
        --nat none \
        --mine \
        --unlock 0x2F37f4757138D9fa30307F341459b9531CCD9Ba6 \
        --password /mnt/rcfm/geth/password.txt \
        --allow-insecure-unlock &
else
    echo "Not running geth"
fi

wait -n
