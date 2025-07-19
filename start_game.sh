#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Очистка экрана
clear

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                  IRYS SURVIVORS v0.1                                ║${NC}"
echo -e "${BLUE}║                                 BY https://x.com/M3TATON                             ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}[INFO]${NC} Запуск локального HTTP сервера..."
echo -e "${YELLOW}[INFO]${NC} Сервер будет доступен на: http://localhost:8000"
echo -e "${YELLOW}[INFO]${NC} Для остановки сервера нажмите Ctrl+C"
echo ""
echo -e "${BLUE}[WAIT]${NC} Проверка Python..."

# Функция для открытия браузера
open_browser() {
    sleep 2
    if command -v xdg-open > /dev/null; then
        xdg-open http://localhost:8000 > /dev/null 2>&1
    elif command -v open > /dev/null; then
        open http://localhost:8000 > /dev/null 2>&1
    else
        echo -e "${YELLOW}[INFO]${NC} Откройте браузер и перейдите по адресу: http://localhost:8000"
    fi
}

# Проверка Python 3
if command -v python3 > /dev/null; then
    echo -e "${GREEN}[OK]${NC} Python 3 найден!"
    echo -e "${YELLOW}[INFO]${NC} Запуск сервера..."
    echo ""
    
    # Запуск браузера в фоне
    open_browser &
    
    # Запуск сервера
    python3 -m http.server 8000
    
elif command -v python > /dev/null; then
    echo -e "${GREEN}[OK]${NC} Python найден!"
    echo -e "${YELLOW}[INFO]${NC} Запуск сервера..."
    echo ""
    
    # Запуск браузера в фоне
    open_browser &
    
    # Запуск сервера
    python -m http.server 8000
    
else
    echo -e "${RED}[ERROR]${NC} Python не найден!"
    echo ""
    echo -e "${YELLOW}[INFO]${NC} Установите Python:"
    echo -e "${YELLOW}[INFO]${NC} - macOS: brew install python3"
    echo -e "${YELLOW}[INFO]${NC} - Ubuntu/Debian: sudo apt-get install python3"
    echo -e "${YELLOW}[INFO]${NC} - CentOS/Fedora: sudo yum install python3"
    echo ""
    echo -e "${YELLOW}[INFO]${NC} Или используйте другой способ из quick_start.md"
    exit 1
fi

echo ""
echo -e "${YELLOW}[INFO]${NC} Сервер остановлен"
echo -e "${BLUE}[INFO]${NC} До встречи в игре!" 