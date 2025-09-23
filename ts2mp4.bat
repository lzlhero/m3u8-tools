@echo off

:: display usage information
if "%~1"=="" (
  echo Usage: %~nx0 file.m3u8 [output.mp4]
  exit /b 1
)

if not exist "%~1" (
  echo Error: File "%~1" not found.
  exit /b 1
)

:: set mp4 output filename
if "%~2"=="" (
  set "output=output.mp4"
) else (
  set "output=%~2"
)
:trim_dot
if "%output:~-1%"=="." (
  set "output=%output:~0,-1%"
  goto trim_dot
)
set "ext=%output:~-4%"
if /i not "%ext%"==".mp4" (
  set "output=%output%.mp4"
)

:: merge all ts files to mp4 file
ffmpeg -y -allowed_extensions ALL -protocol_whitelist file -i "%~1" -c copy "%output%"
