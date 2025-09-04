#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
node "$SCRIPT_DIR/src/fix-m3u8.js" "$@"
