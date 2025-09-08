#!/bin/bash

node "$(dirname "$0")/src/ppm3u8.js" "$@"

if [ -f "key.txt" ]; then
  wget -q -c -i key.txt
  echo "Downloaded key by \"key.txt\" file."
fi
