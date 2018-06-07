#!/bin/bash

# This shell script is to monitor the cpu,mem used by single process

monitor() (
  $* &>/dev/null &
  pid="$!"
  trap ':' INT
  echo 'CPU  MEM'
  while sleep 1; do ps --no-headers -o '%cpu,%mem' -p "$pid"; done
  kill "$pid"
)

monitor npm run start
