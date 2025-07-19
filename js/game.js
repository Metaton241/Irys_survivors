// Основной игровой класс
class Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.running = false;
        this.paused = false;
        this.gameOver = false;
        this.score = 0;
        this.timeElapsed = 0;
        
        // Расширенная система очков
        this.scoreSystem = {
            combo: 0,
            maxCombo: 0,
            comboTimer: 0,
            comboTimeLimit: 5,
            lastKillTime: 0,
            timeBonus: 0,
            waveBonus: 0,
            killScore: 0, // Добавлено для учета очков за убийства
            comboMultiplier: 1,
            baseKillScore: 10
        };
        
        // Системы
        this.inputManager = new InputManager();
        this.timeManager = new TimeManager();
        this.particleSystem = new ParticleSystem();
        this.weaponSystem = new WeaponSystem();
        this.enemySystem = new EnemySystem();
        this.itemSystem = new ItemSystem();
        this.goldSystem = new GoldSystem();
        this.permanentUpgrades = new PermanentUpgradesSystem();
        this.player = null;
        this.selectedClass = 'archer'; // По умолчанию лучник
        
        // Состояния
        this.states = {
            MENU: 'menu',
            PLAYING: 'playing',
            PAUSED: 'paused',
            GAME_OVER: 'gameOver',
            LEVEL_UP: 'levelUp'
        };
        this.currentState = this.states.MENU;
        this.previousState = null;
        
        // Настройки
        this.debug = false;
        this.showFPS = true;
        this.maxFPS = 60;
        this.deltaTime = 0;
        this.fps = 0;
        this.frameCount = 0;
        this.fpsTime = 0;
        
        // Камера
        this.camera = {
            x: 0,
            y: 0,
            shake: 0,
            shakeTime: 0,
            targetX: 0,
            targetY: 0,
            smoothing: 0.1
        };
        
        // Фон
        this.background = {
            pattern: null,
            offsetX: 0,
            offsetY: 0,
            tileSize: 50
        };
        
        // UI элементы
        this.ui = {
            elements: new Map(),
            levelUpOptions: []
        };
        
        this.initializeCanvas();
        this.initializeBackground();
        this.setupEventListeners();
        this.setupVisibilityHandlers();
        this.createPlayer();
        this.updateGoldDisplay();
        // Обновление лидерборда обрабатывается в userManager
        
        // Запуск игрового цикла
        this.gameLoop();
    }

    initializeCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Обработчик изменения размера окна
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.initializeBackground();
        });
    }

    initializeBackground() {
        // Создание паттерна для фона
        const patternCanvas = document.createElement('canvas');
        patternCanvas.width = this.background.tileSize;
        patternCanvas.height = this.background.tileSize;
        const patternCtx = patternCanvas.getContext('2d');
        
        patternCtx.fillStyle = '#1a1a1a';
        patternCtx.fillRect(0, 0, this.background.tileSize, this.background.tileSize);
        
        patternCtx.strokeStyle = '#333';
        patternCtx.lineWidth = 1;
        patternCtx.strokeRect(0, 0, this.background.tileSize, this.background.tileSize);
        
        this.background.pattern = this.ctx.createPattern(patternCanvas, 'repeat');
    }

    setupEventListeners() {
        // Пауза по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.togglePause();
            }
            if (e.key === 'F3') {
                this.debug = !this.debug;
            }
        });
        
        // Обработка видимости вкладки
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.currentState === this.states.PLAYING) {
                this.pause();
            }
        });
    }

    setupVisibilityHandlers() {
        // Улучшенная обработка Page Visibility API
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('Игра скрыта, обновления приостановлены');
                // Автоматически ставим на паузу при скрытии
                if (this.currentState === this.states.PLAYING && !this.paused) {
                    this.paused = true;
                }
            } else {
                console.log('Игра видима, обновления возобновлены');
                // Автоматически возобновляем при возврате фокуса
                if (this.currentState === this.states.PLAYING && this.paused) {
                    this.paused = false;
                }
            }
        });
        
        // Дополнительные обработчики для фокуса окна
        window.addEventListener('focus', () => {
            if (this.currentState === this.states.PLAYING) {
                this.paused = false;
            }
        });
        
        window.addEventListener('blur', () => {
            if (this.currentState === this.states.PLAYING) {
                this.paused = true;
            }
        });
    }

    createPlayer() {
        this.player = new Player(this.canvas.width / 2, this.canvas.height / 2);
        this.player.inputManager = this.inputManager;
        
        // Применение выбранного класса
        this.applySelectedClass();
        
        // Применение постоянных улучшений
        this.permanentUpgrades.applyUpgrades(this.player);
        
        // Добавление базового оружия
        this.weaponSystem.addWeapon(this.player.characterClass.startingWeapon, this.player);
    }

    applySelectedClass() {
        let characterClass;
        
        switch (this.selectedClass) {
            case 'archer':
                characterClass = new ArcherClass();
                break;
            case 'swordsman':
                characterClass = new SwordsmanClass();
                break;
            // case 'bomber':
            //     characterClass = new BomberClass();
            //     break;
            default:
                characterClass = new ArcherClass();
        }
        
        this.player.setCharacterClass(characterClass);
    }

    gameLoop(currentTime = 0) {
        // Проверка видимости страницы - если страница скрыта, пропускаем обновление
        if (document.hidden) {
            // Продолжаем цикл, но не обновляем игру
            requestAnimationFrame((time) => this.gameLoop(time));
            return;
        }
        
        // Обновление времени
        this.timeManager.update(currentTime);
        this.deltaTime = this.timeManager.getDeltaTime();
        
        // Ограничение FPS
        if (this.deltaTime > 1 / this.maxFPS) {
            this.deltaTime = 1 / this.maxFPS;
        }
        
        // Обновление FPS
        this.updateFPS();
        
        // Обновление игры
        this.update(this.deltaTime);
        
        // Отрисовка
        this.render();
        
        // Следующий кадр
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    updateFPS() {
        this.frameCount++;
        this.fpsTime += this.deltaTime;
        
        if (this.fpsTime >= 1) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsTime = 0;
        }
    }

    update(deltaTime) {
        if (this.paused) return;
        
        switch (this.currentState) {
            case this.states.MENU:
                this.updateMenu(deltaTime);
                break;
            case this.states.PLAYING:
                this.updateGame(deltaTime);
                break;
            case this.states.LEVEL_UP:
                this.updateLevelUp(deltaTime);
                break;
            case this.states.GAME_OVER:
                this.updateGameOver(deltaTime);
                break;
        }
    }

    updateMenu(deltaTime) {
        // Обновление частиц в меню
        this.particleSystem.update(deltaTime);
    }

    updateGame(deltaTime) {
        // Обновление игрового времени
        this.timeElapsed += deltaTime;
        
        // Обновление игрока
        this.player.update(deltaTime);
        
        // Обновление систем
        this.weaponSystem.update(deltaTime);
        this.enemySystem.update(deltaTime, this.player);
        this.itemSystem.update(deltaTime);
        this.particleSystem.update(deltaTime);
        
        // Проверка коллизий
        this.checkCollisions();
        
        // Обновление камеры
        this.updateCamera(deltaTime);
        
        // Обновление системы очков
        this.updateScoreSystem(deltaTime);
        
        // Обновление UI
        this.updateUI();
    }

    updateLevelUp(deltaTime) {
        // Обновление систем в фоне
        this.particleSystem.update(deltaTime);
    }

    updateGameOver(deltaTime) {
        // Обновление частиц
        this.particleSystem.update(deltaTime);
    }

    checkCollisions() {
        // Коллизии оружия с врагами
        this.weaponSystem.checkCollisions(this.enemySystem.getActiveEnemies());
        
        // Коллизии врагов с игроком
        this.enemySystem.checkCollisions(this.player);
    }

    updateCamera(deltaTime) {
        if (!this.player || !this.player.active) return;
        
        // Следование за игроком
        this.camera.targetX = this.player.x - this.canvas.width / 2;
        this.camera.targetY = this.player.y - this.canvas.height / 2;
        
        // Плавное следование
        this.camera.x += (this.camera.targetX - this.camera.x) * this.camera.smoothing;
        this.camera.y += (this.camera.targetY - this.camera.y) * this.camera.smoothing;
        
        // Обновление тряски камеры
        if (this.camera.shake > 0) {
            this.camera.shakeTime -= deltaTime;
            if (this.camera.shakeTime <= 0) {
                this.camera.shake = 0;
            } else {
                this.camera.x += (Math.random() - 0.5) * this.camera.shake;
                this.camera.y += (Math.random() - 0.5) * this.camera.shake;
            }
        }
    }

    updateUI() {
        // Обновление элементов UI
        document.getElementById('level').textContent = this.player.level;
        document.getElementById('score').textContent = this.score;
        document.getElementById('time').textContent = this.formatTime(this.timeElapsed);
        document.getElementById('hp').textContent = Math.ceil(this.player.health);
        document.getElementById('xp').textContent = this.player.experience;
        document.getElementById('xpNext').textContent = this.player.experienceToNext;
        
        // Обновление комбо
        const comboElement = document.getElementById('comboValue');
        comboElement.textContent = this.scoreSystem.combo;
        
        // Скрытие комбо если оно меньше 10
        const comboContainer = document.getElementById('combo');
        if (this.scoreSystem.combo >= 10) {
            comboContainer.style.display = 'block';
            comboContainer.style.color = this.scoreSystem.combo > 10 ? '#ff0000' : '#ffff00';
        } else {
            comboContainer.style.display = 'none';
        }
        
        // Обновление полос
        const hpPercent = this.player.getHealthPercent();
        const xpPercent = this.player.getExperiencePercent();
        
        document.getElementById('hpFill').style.width = `${hpPercent * 100}%`;
        document.getElementById('xpFill').style.width = `${xpPercent * 100}%`;
        
        // Обновление отображения золота
        this.goldSystem.updateDisplay();
    }

    render() {
        // Очистка canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Сохранение состояния
        this.ctx.save();
        
        // Применение трансформации камеры
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Отрисовка фона
        this.renderBackground();
        
        // Отрисовка игровых объектов
        if (this.currentState === this.states.PLAYING || this.currentState === this.states.LEVEL_UP) {
            this.renderGame();
        }
        
        // Восстановление состояния
        this.ctx.restore();
        
        // Отрисовка UI
        this.renderUI();
        
        // Отрисовка состояний
        switch (this.currentState) {
            case this.states.MENU:
                this.renderMenu();
                break;
            case this.states.LEVEL_UP:
                this.renderLevelUpMenu();
                break;
            case this.states.GAME_OVER:
                this.renderGameOver();
                break;
        }
        
        // Отрисовка отладочной информации
        if (this.debug) {
            this.renderDebugInfo();
        }
    }

    renderBackground() {
        if (this.background.pattern) {
            this.ctx.fillStyle = this.background.pattern;
            this.ctx.fillRect(
                this.camera.x - 100,
                this.camera.y - 100,
                this.canvas.width + 200,
                this.canvas.height + 200
            );
        }
    }

    renderGame() {
        // Отрисовка предметов
        this.itemSystem.render(this.ctx);
        
        // Отрисовка игрока
        this.player.render(this.ctx);
        
        // Отрисовка врагов
        this.enemySystem.render(this.ctx);
        
        // Отрисовка оружия
        this.weaponSystem.render(this.ctx);
        
        // Отрисовка частиц
        this.particleSystem.render(this.ctx);
    }

    renderUI() {
        if (this.currentState !== this.states.PLAYING && this.currentState !== this.states.LEVEL_UP) {
            return;
        }
        
        // FPS счетчик
        if (this.showFPS) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '16px Courier New';
            this.ctx.fillText(`FPS: ${this.fps}`, 10, this.canvas.height - 10);
        }
    }

    renderMenu() {
        // Отрисовка частиц в меню
        this.particleSystem.render(this.ctx);
    }

    renderGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '48px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.ctx.font = '24px Courier New';
        this.ctx.fillText(`Счет: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillText(`Время: ${this.formatTime(this.timeElapsed)}`, this.canvas.width / 2, this.canvas.height / 2 + 30);
        this.ctx.fillText(`Уровень: ${this.player.level}`, this.canvas.width / 2, this.canvas.height / 2 + 60);
        this.ctx.fillText(`Золото заработано: ${this.goldSystem.goldEarned}`, this.canvas.width / 2, this.canvas.height / 2 + 90);
        
        this.ctx.font = '16px Courier New';
        this.ctx.fillText('Нажмите Enter для перезапуска', this.canvas.width / 2, this.canvas.height / 2 + 130);
        
        this.ctx.textAlign = 'left';
        
        // Обработка перезапуска
        if (this.inputManager.isKeyPressed('enter')) {
            this.restartGame();
        }
    }

    renderLevelUpMenu() {
        // Отрисовка меню повышения уровня
        // Обрабатывается в HTML/CSS
    }

    renderDebugInfo() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px Courier New';
        
        const info = [
            `Игрок: ${this.player.x.toFixed(0)}, ${this.player.y.toFixed(0)}`,
            `Камера: ${this.camera.x.toFixed(0)}, ${this.camera.y.toFixed(0)}`,
            `Враги: ${this.enemySystem.getEnemyCount()}`,
            `Снаряды: ${this.weaponSystem.projectiles.length}`,
            `Частицы: ${this.particleSystem.particleCount}`,
            `Сферы опыта: ${this.itemSystem.items.length}`,
            `Класс: ${this.player.characterClass ? this.player.characterClass.name : 'Неизвестно'}`,
            `Золото: ${this.goldSystem.getGold()}`
        ];
        
        info.forEach((text, index) => {
            this.ctx.fillText(text, 10, 20 + index * 20);
        });
    }

    // Методы управления состоянием
    startGame() {
        this.currentState = this.states.PLAYING;
        this.hideMenu();
        this.resetGame();
        this.showElement('gameUI');
    }

    pause() {
        this.previousState = this.currentState;
        this.currentState = this.states.PAUSED;
        this.paused = true;
    }

    resumeGame() {
        this.currentState = this.previousState || this.states.PLAYING;
        this.paused = false;
    }

    togglePause() {
        if (this.paused) {
            this.resumeGame();
        } else {
            this.pause();
        }
    }

    restartGame() {
        this.currentState = this.states.PLAYING;
        this.resetGame();
    }

    endGame() {
        if (this.gameOver) return;
        
        this.gameOver = true;
        this.currentState = this.states.GAME_OVER;
        
        // Сохранение рекорда
        this.saveHighScore();
        
        // Принудительная очистка комбо
        this.scoreSystem.combo = 0;
        this.scoreSystem.comboTimer = 0;
        this.scoreSystem.comboMultiplier = 1;
        console.log('Комбо принудительно сброшено при смерти игрока');
        
        // Принудительная очистка всех систем
        this.forceCleanup();
        
        // Скрытие игрового UI
        this.hideElement('gameUI');
        this.showMenu();
    }

    forceCleanup() {
        console.log('Принудительная очистка всех систем');
        
        // Очистка сфер опыта
        this.itemSystem.items.forEach(item => {
            if (item.active) {
                item.active = false;
                console.log('Принудительно удалена сфера опыта');
            }
        });
        
        // Очистка частиц
        this.particleSystem.emitters.forEach(emitter => {
            if (emitter.active) {
                emitter.active = false;
                console.log('Принудительно остановлен эмиттер');
            }
        });
        
        // Очистка массивов
        this.itemSystem.items = [];
        this.particleSystem.emitters = [];
        
        console.log('Принудительная очистка завершена');
    }

    resetGame() {
        this.score = 0;
        this.timeElapsed = 0;
        this.gameOver = false;
        
        // Сброс системы очков
        this.scoreSystem = {
            combo: 0,
            maxCombo: 0,
            comboTimer: 0,
            comboTimeLimit: 5,
            lastKillTime: 0,
            timeBonus: 0,
            waveBonus: 0,
            killScore: 0,
            comboMultiplier: 1,
            baseKillScore: 10
        };
        
        // Сброс системы золота
        this.goldSystem.reset();
        
        // Сброс игрока
        this.player.reset();
        
        // Применение выбранного класса
        this.applySelectedClass();
        
        // Применение постоянных улучшений
        this.permanentUpgrades.applyUpgrades(this.player);
        
        // Сброс систем
        this.weaponSystem.clear();
        this.enemySystem.clear();
        this.itemSystem.clear();
        this.particleSystem.clear();
        
        // Добавление базового оружия
        this.weaponSystem.addWeapon(this.player.characterClass.startingWeapon, this.player);
        
        // Сброс камеры
        this.camera.x = 0;
        this.camera.y = 0;
        this.camera.shake = 0;
        this.camera.shakeTime = 0;
    }

    showLevelUpMenu() {
        this.currentState = this.states.LEVEL_UP;
        this.timeManager.setTimeScale(0.1); // Замедление времени
        
        const upgrades = this.player.getAvailableUpgrades();
        this.ui.levelUpOptions = upgrades;
        
        this.renderLevelUpOptions(upgrades);
        this.showElement('levelUpMenu');
    }

    hideLevelUpMenu() {
        this.currentState = this.states.PLAYING;
        this.timeManager.setTimeScale(1); // Нормальное время
        this.hideElement('levelUpMenu');
    }

    renderLevelUpOptions(upgrades) {
        const container = document.getElementById('levelUpOptions');
        container.innerHTML = '';
        
        upgrades.forEach((upgrade, index) => {
            const option = document.createElement('div');
            option.className = 'level-up-option';
            option.onclick = () => this.selectUpgrade(upgrade);
            
            option.innerHTML = `
                <div class="option-icon">${upgrade.icon}</div>
                <div class="option-name">${upgrade.name}</div>
                <div class="option-description">${upgrade.description}</div>
            `;
            
            container.appendChild(option);
        });
    }

    selectUpgrade(upgrade) {
        if (upgrade.type === 'newWeapon') {
            this.player.addWeapon(upgrade.weaponClass);
        } else if (upgrade.type === 'weaponUpgrade') {
            upgrade.weapon.upgrade();
        } else {
            this.player.applyUpgrade(upgrade.type);
        }
        
        this.hideLevelUpMenu();
    }

    showMenu() {
        this.showElement('menu');
        this.updateGoldDisplay();
        // Обновление лидерборда обрабатывается в userManager
    }

    hideMenu() {
        this.hideElement('menu');
    }

    showElement(id) {
        const element = document.getElementById(id);
        if (element) {
            element.classList.remove('hidden');
        }
    }

    hideElement(id) {
        const element = document.getElementById(id);
        if (element) {
            element.classList.add('hidden');
        }
    }

    shakeCamera(intensity, duration) {
        this.camera.shake = intensity;
        this.camera.shakeTime = duration;
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    saveHighScore() {
        const currentScore = {
            score: this.score,
            time: this.timeElapsed,
            level: this.player.level,
            combo: this.scoreSystem.maxCombo,
            characterClass: this.player.characterClass ? this.player.characterClass.name : 'Unknown'
        };
        
        const highScore = window.userManager.getUserData('highscore', {
            score: 0,
            time: 0,
            level: 1,
            combo: 0,
            characterClass: 'Unknown'
        });
        
        let updated = false;
        
        if (currentScore.score > highScore.score) {
            highScore.score = currentScore.score;
            updated = true;
        }
        
        if (currentScore.time > highScore.time) {
            highScore.time = currentScore.time;
            updated = true;
        }
        
        if (currentScore.level > highScore.level) {
            highScore.level = currentScore.level;
            updated = true;
        }
        
        if (currentScore.combo > highScore.combo) {
            highScore.combo = currentScore.combo;
            updated = true;
        }
        
        if (updated) {
            window.userManager.setUserData('highscore', highScore);
        }
        
        // Сохранение в глобальный лидерборд
        window.userManager.saveToLeaderboard(
            this.score,
            this.timeElapsed,
            this.player.level,
            this.player.characterClass ? this.player.characterClass.name : 'Unknown'
        );
    }

    loadHighScore() {
        return window.userManager.getUserData('highscore', {
            score: 0,
            time: 0,
            level: 1,
            combo: 0,
            characterClass: 'Unknown'
        });
    }

    updateGoldDisplay() {
        this.goldSystem.updateDisplay();
    }



    updateScoreSystem(deltaTime) {
        // Обновление комбо таймера
        if (this.scoreSystem.comboTimer > 0) {
            this.scoreSystem.comboTimer -= deltaTime;
            if (this.scoreSystem.comboTimer <= 0) {
                console.log('Комбо сброшено по таймеру:', this.scoreSystem.combo, '-> 0');
                this.scoreSystem.combo = 0;
                this.scoreSystem.comboTimer = 0;
                this.scoreSystem.comboMultiplier = 1;
            }
        }
        
        // Принудительный сброс комбо если игрок неактивен слишком долго
        if (this.scoreSystem.combo > 0 && this.scoreSystem.comboTimer <= 0) {
            console.log('Принудительный сброс комбо из-за бездействия');
            this.scoreSystem.combo = 0;
            this.scoreSystem.comboTimer = 0;
            this.scoreSystem.comboMultiplier = 1;
        }

        // Очки за время выживания
        this.scoreSystem.timeBonus = Math.floor(this.timeElapsed * 2);
        
        // Очки за волны
        const waveInfo = this.enemySystem.getWaveInfo();
        this.scoreSystem.waveBonus = (waveInfo.currentWave - 1) * 100;
        
        // Обновление общего счета
        this.score = this.scoreSystem.timeBonus + this.scoreSystem.waveBonus + this.scoreSystem.killScore;
    }

    addKillScore(baseScore) {
        // Увеличение комбо
        this.scoreSystem.combo++;
        this.scoreSystem.comboTimer = this.scoreSystem.comboTimeLimit;
        console.log('Комбо увеличено до:', this.scoreSystem.combo, 'таймер:', this.scoreSystem.comboTimer);
        
        if (this.scoreSystem.combo > this.scoreSystem.maxCombo) {
            this.scoreSystem.maxCombo = this.scoreSystem.combo;
        }
        
        // Расчет множителя комбо
        this.scoreSystem.comboMultiplier = 1 + (this.scoreSystem.combo * 0.1);
        
        // Добавление очков с учетом комбо
        const killScore = Math.floor(baseScore * this.scoreSystem.comboMultiplier);
        this.scoreSystem.killScore += killScore;
        
        // Добавление золота за убийство
        const goldReward = Math.max(1, Math.floor(killScore / 500)); // Уменьшено в 50 раз (было / 10)
        this.goldSystem.addGold(goldReward);
        
        // Создание текста очков только для комбо кратных 20
        if (this.particleSystem && this.scoreSystem.combo >= 20 && this.scoreSystem.combo % 20 === 0) {
            this.particleSystem.createScoreText(
                this.player.x, 
                this.player.y - 30, 
                `${killScore} x${this.scoreSystem.combo}`, 
                '#ffff00'
            );
        }
        
        // Создание комбо-эффекта каждые 20 убийств (20, 40, 60, 80...)
        if (this.particleSystem && this.scoreSystem.combo >= 20 && this.scoreSystem.combo % 20 === 0) {
            this.createComboEffect();
        }
        
        return killScore;
    }

    createComboEffect() {
        // Создание большого комбо-эффекта
        const comboText = `КОМБО x${this.scoreSystem.combo}!`;
        
        // Создание большого текста комбо
        const comboEmitter = this.particleSystem.createScoreText(
            this.player.x, 
            this.player.y - 50, 
            comboText, 
            '#ff00ff'
        );
        
        // Модификация для более долгого отображения (5 секунд)
        if (comboEmitter.particles.length > 0) {
            const textParticle = comboEmitter.particles[0];
            textParticle.life = 5;
            textParticle.maxLife = 5;
            textParticle.size = 20;
            textParticle.velY = -30;
        }
        
        // Создание дополнительных частиц для эффекта
        const explosionEmitter = this.particleSystem.createExplosion(
            this.player.x, 
            this.player.y, 
            20, 
            '#ff00ff'
        );
        
        // Модификация взрыва для более долгого эффекта
        explosionEmitter.duration = 0.5;
        explosionEmitter.emissionRate = 40;
        explosionEmitter.minLife = 3;
        explosionEmitter.maxLife = 5;
        explosionEmitter.minSize = 8;
        explosionEmitter.maxSize = 12;
        explosionEmitter.minVelocity = 100;
        explosionEmitter.maxVelocity = 200;
    }

    setSelectedClass(className) {
        this.selectedClass = className;
        window.userManager.setUserData('selected_class', className);
    }

    loadSelectedClass() {
        return window.userManager.getUserData('selected_class', 'archer');
    }

    // Метод для перезагрузки данных пользователя
    reloadUserData() {
        // Перезагружаем данные для нового пользователя
        this.selectedClass = this.loadSelectedClass();
        this.goldSystem = new GoldSystem();
        this.permanentUpgrades = new PermanentUpgradesSystem();
        
        // Обновляем UI
        if (typeof updateClassSelection === 'function') updateClassSelection();
        if (typeof renderUpgrades === 'function') renderUpgrades();
        if (typeof updateLeaderboard === 'function') updateLeaderboard();
        
        console.log('User data reloaded for:', window.userManager.getCurrentUser());
    }

    // Методы для работы с постоянными улучшениями
    purchaseUpgrade(upgradeId) {
        return this.permanentUpgrades.purchaseUpgrade(upgradeId, this.goldSystem);
    }

    getAllUpgrades() {
        return this.permanentUpgrades.getAllUpgrades();
    }
}

// Экспорт класса
window.Game = Game; 