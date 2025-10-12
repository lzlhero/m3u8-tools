@echo off

:: display usage information
if "%~1"=="" (
  echo Usage: %~nx0 m3u8-url [output.mp4]
  echo Based on: aria2c, node and ffmpeg. They must be installed and configured in the PATH environment variable.
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
aria2c --allow-overwrite=true --continue=false --split=1 -q -o index.m3u8 "%~1"

:: generate url.txt, file.m3u8 by index.m3u8
node "%~dp0\src\ppm3u8.js" index.m3u8 "%~1"

:: download related files by url.txt
echo.
echo Starting to download all related files...
aria2c -i url.txt

:: prompt user to continue
echo.
echo Merge all ts files to "%output%" file?
echo Press any key to continue... (Ctrl+C to exit)
echo.
pause >nul

:: set m3u8 input filename
set "input=file.m3u8"

:: generate ffmpeg checking log
echo Generating ffmpeg checking log first...
ffmpeg -allowed_extensions ALL -protocol_whitelist "file,crypto,data" -i "%input%" -c copy -f null NUL > ffmpeg.1.log 2>&1

:: remove last fixed.m3u8
if exist "fixed.m3u8" (
  del /f /q "fixed.m3u8"
)

:: genertate fixed.m3u8 by ffmpeg.1.log
echo.
node "%~dp0\src\fixm3u8.js" "%input%" ffmpeg.1.log

:: change m3u8 input filename
if exist "fixed.m3u8" (
  set "input=fixed.m3u8"
)

:: merge all ts files to mp4 file
echo.
echo Starting to merge...
ffmpeg -y -allowed_extensions ALL -protocol_whitelist "file,crypto,data" -i "%input%" -c copy "%output%" > ffmpeg.2.log 2>&1

:: display ouptput result
echo.
if exist "%output%" (
  echo Successfully wrote "%output%" file.
) else (
  echo Failed to write "%output%" file.
  exit /b 1
)
