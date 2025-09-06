@echo off

if "%~1"=="" (
  echo Usage: %~nx0 m3u8-url
  exit /b 1
)

wget -q -c -O index.m3u8 "%~1"

call "%~dp0urlm3u8.bat" index.m3u8 "%~1"

if exist "key.txt" (
  wget -q -c -i key.txt
)
