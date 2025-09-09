#!/bin/bash

if [ -f "$2" ]; then
  read -r m3u8_url < "$2"
else
  m3u8_url="$2"
fi

node "$(dirname "$0")/src/ppm3u8.js" "$1" "$m3u8_url"

if [ -f "key.txt" ]; then
  echo "Downloading key from \"key.txt\" file..."
  wget -q -c -i key.txt
fi
