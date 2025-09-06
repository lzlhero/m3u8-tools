#!/bin/bash

node "$(dirname "$0")/src/urlm3u8.js" "$@"

if [ -f "key.txt" ]; then
  wget -q -c -i key.txt
fi
