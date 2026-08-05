#!/usr/bin/env bash
# LocalShop dev veritabanı — yerel mongod'u düşük bellek ayarıyla başlatır.
# Kullanım: ./scripts/db.sh start | stop | status
set -euo pipefail

MONGOD="/opt/homebrew/opt/mongodb-community@8.0/bin/mongod"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DBPATH="$ROOT/.data/mongo"
LOGPATH="$ROOT/.data/mongod.log"
PIDFILE="$ROOT/.data/mongod.pid"

case "${1:-start}" in
  start)
    mkdir -p "$DBPATH"
    if lsof -nP -iTCP:27017 -sTCP:LISTEN >/dev/null 2>&1; then
      echo "27017 portunda zaten bir mongod dinliyor — o kullanılacak"
      exit 0
    fi
    if [ -f "$PIDFILE" ] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
      echo "mongod zaten çalışıyor (pid $(cat "$PIDFILE"))"
      exit 0
    fi
    "$MONGOD" --dbpath "$DBPATH" --logpath "$LOGPATH" --pidfilepath "$PIDFILE" \
      --bind_ip 127.0.0.1 --port 27017 --wiredTigerCacheSizeGB 0.25 --fork
    echo "mongod başladı → mongodb://127.0.0.1:27017"
    ;;
  stop)
    if [ -f "$PIDFILE" ]; then
      kill "$(cat "$PIDFILE")" && rm -f "$PIDFILE" && echo "mongod durduruldu"
    else
      echo "mongod çalışmıyor"
    fi
    ;;
  status)
    if [ -f "$PIDFILE" ] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
      echo "çalışıyor (pid $(cat "$PIDFILE"))"
    else
      echo "çalışmıyor"
    fi
    ;;
  *)
    echo "kullanım: $0 start|stop|status" >&2
    exit 1
    ;;
esac
