@echo off

if "%~1"=="" (
  echo Usage: %~nx0 file.m3u8 [output.mp4]
  exit /b 1
)

if not exist "%~1" (
  echo Error: File "%~1" not found.
  exit /b 1
)

if "%~2"=="" (
  set "output=output.mp4"
) else (
  set "output=%~2"
)

ffmpeg -y -allowed_extensions ALL -protocol_whitelist "file,http,https,tls,tcp,crypto" -i "%~1" -c copy "%output%"
