@echo off

node "%~dp0\src\ppm3u8.js" %*

if exist "key.txt" (
  wget -q -i key.txt
)
