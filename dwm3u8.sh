#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $(basename "$0") m3u8-url"
  exit 1
fi

wget -q -c -O index.m3u8 "$1"

"$(dirname "$0")/urlm3u8.sh" index.m3u8 "$1"
