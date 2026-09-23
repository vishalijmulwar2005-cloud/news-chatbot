@echo off
title Push News-Chatbot to GitHub
echo ===================================================
echo   Pushing to https://github.com/vishalijmulwar2005-cloud/news-chatbot
echo ===================================================
echo.

set "GIT_EXE=C:\Users\visha\AppData\Local\MinGit\cmd\git.exe"

"%GIT_EXE%" status -s
echo.
echo Staging and committing any recent updates...
"%GIT_EXE%" add .
"%GIT_EXE%" commit -m "update: latest clean news chatbot build" 2>nul

echo.
echo Pushing branch 'main' to origin...
echo (If prompted, click 'Sign in with your browser' to authorize GitHub)
echo.

"%GIT_EXE%" push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ===================================================
    echo   SUCCESS! Uploaded to:
    echo   https://github.com/vishalijmulwar2005-cloud/news-chatbot
    echo ===================================================
) else (
    echo.
    echo ===================================================
    echo   If authentication failed or prompted for password:
    echo   1. Generate a GitHub Personal Access Token (classic)
    echo      at: https://github.com/settings/tokens
    echo      with 'repo' permissions checked.
    echo   2. Paste the token when prompted for Password.
    echo ===================================================
)

pause
