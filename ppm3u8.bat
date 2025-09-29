@echo off

node "%~dp0\src\ppm3u8.js" %*

if exist "key.txt" (
  echo Downloading key from "key.txt" file...
  wget -q -c -i key.txt
)
