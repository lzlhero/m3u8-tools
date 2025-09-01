#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $(basename "$0") url.m3u8"
  exit 1
fi

grep -v '^\s*#\|^\s*$' "$1" | wget -c -i -
