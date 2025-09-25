@echo off

:: display usage information
if "%~1"=="" (
  echo Usage: %~nx0 m3u8-url [output.mp4]
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

:: download m3u8 file
wget -q -c -O index.m3u8 "%~1"

:: generate key.txt, ts.txt, file.m3u8 by index.m3u8
node "%~dp0\src\ppm3u8.js" index.m3u8 "%~1"

:: download key file by key.txt
if exist "key.txt" (
  wget -q -c -i key.txt
)

:: download ts files by ts.txt
call dw -i ts.txt

:: prompt user to continue
echo.
echo Merge all ts files to "%output%" file?
echo Press any key to continue (Ctrl+C to exit)...
pause >nul
echo Starting to merge...

:: set m3u8 input filename
set "input=file.m3u8"

:: generate ffmpeg checking log
ffmpeg -allowed_extensions ALL -protocol_whitelist "file,crypto,data" -i "%input%" -c copy -f null NUL > ffmpeg.1.log 2>&1

:: genertate fixed.m3u8 by ffmpeg.1.log
node "%~dp0\src\fixm3u8.js" "%input%" ffmpeg.1.log

:: change m3u8 input filename
if exist "fixed.m3u8" (
  set "input=fixed.m3u8"
)

:: merge all ts files to mp4 file
ffmpeg -y -allowed_extensions ALL -protocol_whitelist "file,crypto,data" -i "%input%" -c copy "%output%" > ffmpeg.2.log 2>&1

:: display ouptput result
if exist "%output%" (
  echo Wrote "%output%" file.
) else (
  echo Failed to write "%output%" file.
  exit /b 1
)
