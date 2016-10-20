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
    DEBUG=app:* forever start /home/user/soap2db/run.js
}

stop(){
    forever stop /home/user/soap2db/run.js
}

restart(){
    forever restart /home/user/soap2db/run.js
}

case "$1" in
  start)
    echo "Start service soap2db script"
    start
    ;;
  stop)
    echo "Stop service soap2db script"
    stop
    ;;
  restart)
    echo "Restart service soap2db script"
    restart
    ;;
  *)
    echo "Usage: $0 {start|stop|restart}"
    exit 1
    ;;
esac
