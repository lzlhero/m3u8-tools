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

ffmpeg -allowed_extensions ALL -protocol_whitelist "file,http,https,tls,tcp,crypto" -i "$1" -c copy -f null /dev/null > ffmpeg.1.log 2>&1

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
"$SCRIPT_DIR/fix-m3u8.sh" "$1" ffmpeg.1.log

input="$1"
if [ -f "fixed.m3u8" ]; then
  input="fixed.m3u8"
fi

ffmpeg -y -allowed_extensions ALL -protocol_whitelist "file,http,https,tls,tcp,crypto" -i "$input" -c copy "$output" > ffmpeg.2.log 2>&1
