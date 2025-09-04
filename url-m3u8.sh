#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
node "$SCRIPT_DIR/src/url-m3u8.js" "$@"
