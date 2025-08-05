// Версия игры
const VERSION = '0.3';

// Глобальные переменные
let game = null;
let selectedClass = 'archer';

// Инициализация игры
function init() {
    console.log('Инициализация игры...');
    
    // Проверяем что userManager доступен
    if (!window.userManager) {
        console.error('UserManager не найден при инициализации игры');
        return;
    }
    
    // Используем setTimeout для гарантии загрузки всех скриптов
    setTimeout(() => {
        try {
    game = new Game();
    window.game = game;
                
            console.log('Игра создана успешно');
            console.log('Система постоянных улучшений:', game.permanentUpgrades);
    
    // Обновление версии в интерфейсе
    document.getElementById('gameVersion').textContent = `v${VERSION}`;
    
    // Загрузка выбранного класса
    selectedClass = game.loadSelectedClass();
            
            // Установка выбранного класса в игре
            console.log('Устанавливаем класс:', selectedClass);
            game.setSelectedClass(selectedClass);
            
            // Обновление интерфейса выбора класса
    updateClassSelection();
            
            // Инициализация пользовательского интерфейса
            initializeUserInterface();
    
    // Инициализация системы прокачки
            console.log('Инициализация системы прокачки...');
            // renderUpgrades(); // Убираем отсюда - будет вызываться при показе
    
    // Обработчики событий
    setupEventHandlers();
    
    console.log('Игра инициализирована');
            console.log('Выбранный класс:', selectedClass);
                
        } catch (error) {
            console.error('Ошибка инициализации игры:', error);
            console.error('Stack trace:', error.stack);
            
            // Показать ошибку пользователю
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: red; color: white; padding: 20px; border-radius: 10px; z-index: 10000;';
            errorDiv.innerHTML = `
                <h3>${i18n.get('error.initFailed')}</h3>
                <p>${i18n.get('error.checkConsole')}</p>
                <button onclick="location.reload()">${i18n.get('error.reload')}</button>
            `;
            document.body.appendChild(errorDiv);
        }
    }, 100); // Небольшая задержка для гарантии загрузки всех скриптов
}

// Настройка обработчиков событий
function setupEventHandlers() {
    // Обработчик Enter для перезапуска
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && game.currentState === game.states.GAME_OVER) {
            game.restartGame();
        }
    });
    
    // Обработчик изменения размера окна
    window.addEventListener('resize', () => {
        if (game) {
            game.canvas.width = window.innerWidth;
            game.canvas.height = window.innerHeight;
        }
    });
}

// Функции для работы с классами
function selectClass(className) {
    // Временно блокируем выбор bomber класса
    if (className === 'bomber') {
        console.log('Класс Bomber временно недоступен');
        return;
    }
    
    selectedClass = className;
    if (game) {
    game.setSelectedClass(className);
    }
    updateClassSelection();
}

function updateClassSelection() {
    // Убираем класс selected со всех карточек
    document.querySelectorAll('.class-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Добавляем класс selected к выбранной карточке
    const selectedCard = document.getElementById(`${selectedClass}Class`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    } else {
        console.warn(`Карточка класса не найдена: ${selectedClass}Class`);
    }
    
    // Обновляем информацию о выбранном классе
    console.log(`Выбран класс: ${selectedClass}`);
}

// Функции для работы с главным меню
function startGame() {
    console.log('Кнопка "Начать игру" нажата');
    
    if (!game) {
        console.error('Объект игры не найден! Попытка инициализации...');
        init();
        return;
    }
    
    console.log('Объект игры найден, состояние:', game.currentState);
    
    try {
        game.startGame();
        console.log('Игра успешно запущена');
    } catch (error) {
        console.error('Ошибка при запуске игры:', error);
        console.error('Stack trace:', error.stack);
    }
}

function showUpgrades() {
    console.log('Показ секции прокачки...');
    
    document.getElementById('upgradesSection').classList.remove('hidden');
    document.getElementById('leaderboardSection').classList.add('hidden');
    
    // Проверяем игру
    if (!game) {
        console.error('Игра не найдена при показе прокачки');
        return;
    }
    
    // Инициализируем систему улучшений если нужно
    if (!game.permanentUpgrades) {
        console.log('Инициализация системы постоянных улучшений...');
        game.permanentUpgrades = new PermanentUpgradesSystem();
        game.permanentUpgrades.loadUpgrades();
    }
    
    console.log('Система постоянных улучшений:', game.permanentUpgrades);
    
    renderUpgrades();
    
    // Обновляем отображение золота
    const upgradesGold = document.getElementById('upgradesGold');
    if (upgradesGold && game) {
        upgradesGold.textContent = game.goldSystem.getGold();
    }
    
    // Обновляем текст золота
    const goldText = document.querySelector('[data-i18n="upgrades.currentGold"]');
    if (goldText && game) {
        goldText.textContent = i18n.get('upgrades.currentGold', game.goldSystem.getGold());
    }
}

function hideUpgrades() {
    document.getElementById('upgradesSection').classList.add('hidden');
}

function showLeaderboard() {
    console.log('Показ лидерборда...');
    
    document.getElementById('leaderboardSection').classList.remove('hidden');
    document.getElementById('upgradesSection').classList.add('hidden');
    
    // Проверяем userManager
    if (!window.userManager) {
        console.error('UserManager не найден');
        return;
    }
    
    updateLeaderboard();
}

function hideLeaderboard() {
    document.getElementById('leaderboardSection').classList.add('hidden');
}

function clearLeaderboard() {
    window.userManager.clearLeaderboard();
    updateLeaderboard();
    console.log('Лидерборд очищен');
}

// Функции для работы с постоянными улучшениями
function renderUpgrades() {
    console.log('Запуск renderUpgrades()...');
    
    if (!game) {
        console.error('Игра не найдена в renderUpgrades()');
        return;
    }
    
    console.log('Игра найдена, проверяем систему улучшений...');
    
    const upgradesGrid = document.getElementById('upgradesGrid');
    if (!upgradesGrid) {
        console.error('Элемент upgradesGrid не найден');
        return;
    }
    
    upgradesGrid.innerHTML = '';
    
    // Обновляем отображение золота в секции прокачки
    const upgradesGold = document.getElementById('upgradesGold');
    if (upgradesGold) {
        upgradesGold.textContent = game.goldSystem.getGold();
    }
    
    // Обновляем текст золота
    const goldText = document.querySelector('[data-i18n="upgrades.currentGold"]');
    if (goldText) {
        goldText.textContent = i18n.get('upgrades.currentGold', game.goldSystem.getGold());
    }
    
    console.log('Получение списка улучшений...');
    
    try {
        // Проверяем что система улучшений готова
        if (!game.permanentUpgrades) {
            console.error('Система улучшений не инициализирована');
            upgradesGrid.innerHTML = '<div style="color: orange; text-align: center; padding: 20px;">Система улучшений загружается...</div>';
            return;
        }
    
    const upgrades = game.getAllUpgrades();
        console.log('Получено улучшений:', upgrades.length);
        console.log('Улучшения:', upgrades);
        
        if (!upgrades || upgrades.length === 0) {
            console.warn('Список улучшений пуст!');
            // Создаем заглушку для отладки
            upgradesGrid.innerHTML = '<div style="color: orange; text-align: center; padding: 20px;">Улучшения загружаются...</div>';
            return;
        }
    
    upgrades.forEach(upgrade => {
        const upgradeElement = document.createElement('div');
        upgradeElement.className = 'upgrade-item';
        
        if (!upgrade.canUpgrade) {
            upgradeElement.classList.add('purchased');
        }
        
        upgradeElement.innerHTML = `
            <div class="upgrade-icon">${upgrade.icon}</div>
                <div class="upgrade-name">${i18n.get(`upgrade.${upgrade.id}`, upgrade.id)}</div>
                <div class="upgrade-description">${i18n.get(`upgrade.${upgrade.id}.desc`, `+${upgrade.effect} per level`)}</div>
            <div class="upgrade-cost">💰 ${upgrade.cost}</div>
                <div class="upgrade-level">${i18n.get('upgrades.level', upgrade.level, upgrade.maxLevel)}</div>
        `;
        
        if (upgrade.canUpgrade) {
            upgradeElement.style.cursor = 'pointer';
            upgradeElement.addEventListener('click', () => {
                if (game.purchaseUpgrade(upgrade.id)) {
                    renderUpgrades();
                    game.updateGoldDisplay();
                    
                    // Эффект покупки
                    upgradeElement.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        upgradeElement.style.transform = 'scale(1)';
                    }, 200);
                } else {
                    // Эффект недостатка золота
                    upgradeElement.style.borderColor = '#ff4444';
                    setTimeout(() => {
                        upgradeElement.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }, 500);
                }
            });
        } else {
            upgradeElement.style.opacity = '0.7';
            upgradeElement.style.cursor = 'not-allowed';
        }
        
        upgradesGrid.appendChild(upgradeElement);
    });
        
    } catch (error) {
        console.error('Ошибка при отображении улучшений:', error);
        console.error('Stack trace:', error.stack);
        upgradesGrid.innerHTML = '<div style="color: red; text-align: center; padding: 20px;">Ошибка при загрузке улучшений. Проверьте консоль.</div>';
    }
}

// Функция для показа статистики
function showStats() {
    if (game && game.player) {
        const stats = game.player.getStats();
        const weaponStats = game.weaponSystem.getWeaponStats();
        const enemyInfo = game.enemySystem.getWaveInfo();
        
        console.log('=== СТАТИСТИКА ИГРОКА ===');
        console.log('Класс:', stats.characterClass);
        console.log('Уровень:', stats.level);
        console.log('Здоровье:', `${stats.health}/${stats.maxHealth}`);
        console.log('Опыт:', `${stats.experience}/${stats.experienceToNext}`);
        console.log('Скорость:', stats.speed);
        console.log('Регенерация:', stats.regeneration);
        console.log('Множитель урона:', stats.weaponDamage);
        console.log('Множитель скорости атаки:', stats.weaponSpeed);
        console.log('Броня:', stats.armor);
        console.log('Удача:', stats.luck);
        console.log('Магнетизм:', stats.magnet);
        
        console.log('\n=== СТАТИСТИКА ОРУЖИЯ ===');
        weaponStats.forEach((weapon, index) => {
            console.log(`${index + 1}. ${weapon.name} (Уровень ${weapon.level})`);
            console.log(`   Урон: ${weapon.damage}`);
            console.log(`   Скорость: ${weapon.fireRate}`);
            console.log(`   Пробивание: ${weapon.piercing}`);
            console.log(`   Снарядов: ${weapon.projectileCount}`);
        });
        
        console.log('\n=== СТАТИСТИКА ВРАГОВ ===');
        console.log('Текущая волна:', enemyInfo.currentWave);
        console.log('Сложность:', Math.floor(enemyInfo.difficulty * 100) / 100);
        console.log('Врагов на экране:', game.enemySystem.getEnemyCount());
        
        console.log('\n=== СТАТИСТИКА ЗОЛОТА ===');
        console.log('Общее золото:', game.goldSystem.getGold());
        console.log('Заработано в этой игре:', game.goldSystem.goldEarned);
        
        console.log('\n=== ОБЩАЯ СТАТИСТИКА ===');
        console.log('Счет:', game.score);
        console.log('Время:', game.formatTime(game.timeElapsed));
        console.log('Комбо:', game.scoreSystem.combo);
        console.log('Максимальное комбо:', game.scoreSystem.maxCombo);
    } else {
        console.log('Игрок не найден. Возможно, игра не запущена.');
    }
}

// Функция для создания тестовых врагов
function spawnTestEnemies(count = 5) {
    if (game && game.enemySystem) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const distance = 300;
            const x = game.player.x + Math.cos(angle) * distance;
            const y = game.player.y + Math.sin(angle) * distance;
            
            game.enemySystem.spawnEnemyAt(x, y);
        }
        console.log(`Создано ${count} тестовых врагов`);
    } else {
        console.log('Система врагов не найдена');
    }
}

// Функция для добавления опыта
function addExperience(amount = 100) {
    if (game && game.player) {
        game.player.gainExperience(amount);
        console.log(`Добавлено ${amount} опыта`);
    } else {
        console.log('Игрок не найден');
    }
}

// Функция для добавления золота
function addGold(amount = 2) { // Уменьшено в 50 раз (было 100)
    if (game && game.goldSystem) {
        game.goldSystem.addGold(amount);
    }
}

// Функция для лечения игрока
function healPlayer(amount = 50) {
    if (game && game.player) {
        game.player.heal(amount);
        console.log(`Игрок вылечен на ${amount} HP`);
    } else {
        console.log('Игрок не найден');
    }
}

// Функция для добавления всех видов оружия
function addAllWeapons() {
    if (game && game.weaponSystem) {
        const weaponTypes = [LaserCannon, RocketLauncher, MachineGun, Shotgun, LightningGun];
        
        weaponTypes.forEach(weaponType => {
            // Проверяем, есть ли уже такое оружие
            const hasWeapon = game.weaponSystem.weapons.some(weapon => 
                weapon.constructor === weaponType
            );
            
            if (!hasWeapon) {
                game.player.addWeapon(weaponType);
                console.log(`Добавлено оружие: ${new weaponType().name}`);
            }
        });
        
        console.log('Все доступные виды оружия добавлены');
    } else {
        console.log('Система оружия не найдена');
    }
}

// Функция для изменения класса персонажа
function changeClass(className) {
    if (game && game.player) {
        if (className === 'archer' || className === 'swordsman') {
            game.setSelectedClass(className);
            game.applySelectedClass();
            console.log(`Класс изменен на: ${className}`);
        } else {
            console.log('Доступные классы: archer, swordsman');
        }
    } else {
        console.log('Игрок не найден');
    }
}

// Функция для сброса золота
function resetGold() {
    if (game && game.goldSystem) {
        localStorage.removeItem('irys_gold');
        game.goldSystem.gold = 0;
        game.goldSystem.updateDisplay();
        console.log('Золото сброшено');
    }
}

// Функция для сброса постоянных улучшений
function resetUpgrades() {
    if (game && game.permanentUpgrades) {
        localStorage.removeItem('irys_permanent_upgrades');
        game.permanentUpgrades.upgrades = {};
        renderUpgrades();
        console.log('Постоянные улучшения сброшены');
    }
}

// Функция для очистки данных localStorage
function clearSaveData() {
    window.userManager.clearUserData();
    if (game) {
        game.reloadUserData();
    }
    console.log(i18n.get('notification.dataCleared'));
}

// Функции для работы с пользователем
function initializeUserInterface() {
    // Проверяем userManager
    if (!window.userManager) {
        console.error('UserManager не найден при инициализации интерфейса');
        return;
    }
    
    // Обновляем отображение текущего пользователя
    window.userManager.updateUserDisplay();
    
    // Обновляем лидерборд
    updateLeaderboard();
}

function changeUsername(username) {
    window.userManager.setUser(username);
    updateLeaderboard();
}

function handleUsernameKeypress(event) {
    if (event.key === 'Enter') {
        changeUsername(event.target.value);
    }
}

function updateLeaderboard() {
    if (!window.userManager) {
        console.error('UserManager не найден в updateLeaderboard');
        return;
    }
    
    const leaderboard = window.userManager.getLeaderboard();
    const currentUser = window.userManager.getCurrentUser();
    const userStats = window.userManager.getUserStats();
    
    // Обновляем личную статистику
    const bestScore = document.getElementById('bestScore');
    const bestTime = document.getElementById('bestTime');
    const bestLevel = document.getElementById('bestLevel');
    const totalGold = document.getElementById('totalGold');
    
    if (bestScore) bestScore.textContent = userStats.highscore.score;
    if (bestTime) bestTime.textContent = formatTime(userStats.highscore.time);
    if (bestLevel) bestLevel.textContent = userStats.highscore.level;
    if (totalGold) totalGold.textContent = userStats.gold;
    
    // Обновляем глобальный лидерборд
    const entriesContainer = document.getElementById('leaderboardEntries');
    if (entriesContainer) {
        if (leaderboard.length === 0) {
            entriesContainer.innerHTML = `
                <div class="empty-leaderboard">
                    <p>${i18n.get('leaderboard.emptyGlobal')}</p>
                </div>
            `;
        } else {
            entriesContainer.innerHTML = leaderboard.map((entry, index) => {
                const rank = index + 1;
                const isCurrentUser = entry.username === currentUser;
                
                let rankClass = 'rank';
                if (rank === 1) rankClass += ' gold';
                else if (rank === 2) rankClass += ' silver';
                else if (rank === 3) rankClass += ' bronze';
                
                return `
                    <div class="leaderboard-entry ${isCurrentUser ? 'current-user' : ''}">
                        <span class="${rankClass}">${rank}</span>
                        <span class="player">${entry.username}</span>
                        <span>${entry.score}</span>
                        <span>${entry.level}</span>
                        <span>${formatTime(entry.time)}</span>
                        <span>${entry.characterClass}</span>
                    </div>
                `;
            }).join('');
        }
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Функция для смены языка
function changeLanguage(language) {
    if (i18n.setLanguage(language)) {
        console.log(`Language changed to: ${language}`);
        
        // Обновляем золото в секции прокачки
        if (game) {
            const upgradesGold = document.getElementById('upgradesGold');
            if (upgradesGold) {
                upgradesGold.textContent = game.goldSystem.getGold();
            }
        }
        
        // Обновляем интерфейс прокачки
        if (document.getElementById('upgradesSection') && !document.getElementById('upgradesSection').classList.contains('hidden')) {
            renderUpgrades();
        }
        
        // Обновляем интерфейс рекордов
        if (document.getElementById('leaderboardSection') && !document.getElementById('leaderboardSection').classList.contains('hidden')) {
            renderLeaderboard();
        }
    }
}

// Функция для включения/выключения отладки
function toggleDebug() {
    if (game) {
        game.debug = !game.debug;
        console.log(`Отладка ${game.debug ? 'включена' : 'выключена'}`);
    } else {
        console.log('Игра не найдена');
    }
}

// Функция для получения версии игры
function getVersion() {
    return VERSION;
}

// Функция для полноэкранного режима
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

// Функция для создания тестовых улучшений
function createTestUpgrades() {
    console.log('Создание тестовых улучшений...');
    
    if (!game || !game.permanentUpgrades) {
        console.error('Система постоянных улучшений не найдена');
        return;
    }
    
    // Проверим, что определения улучшений существуют
    const definitions = game.permanentUpgrades.upgradeDefinitions;
    console.log('Определения улучшений:', definitions);
    
    if (!definitions || Object.keys(definitions).length === 0) {
        console.error('Определения улучшений пусты!');
        return;
    }
    
    // Добавим немного золота для тестирования
    game.goldSystem.addGold(1000);
    
    console.log('Тестовые улучшения созданы, золото добавлено');
    renderUpgrades();
}

// Глобальные команды разработчика
window.dev = {
    showStats,
    spawnTestEnemies,
    addExperience,
    addGold,
    healPlayer,
    addAllWeapons,
    changeClass,
    resetGold,
    resetUpgrades,
    toggleDebug,
    createTestUpgrades,
    clearSaveData,
    getVersion: () => VERSION
};

// Экспорт функций для использования в HTML
window.selectClass = selectClass;
window.startGame = startGame;
window.showUpgrades = showUpgrades;
window.hideUpgrades = hideUpgrades;
window.showLeaderboard = showLeaderboard;
window.hideLeaderboard = hideLeaderboard;
window.clearLeaderboard = clearLeaderboard;
window.toggleFullscreen = toggleFullscreen;
window.changeLanguage = changeLanguage;
window.changeUsername = changeUsername;
window.handleUsernameKeypress = handleUsernameKeypress;

// Горячие клавиши для разработчиков
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey) {
        switch (e.key) {
            case 'D':
                e.preventDefault();
                toggleDebug();
                break;
            case 'S':
                e.preventDefault();
                showStats();
                break;
            case 'E':
                e.preventDefault();
                spawnTestEnemies(10);
                break;
            case 'X':
                e.preventDefault();
                addExperience(500);
                break;
            case 'G':
                e.preventDefault();
                addGold(10); // Уменьшено в 50 раз (было 500)
                break;
            case 'H':
                e.preventDefault();
                healPlayer(100);
                break;
            case 'W':
                e.preventDefault();
                addAllWeapons();
                break;
            case 'R':
                e.preventDefault();
                if (game && game.currentState === game.states.PLAYING) {
                    game.restartGame();
                }
                break;
        }
    }
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен, запуск инициализации...');
    
    // Небольшая задержка для гарантии загрузки всех скриптов
    setTimeout(() => {
        init();
    }, 100);
});

// Обработчик для отладки выбора класса
document.addEventListener('DOMContentLoaded', () => {
    // Добавляем обработчики кликов на карточки классов
    document.querySelectorAll('.class-card').forEach(card => {
        card.addEventListener('click', () => {
            const classId = card.id.replace('Class', '');
            console.log('Клик по карточке класса:', classId);
            selectClass(classId);
        });
    });
});

// Инструкции для разработчиков
console.log(`
        === IRYS SURVIVORS v${VERSION} ===
BY https://x.com/M3TATON

Консольные команды:
- dev.showStats() - показать статистику
- dev.spawnTestEnemies(count) - создать тестовых врагов
- dev.addExperience(amount) - добавить опыт
- dev.addGold(amount) - добавить золото
- dev.healPlayer(amount) - вылечить игрока
- dev.addAllWeapons() - добавить все оружие
- dev.changeClass('archer'|'swordsman') - изменить класс
- dev.resetGold() - сбросить золото
- dev.resetUpgrades() - сбросить постоянные улучшения
- dev.toggleDebug() - включить/выключить отладку
- dev.getVersion() - получить версию игры

Горячие клавиши (Ctrl+Shift+):
- D - отладка
- S - статистика
- E - враги
- X - опыт
- G - золото
- H - лечение
- W - оружие
- R - рестарт

Новое в версии 0.1:
- Система классов персонажей (Лучник/Мечник)
- Система золота и постоянных улучшений
- Стилизованный интерфейс
- Улучшенная система рекордов
- Новые визуальные эффекты

Наслаждайтесь игрой!
`); 

// Инструкции для отладки
console.log(`
=== КОМАНДЫ ОТЛАДКИ ===

1. Проверка системы прокачки:
   dev.createTestUpgrades()

2. Показ статистики:
   dev.showStats()

3. Добавление золота:
   dev.addGold(100)

4. Сброс системы:
   dev.resetUpgrades()

5. Включение отладки:
   dev.toggleDebug()

6. Очистка всех данных:
   dev.clearSaveData()

=== ПРОБЛЕМЫ И РЕШЕНИЯ ===

Если кнопка "Начать игру" не работает:
- Откройте консоль (F12)
- Посмотрите на ошибки
- Попробуйте dev.clearSaveData() и перезагрузите страницу

Если в прокачке нет улучшений:
- Выполните dev.createTestUpgrades()
- Проверьте консоль на ошибки
- Убедитесь, что есть золото

Если ошибка "Cannot read properties of undefined":
- Выполните dev.clearSaveData()
- Перезагрузите страницу
- Старые данные будут очищены автоматически

Версия игры: ${VERSION}
`); 