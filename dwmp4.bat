@echo off

if "%~1"=="" (
  echo Usage: %~nx0 m3u8-url [output.mp4]
  exit /b 1
)

wget -q -c -O index.m3u8 "%~1"

set "temp=m3u8-url.temp"
echo %~1 > %temp%
call "%~dp0ppm3u8.bat" index.m3u8 %temp%
del /f /q %temp%

call dw -i url.m3u8

call "%~dp0t2m.bat" file.m3u8 "%~2"
