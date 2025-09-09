@echo off

if exist "%~2" (
  set /p m3u8-url=<%~2
) else (
  set "m3u8-url=%~2"
)

node "%~dp0\src\ppm3u8.js" "%~1" %m3u8-url%

if exist "key.txt" (
  echo Downloading key from "key.txt" file...
  wget -q -c -i key.txt
)
