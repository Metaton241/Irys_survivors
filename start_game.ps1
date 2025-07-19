# PowerShell скрипт для запуска IRYS SURVIVORS v0.1
# Для запуска: powershell -ExecutionPolicy Bypass -File start_game.ps1

# Установка заголовка окна
$Host.UI.RawUI.WindowTitle = "IRYS SURVIVORS v0.1 - Server"

# Очистка экрана
Clear-Host

# Функция для цветного вывода
function Write-ColorText {
    param(
        [string]$Text,
        [ConsoleColor]$Color = [ConsoleColor]::White
    )
    Write-Host $Text -ForegroundColor $Color
}

# Заголовок
Write-ColorText "╔══════════════════════════════════════════════════════════════════════════════════════╗" -Color Blue
Write-ColorText "║                                  IRYS SURVIVORS v0.1                                ║" -Color Blue
Write-ColorText "║                                 BY https://x.com/M3TATON                             ║" -Color Blue
Write-ColorText "╚══════════════════════════════════════════════════════════════════════════════════════╝" -Color Blue
Write-Host ""
Write-ColorText "[INFO] Запуск локального HTTP сервера..." -Color Yellow
Write-ColorText "[INFO] Сервер будет доступен на: http://localhost:8000" -Color Yellow
Write-ColorText "[INFO] Для остановки сервера нажмите Ctrl+C" -Color Yellow
Write-Host ""
Write-ColorText "[WAIT] Проверка Python..." -Color Cyan

# Проверка Python
$pythonFound = $false
$pythonCommand = ""

# Проверяем python3
try {
    $python3Version = & python3 --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-ColorText "[OK] Python 3 найден! ($python3Version)" -Color Green
        $pythonFound = $true
        $pythonCommand = "python3"
    }
} catch {
    # python3 не найден
}

# Если python3 не найден, проверяем python
if (-not $pythonFound) {
    try {
        $pythonVersion = & python --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-ColorText "[OK] Python найден! ($pythonVersion)" -Color Green
            $pythonFound = $true
            $pythonCommand = "python"
        }
    } catch {
        # python не найден
    }
}

# Если Python не найден
if (-not $pythonFound) {
    Write-ColorText "[ERROR] Python не найден!" -Color Red
    Write-Host ""
    Write-ColorText "[INFO] Установите Python:" -Color Yellow
    Write-ColorText "[INFO] - Скачайте с https://python.org" -Color Yellow
    Write-ColorText "[INFO] - Или используйте другой способ из quick_start.md" -Color Yellow
    Write-Host ""
    Write-ColorText "[INFO] Альтернатива - Node.js:" -Color Yellow
    Write-ColorText "[INFO] npm install -g http-server" -Color Yellow
    Write-ColorText "[INFO] http-server -p 8000" -Color Yellow
    Write-Host ""
    Read-Host "Нажмите Enter для выхода"
    exit 1
}

# Запуск сервера
Write-ColorText "[INFO] Запуск сервера..." -Color Yellow
Write-Host ""

# Открытие браузера через 2 секунды
$job = Start-Job -ScriptBlock {
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:8000"
}

# Запуск HTTP сервера
try {
    Write-ColorText "[INFO] Сервер запущен! Браузер откроется автоматически." -Color Green
    Write-ColorText "[INFO] Если браузер не открылся, перейдите по адресу: http://localhost:8000" -Color Yellow
    Write-Host ""
    Write-ColorText "Нажмите Ctrl+C для остановки сервера" -Color Magenta
    Write-Host ""
    
    # Запуск сервера
    & $pythonCommand -m http.server 8000
    
} catch {
    Write-ColorText "[ERROR] Ошибка запуска сервера: $($_.Exception.Message)" -Color Red
} finally {
    # Остановка фонового задания
    Stop-Job $job -ErrorAction SilentlyContinue
    Remove-Job $job -ErrorAction SilentlyContinue
    
    Write-Host ""
    Write-ColorText "[INFO] Сервер остановлен" -Color Yellow
    Write-ColorText "[INFO] До встречи в игре!" -Color Blue
    Write-Host ""
    Read-Host "Нажмите Enter для выхода"
} 