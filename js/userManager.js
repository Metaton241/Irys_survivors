// User Management System for IRYS SURVIVORS
// Based on best practices from Context7 and Unstorage

class UserManager {
    constructor() {
        this.currentUser = null;
        this.defaultUser = 'Guest';
        this.userPrefix = 'irys_user_';
        this.globalPrefix = 'irys_global_';
        this.leaderboardKey = 'irys_leaderboard';
        
        this.initialize();
    }

    initialize() {
        // Загружаем текущего пользователя или создаем анонимного
        this.currentUser = this.loadCurrentUser() || this.defaultUser;
        
        // Миграция существующих данных к анонимному пользователю
        this.migrateExistingData();
        
        console.log('UserManager initialized for user:', this.currentUser);
    }

    loadCurrentUser() {
        return localStorage.getItem(this.globalPrefix + 'current_user');
    }

    saveCurrentUser(username) {
        localStorage.setItem(this.globalPrefix + 'current_user', username);
    }

    // Смена пользователя
    setUser(username) {
        if (!username || username.trim() === '') {
            username = this.defaultUser;
        }
        
        // Валидация ника
        username = this.validateUsername(username);
        
        if (username !== this.currentUser) {
            this.currentUser = username;
            this.saveCurrentUser(username);
            
            console.log('User changed to:', username);
            
            // Обновляем UI
            this.updateUserDisplay();
            
            // Перезагружаем данные игры для нового пользователя
            if (window.game) {
                window.game.reloadUserData();
            }
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    // Валидация ника
    validateUsername(username) {
        if (!username) return this.defaultUser;
        
        // Удаляем лишние пробелы
        username = username.trim();
        
        // Ограничиваем длину
        if (username.length > 20) {
            username = username.substring(0, 20);
        }
        
        // Убираем специальные символы
        username = username.replace(/[^a-zA-Zа-яА-Я0-9_\-\s]/g, '');
        
        // Если после очистки ничего не осталось
        if (username === '') {
            username = this.defaultUser;
        }
        
        return username;
    }

    // Получение ключа для пользовательских данных
    getUserKey(key) {
        return `${this.userPrefix}${this.currentUser}_${key}`;
    }

    // Получение ключа для глобальных данных
    getGlobalKey(key) {
        return `${this.globalPrefix}${key}`;
    }

    // Сохранение данных пользователя
    setUserData(key, value) {
        const fullKey = this.getUserKey(key);
        localStorage.setItem(fullKey, JSON.stringify(value));
    }

    // Загрузка данных пользователя
    getUserData(key, defaultValue = null) {
        const fullKey = this.getUserKey(key);
        const saved = localStorage.getItem(fullKey);
        return saved ? JSON.parse(saved) : defaultValue;
    }

    // Удаление данных пользователя
    removeUserData(key) {
        const fullKey = this.getUserKey(key);
        localStorage.removeItem(fullKey);
    }

    // Получение списка всех пользователей
    getAllUsers() {
        const users = new Set();
        
        // Проходим по всем ключам localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.userPrefix)) {
                // Извлекаем имя пользователя из ключа
                const keyParts = key.substring(this.userPrefix.length).split('_');
                if (keyParts.length >= 2) {
                    const username = keyParts[0];
                    users.add(username);
                }
            }
        }
        
        return Array.from(users);
    }

    // Миграция существующих данных
    migrateExistingData() {
        const oldKeys = [
            'irys_gold',
            'irys_permanent_upgrades',
            'irys_selected_class',
            'irys_highscore'
        ];
        
        // Проверяем, нужна ли миграция
        let needsMigration = false;
        for (const key of oldKeys) {
            if (localStorage.getItem(key)) {
                needsMigration = true;
                break;
            }
        }
        
        if (needsMigration) {
            console.log('Migrating existing data to Guest user...');
            
            // Переносим данные к пользователю Guest
            const guestUser = this.defaultUser;
            
            for (const key of oldKeys) {
                const value = localStorage.getItem(key);
                if (value) {
                    const newKey = `${this.userPrefix}${guestUser}_${key.replace('irys_', '')}`;
                    localStorage.setItem(newKey, value);
                    localStorage.removeItem(key);
                }
            }
            
            console.log('Data migration completed');
        }
    }

    // Система лидерборда
    saveToLeaderboard(score, time, level, characterClass) {
        const leaderboard = this.getLeaderboard();
        
        const entry = {
            username: this.currentUser,
            score: score,
            time: time,
            level: level,
            characterClass: characterClass,
            date: new Date().toISOString()
        };
        
        leaderboard.push(entry);
        
        // Сортируем по очкам (по убыванию)
        leaderboard.sort((a, b) => b.score - a.score);
        
        // Оставляем только топ 50
        const topEntries = leaderboard.slice(0, 50);
        
        localStorage.setItem(this.leaderboardKey, JSON.stringify(topEntries));
        
        console.log('Score saved to leaderboard:', entry);
    }

    getLeaderboard() {
        const saved = localStorage.getItem(this.leaderboardKey);
        return saved ? JSON.parse(saved) : [];
    }

    clearLeaderboard() {
        localStorage.removeItem(this.leaderboardKey);
        console.log('Leaderboard cleared');
    }

    // Очистка всех данных пользователя
    clearUserData() {
        const userKeys = [];
        
        // Находим все ключи пользователя
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.getUserKey(''))) {
                userKeys.push(key);
            }
        }
        
        // Удаляем все ключи пользователя
        userKeys.forEach(key => localStorage.removeItem(key));
        
        console.log(`All data cleared for user: ${this.currentUser}`);
    }

    // Экспорт данных пользователя
    exportUserData() {
        const userData = {};
        
        // Собираем все данные пользователя
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.getUserKey(''))) {
                const shortKey = key.substring(this.getUserKey('').length);
                userData[shortKey] = localStorage.getItem(key);
            }
        }
        
        return {
            username: this.currentUser,
            data: userData,
            exportDate: new Date().toISOString()
        };
    }

    // Импорт данных пользователя
    importUserData(exportData) {
        if (!exportData || !exportData.username || !exportData.data) {
            throw new Error('Invalid export data');
        }
        
        // Очищаем текущие данные
        this.clearUserData();
        
        // Импортируем новые данные
        Object.keys(exportData.data).forEach(key => {
            const fullKey = this.getUserKey(key);
            localStorage.setItem(fullKey, exportData.data[key]);
        });
        
        console.log(`Data imported for user: ${this.currentUser}`);
    }

    // Обновление отображения пользователя в UI
    updateUserDisplay() {
        const userDisplay = document.getElementById('currentUser');
        if (userDisplay) {
            userDisplay.textContent = this.currentUser;
        }
        
        const usernameInput = document.getElementById('usernameInput');
        if (usernameInput) {
            usernameInput.value = this.currentUser;
        }
    }

    // Получение статистики пользователя
    getUserStats() {
        const gold = this.getUserData('gold', 0);
        const upgrades = this.getUserData('permanent_upgrades', {});
        const selectedClass = this.getUserData('selected_class', 'archer');
        const highscore = this.getUserData('highscore', {
            score: 0,
            time: 0,
            level: 1,
            combo: 0,
            characterClass: 'Unknown'
        });
        
        return {
            username: this.currentUser,
            gold: gold,
            upgradesCount: Object.keys(upgrades).length,
            selectedClass: selectedClass,
            highscore: highscore
        };
    }
}

// Глобальный экземпляр
window.userManager = new UserManager(); 