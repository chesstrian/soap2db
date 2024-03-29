#!/usr/bin/env bash
#
# Note runlevel 2345, 86 is the Start order and 85 is the Stop order
#
# chkconfig: 2345 86 85
# description: Description of the Service
#
# Below is the source function library, leave it be
. /etc/init.d/functions

# result of whereis forever or whereis node
# export PATH=$PATH:/usr/local/bin
# result of whereis node_modules
# export NODE_PATH=$NODE_PATH:/usr/local/lib/node_modules


start(){
    NODE_CONFIG_DIR=/home/feeder/public_html/app/config/ DEBUG=app:* forever start /home/feeder/public_html/app/app.js
}

stop(){
    forever stop /home/feeder/public_html/app/app.js
}

restart(){
    NODE_CONFIG_DIR=/home/feeder/public_html/app/config/ DEBUG=app:* forever restart /home/feeder/public_html/app/app.js
}

case "$1" in
  start)
    echo "Start service soap2db web"
    start
    ;;
  stop)
    echo "Stop service soap2db web"
    stop
    ;;
  restart)
    echo "Restart service soap2db web"
    restart
    ;;
  *)
    echo "Usage: $0 {start|stop|restart}"
    exit 1
    ;;
esac
