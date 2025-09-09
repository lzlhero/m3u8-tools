@echo off

if "%~1"=="" (
  echo Usage: %~nx0 m3u8-url
  exit /b 1
)

wget -q -c -O index.m3u8 "%~1"

set "temp=m3u8-url.temp"
echo %~1 > %temp%
call "%~dp0ppm3u8.bat" index.m3u8 %temp%
del /f /q %temp%
