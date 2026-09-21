@echo off
echo ===================================================
echo   News Information AI Chatbot (Zero-Token Edition)
echo ===================================================
echo.
echo Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "News AI - Backend" cmd /k "cd backend && venv\Scripts\python.exe run.py"

echo Waiting for backend to initialize...
timeout /t 3 /nobreak >nul

echo Starting Vite React Frontend on http://localhost:5173 ...
start "News AI - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo App launching! Open your browser at http://localhost:5173
pause
