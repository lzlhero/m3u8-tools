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

ffmpeg -allowed_extensions ALL -protocol_whitelist "file,http,https,tls,tcp,crypto" -i "%~1" -c copy -f null NUL > ffmpeg.1.log 2>&1

call "%~dp0fixm3u8.bat" "%~1" ffmpeg.1.log

set "input=%~1"
if exist "fixed.m3u8" (
  set "input=fixed.m3u8"
)

ffmpeg -y -allowed_extensions ALL -protocol_whitelist "file,http,https,tls,tcp,crypto" -i "%input%" -c copy "%output%" > ffmpeg.2.log 2>&1

echo Write "%output%" file.
