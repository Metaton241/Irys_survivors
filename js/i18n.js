// Internationalization system for IRYS SURVIVORS
// Based on best practices from Context7

class I18nSystem {
    constructor() {
        this.fallbackLanguage = 'en';
        this.translations = {
            en: {
                // Menu
                'menu.title': 'IRYS SURVIVORS',
                'menu.startGame': 'Start Game',
                'menu.upgrades': 'Upgrades',
                'menu.leaderboard': 'Leaderboard',
                'menu.fullscreen': 'Fullscreen',
                'menu.language': 'Language',
                'menu.username': 'Username',
                'menu.usernamePlaceholder': 'Enter your username',
                'menu.currentUser': 'Current User:',
                
                // Class Selection
                'class.select': 'Select Class',
                'class.archer': 'Archer',
                'class.swordsman': 'Swordsman',
                'class.bomber': 'Bomber',
                'class.archer.desc': 'Ranged combat, high attack speed, medium durability',
                'class.swordsman.desc': 'Melee combat, high damage, high durability',
                'class.bomber.desc': 'Long-range explosive attacks, medium speed, powerful blasts',
                'class.stats.health': 'Health',
                'class.stats.speed': 'Speed',
                'class.stats.damage': 'Damage',
                'class.stats.range': 'Range',
                
                // Game UI
                'game.level': 'Level',
                'game.score': 'Score',
                'game.gold': 'Gold',
                'game.time': 'Time',
                'game.combo': 'Combo',
                'game.pause': 'PAUSE',
                'game.paused': 'Game Paused',
                'game.resume': 'Press ESC to resume',
                
                // Game Over
                'gameover.title': 'GAME OVER',
                'gameover.score': 'Score: {0}',
                'gameover.time': 'Time: {0}',
                'gameover.level': 'Level: {0}',
                'gameover.goldEarned': 'Gold Earned: {0}',
                'gameover.restart': 'Press Enter to restart',
                
                // Upgrades
                'upgrades.title': 'Permanent Upgrades',
                'upgrades.back': 'Back',
                'upgrades.buy': 'Buy',
                'upgrades.bought': 'Bought',
                'upgrades.maxLevel': 'Max Level',
                'upgrades.cost': 'Cost: {0}',
                'upgrades.level': 'Level: {0}/{1}',
                'upgrades.currentGold': 'Current Gold: {0}',
                
                // Upgrade Names
                'upgrade.vitality': 'Vitality',
                'upgrade.vitality.desc': '+10 max health',
                'upgrade.agility': 'Agility',
                'upgrade.agility.desc': '+15 movement speed',
                'upgrade.damage': 'Power',
                'upgrade.damage.desc': '+8% weapon damage',
                'upgrade.defense': 'Defense',
                'upgrade.defense.desc': '+1 armor',
                'upgrade.recovery': 'Recovery',
                'upgrade.recovery.desc': '+0.5 health regeneration per second',
                'upgrade.fortune': 'Fortune',
                'upgrade.fortune.desc': '+5% experience gain',
                'upgrade.projectileSpeed': 'Projectile Speed',
                'upgrade.projectileSpeed.desc': '+10% projectile speed',
                'upgrade.goldRush': 'Gold Rush',
                'upgrade.goldRush.desc': '+8% gold gain',
                'upgrade.criticalHit': 'Critical Hit',
                'upgrade.criticalHit.desc': '+3% critical hit chance',
                'upgrade.vampiric': 'Vampiric',
                'upgrade.vampiric.desc': '+2% lifesteal',
                'upgrade.berserker': 'Berserker',
                'upgrade.berserker.desc': '+2% damage when low health',
                'upgrade.berserk': 'Berserker',
                'upgrade.berserk.desc': '+2% damage when low health',
                'upgrade.frost': 'Frost',
                'upgrade.frost.desc': '+4% chance to freeze enemies',
                'upgrade.swiftness': 'Swiftness',
                'upgrade.swiftness.desc': '+8% attack speed',
                'upgrade.precision': 'Precision',
                'upgrade.precision.desc': '+2% critical hit chance',
                'upgrade.vampirism': 'Vampirism',
                'upgrade.vampirism.desc': '+1% lifesteal',
                'upgrade.multishot': 'Multishot',
                'upgrade.multishot.desc': '+5% chance for extra projectile',
                'upgrade.explosive': 'Explosive',
                'upgrade.explosive.desc': '+4% chance for explosive damage',
                'upgrade.thorns': 'Thorns',
                'upgrade.thorns.desc': '+8% reflected damage',
                'upgrade.dodge': 'Dodge',
                'upgrade.dodge.desc': '+1% dodge chance',
                'upgrade.piercing': 'Piercing',
                'upgrade.piercing.desc': '+1 projectile piercing',
                'upgrade.poison': 'Poison Trail',
                'upgrade.poison.desc': '+2 poison damage',
                'upgrade.shielding': 'Shielding',
                'upgrade.shielding.desc': '+10 max shield',
                'upgrade.timeWarp': 'Time Warp',
                'upgrade.timeWarp.desc': '+1% chance to slow time',
                'upgrade.magnetism': 'Magnetism',
                'upgrade.magnetism.desc': '+10 item collection radius',
                'upgrade.weaponSlots': 'Weapon Slots',
                'upgrade.weaponSlots.desc': '+1 weapon slot',
                'upgrade.rangeBoost': 'Range Boost',
                'upgrade.rangeBoost.desc': '+8% attack range',
                'upgrade.adrenaline': 'Adrenaline',
                'upgrade.adrenaline.desc': '+5% speed when low health',
                'upgrade.ricochet': 'Ricochet',
                'upgrade.ricochet.desc': '+4% ricochet chance',
                'upgrade.elementalDamage': 'Elemental Damage',
                'upgrade.elementalDamage.desc': '+6% elemental damage',
                'upgrade.vampiricAura': 'Vampiric Aura',
                'upgrade.vampiricAura.desc': '+1 health per enemy kill',
                
                // Leaderboard
                'leaderboard.title': 'Leaderboard',
                'leaderboard.clear': 'Clear',
                'leaderboard.empty': 'No records yet',
                'leaderboard.position': 'Position',
                'leaderboard.score': 'Score',
                'leaderboard.time': 'Time',
                'leaderboard.level': 'Level',
                'leaderboard.gold': 'Gold',
                'leaderboard.class': 'Class',
                'leaderboard.yourStats': 'Your Personal Stats',
                'leaderboard.global': 'Global Leaderboard',
                'leaderboard.rank': 'Rank',
                'leaderboard.player': 'Player',
                'leaderboard.emptyGlobal': 'No players yet. Be the first to play!',
                
                // Errors
                'error.initFailed': 'Game initialization failed',
                'error.checkConsole': 'Check console for details',
                'error.reload': 'Reload',
                
                // Debug
                'debug.commands': 'Debug Commands',
                'debug.stats': 'Show Statistics',
                'debug.addGold': 'Add Gold',
                'debug.resetUpgrades': 'Reset Upgrades',
                'debug.clearData': 'Clear Save Data',
                'debug.version': 'Version',
                
                // Notifications
                'notification.goldAdded': 'Gold added: {0}',
                'notification.upgradesPurchased': 'Upgrade purchased: {0}',
                'notification.notEnoughGold': 'Not enough gold',
                'notification.upgradeMaxLevel': 'Upgrade at max level',
                'notification.classChanged': 'Class changed to: {0}',
                'notification.gameStarted': 'Game started successfully',
                'notification.dataSaved': 'Data saved',
                'notification.dataCleared': 'All save data cleared. Please reload.',
                
                // Combo notifications
                'combo.kills': '{0} kills combo!',
                'combo.streak': 'Kill streak: {0}',
            },
            
            ru: {
                // Menu
                'menu.title': 'IRYS SURVIVORS',
                'menu.startGame': 'Начать игру',
                'menu.upgrades': 'Прокачка',
                'menu.leaderboard': 'Рекорды',
                'menu.fullscreen': 'Полный экран',
                'menu.language': 'Язык',
                'menu.username': 'Имя игрока',
                'menu.usernamePlaceholder': 'Введите ваше имя',
                'menu.currentUser': 'Текущий игрок:',
                
                // Class Selection
                'class.select': 'Выбор класса',
                'class.archer': 'Лучник',
                'class.swordsman': 'Мечник',
                'class.bomber': 'Бомбардир',
                'class.archer.desc': 'Дальний бой, высокая скорость атаки, средняя прочность',
                'class.swordsman.desc': 'Ближний бой, высокий урон, большая прочность',
                'class.bomber.desc': 'Дальняя взрывная атака, средняя скорость, мощные взрывы',
                'class.stats.health': 'Здоровье',
                'class.stats.speed': 'Скорость',
                'class.stats.damage': 'Урон',
                'class.stats.range': 'Дальность',
                
                // Game UI
                'game.level': 'Уровень',
                'game.score': 'Счет',
                'game.gold': 'Золото',
                'game.time': 'Время',
                'game.combo': 'Комбо',
                'game.pause': 'ПАУЗА',
                'game.paused': 'Игра на паузе',
                'game.resume': 'Нажмите ESC для продолжения',
                
                // Game Over
                'gameover.title': 'ИГРА ОКОНЧЕНА',
                'gameover.score': 'Счет: {0}',
                'gameover.time': 'Время: {0}',
                'gameover.level': 'Уровень: {0}',
                'gameover.goldEarned': 'Золото заработано: {0}',
                'gameover.restart': 'Нажмите Enter для перезапуска',
                
                // Upgrades
                'upgrades.title': 'Постоянные улучшения',
                'upgrades.back': 'Назад',
                'upgrades.buy': 'Купить',
                'upgrades.bought': 'Куплено',
                'upgrades.maxLevel': 'Макс. уровень',
                'upgrades.cost': 'Стоимость: {0}',
                'upgrades.level': 'Уровень: {0}/{1}',
                'upgrades.currentGold': 'Текущее золото: {0}',
                
                // Upgrade Names
                'upgrade.vitality': 'Жизненная сила',
                'upgrade.vitality.desc': '+10 к максимальному здоровью',
                'upgrade.agility': 'Ловкость',
                'upgrade.agility.desc': '+15 к скорости движения',
                'upgrade.damage': 'Мощь',
                'upgrade.damage.desc': '+8% к урону оружия',
                'upgrade.defense': 'Защита',
                'upgrade.defense.desc': '+1 к броне',
                'upgrade.recovery': 'Восстановление',
                'upgrade.recovery.desc': '+0.5 к регенерации здоровья в секунду',
                'upgrade.fortune': 'Удача',
                'upgrade.fortune.desc': '+5% к получению опыта',
                'upgrade.projectileSpeed': 'Скорость снарядов',
                'upgrade.projectileSpeed.desc': '+10% к скорости снарядов',
                'upgrade.goldRush': 'Золотая лихорадка',
                'upgrade.goldRush.desc': '+8% к получению золота',
                'upgrade.criticalHit': 'Критический удар',
                'upgrade.criticalHit.desc': '+3% шанс критического удара',
                'upgrade.vampiric': 'Вампиризм',
                'upgrade.vampiric.desc': '+2% вампиризма',
                'upgrade.berserker': 'Берсерк',
                'upgrade.berserker.desc': '+2% урона при низком здоровье',
                'upgrade.berserk': 'Берсерк',
                'upgrade.berserk.desc': '+2% урона при низком здоровье',
                'upgrade.frost': 'Заморозка',
                'upgrade.frost.desc': '+4% шанс заморозки врагов',
                'upgrade.swiftness': 'Быстрота',
                'upgrade.swiftness.desc': '+8% к скорости атаки',
                'upgrade.precision': 'Точность',
                'upgrade.precision.desc': '+2% шанс критического удара',
                'upgrade.vampirism': 'Вампиризм',
                'upgrade.vampirism.desc': '+1% восстановления здоровья от урона',
                'upgrade.multishot': 'Множественный выстрел',
                'upgrade.multishot.desc': '+5% шанс дополнительного снаряда',
                'upgrade.explosive': 'Взрывчатка',
                'upgrade.explosive.desc': '+4% шанс взрывного урона',
                'upgrade.thorns': 'Шипы',
                'upgrade.thorns.desc': '+8% отраженного урона',
                'upgrade.dodge': 'Уклонение',
                'upgrade.dodge.desc': '+1% шанс уклонения',
                'upgrade.piercing': 'Пробитие',
                'upgrade.piercing.desc': '+1 к пробитию снарядов',
                'upgrade.poison': 'Ядовитый след',
                'upgrade.poison.desc': '+2 единицы урона от яда',
                'upgrade.shielding': 'Щит',
                'upgrade.shielding.desc': '+10 к максимальному щиту',
                'upgrade.timeWarp': 'Замедление времени',
                'upgrade.timeWarp.desc': '+1% шанс замедления времени',
                'upgrade.magnetism': 'Магнетизм',
                'upgrade.magnetism.desc': '+10 к радиусу сбора предметов',
                'upgrade.weaponSlots': 'Слоты оружия',
                'upgrade.weaponSlots.desc': '+1 слот для оружия',
                'upgrade.rangeBoost': 'Увеличение дальности',
                'upgrade.rangeBoost.desc': '+8% к дальности атаки',
                'upgrade.adrenaline': 'Адреналин',
                'upgrade.adrenaline.desc': '+5% скорости при низком здоровье',
                'upgrade.ricochet': 'Рикошет',
                'upgrade.ricochet.desc': '+4% шанс рикошета',
                'upgrade.elementalDamage': 'Стихийный урон',
                'upgrade.elementalDamage.desc': '+6% стихийного урона',
                'upgrade.vampiricAura': 'Вампирская аура',
                'upgrade.vampiricAura.desc': '+1 здоровья за убийство врага',
                
                // Leaderboard
                'leaderboard.title': 'Таблица рекордов',
                'leaderboard.clear': 'Очистить',
                'leaderboard.empty': 'Пока нет записей',
                'leaderboard.position': 'Место',
                'leaderboard.score': 'Очки',
                'leaderboard.time': 'Время',
                'leaderboard.level': 'Уровень',
                'leaderboard.gold': 'Золото',
                'leaderboard.class': 'Класс',
                'leaderboard.yourStats': 'Ваша личная статистика',
                'leaderboard.global': 'Глобальный лидерборд',
                'leaderboard.rank': 'Ранг',
                'leaderboard.player': 'Игрок',
                'leaderboard.emptyGlobal': 'Пока нет игроков. Будьте первым!',
                
                // Errors
                'error.initFailed': 'Ошибка инициализации игры',
                'error.checkConsole': 'Проверьте консоль для подробностей',
                'error.reload': 'Перезагрузить',
                
                // Debug
                'debug.commands': 'Команды отладки',
                'debug.stats': 'Показать статистику',
                'debug.addGold': 'Добавить золото',
                'debug.resetUpgrades': 'Сбросить улучшения',
                'debug.clearData': 'Очистить данные',
                'debug.version': 'Версия',
                
                // Notifications
                'notification.goldAdded': 'Золото добавлено: {0}',
                'notification.upgradesPurchased': 'Улучшение куплено: {0}',
                'notification.notEnoughGold': 'Недостаточно золота',
                'notification.upgradeMaxLevel': 'Улучшение на максимальном уровне',
                'notification.classChanged': 'Класс изменен на: {0}',
                'notification.gameStarted': 'Игра успешно запущена',
                'notification.dataSaved': 'Данные сохранены',
                'notification.dataCleared': 'Все сохранённые данные очищены. Перезагрузите страницу.',
                
                // Combo notifications
                'combo.kills': '{0} убийств подряд!',
                'combo.streak': 'Серия убийств: {0}',
            }
        };
        
        this.initializeLanguage();
    }
    
    loadLanguage() {
        const saved = localStorage.getItem('irys_language');
        if (saved && this.isValidLanguage(saved)) {
            return saved;
        }
        
        // Auto-detect browser language
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('ru')) {
            return 'ru';
        }
        
        return 'en'; // Default to English
    }
    
    isValidLanguage(lang) {
        return this.translations && this.translations.hasOwnProperty(lang);
    }
    
    setLanguage(lang) {
        if (!this.isValidLanguage(lang)) {
            console.warn(`Invalid language: ${lang}`);
            return false;
        }
        
        this.currentLanguage = lang;
        localStorage.setItem('irys_language', lang);
        this.updatePageTexts();
        return true;
    }
    
    get(key, ...args) {
        const translation = this.translations[this.currentLanguage][key] || 
                          this.translations[this.fallbackLanguage][key] || 
                          key;
        
        // Simple string interpolation
        return this.interpolate(translation, args);
    }
    
    interpolate(text, args) {
        return text.replace(/\{(\d+)\}/g, (match, index) => {
            return args[index] !== undefined ? args[index] : match;
        });
    }
    
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    getAvailableLanguages() {
        return Object.keys(this.translations);
    }
    
    getLanguageName(lang) {
        const names = {
            'en': 'English',
            'ru': 'Русский'
        };
        return names[lang] || lang;
    }
    
    initializeLanguage() {
        // Set current language after translations are initialized
        this.currentLanguage = this.loadLanguage();
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.updatePageTexts();
            });
        } else {
            this.updatePageTexts();
        }
    }
    
    updatePageTexts() {
        // Update all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.get(key);
            
            if (element.tagName === 'INPUT' && (element.type === 'button' || element.type === 'submit')) {
                element.value = translation;
            } else {
                element.textContent = translation;
            }
        });
        
        // Update placeholders
        const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
        placeholders.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.get(key);
        });
        
        // Update titles
        const titles = document.querySelectorAll('[data-i18n-title]');
        titles.forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.get(key);
        });
        
        // Update language selector
        this.updateLanguageSelector();
    }
    
    updateLanguageSelector() {
        const selector = document.getElementById('languageSelector');
        if (selector) {
            selector.value = this.currentLanguage;
        }
    }
    
    // Helper for dynamic text updates
    updateText(elementId, key, ...args) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = this.get(key, ...args);
        }
    }
    
    // Helper for dynamic HTML updates
    updateHTML(elementId, key, ...args) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = this.get(key, ...args);
        }
    }
}

// Global instance
const i18n = new I18nSystem();

// Export for use in other modules
window.i18n = i18n; 