#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $(basename "$0") m3u8-url [output.mp4]"
  exit 1
fi

wget -q -c -O index.m3u8 "$1"

"$(dirname "$0")/ppm3u8.sh" index.m3u8 "$1"

dw -i url.m3u8

"$(dirname "$0")/t2m.sh" file.m3u8 "$2"
