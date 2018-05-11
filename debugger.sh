#!/bin/bash -e

echo "Warning..."
echo "You must having other 2 module: trader-server(proxy) and trader-server-db(center database) with trader-app."
echo ""

function start {
    cd ../trade-server-db && npm run all > /dev/null 2>&1 &
    if [ $? == "0" ]; then 
        echo "[trade-server-db] success!"
    fi 
    cd ../trader-server && npm run all > /dev/null 2>&1 &
    if [ $? == "0" ]; then 
        echo "[trade-server] success!"
    fi 
}

function stop {
    kill $(lsof -i:3000 -t);
    kill $(lsof -i:3001 -t);

    echo "Done."
}

function check {
    netstat -anp | grep -e 3001 -e 3000
}

# '$#' refer to the number of parameters (receive at runtime)
# '$1' denote the first command line argument passed

if [ $# -eq 0 ]; then 
    echo "Usage: $(basename $0) {start|stop|check}"
    exit
fi 
$1