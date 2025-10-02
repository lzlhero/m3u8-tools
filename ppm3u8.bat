@echo off

if exist "key.txt" (
  del /f /q "key.txt"
)

node "%~dp0\src\ppm3u8.js" %*

if exist "key.txt" (
  wget -q -i key.txt
)
