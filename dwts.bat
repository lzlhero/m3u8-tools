@echo off

if "%~1"=="" (
  echo Usage: %~nx0 url.m3u8
  exit /b 1
)

grep -v "^\s*#\|^\s*$" %1 | wget -c -i -
