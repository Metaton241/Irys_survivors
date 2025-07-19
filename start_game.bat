@echo off
title IRYS SURVIVORS v0.1 - Server
color 0A
echo.
echo  ╔══════════════════════════════════════════════════════════════════════════════════════╗
echo  ║                                  IRYS SURVIVORS v0.1                                ║
echo  ║                                 BY https://x.com/M3TATON                             ║
echo  ╚══════════════════════════════════════════════════════════════════════════════════════╝
echo.
echo  [INFO] Запуск локального HTTP сервера...
echo  [INFO] Сервер будет доступен на: http://localhost:8000
echo  [INFO] Для остановки сервера нажмите Ctrl+C
echo.
echo  [WAIT] Проверка Python...

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Python не найден! Установите Python с python.org
    echo  [INFO] Или используйте Python 3:
    python3 --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo  [ERROR] Python 3 тоже не найден!
        echo  [INFO] Попробуйте другой способ запуска из quick_start.md
        pause
        exit /b 1
    ) else (
        echo  [OK] Python 3 найден!
        echo  [INFO] Запуск сервера...
        echo.
        start http://localhost:8000
        python3 -m http.server 8000
    )
) else (
    echo  [OK] Python найден!
    echo  [INFO] Запуск сервера...
    echo.
    start http://localhost:8000
    python -m http.server 8000
)

echo.
echo  [INFO] Сервер остановлен
pause 