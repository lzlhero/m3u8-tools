#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $(basename "$0") file.m3u8 [output.mp4]"
  exit 1
fi

if [ ! -f "$1" ]; then
  echo "Error: File \"$1\" not found."
  exit 1
fi

if [ -z "$2" ]; then
  output="output.mp4"
else
  output="$2"
fi

ffmpeg -y -allowed_extensions ALL -protocol_whitelist "file,http,https,tls,tcp,crypto" -i "$1" -c copy "$output"
