// Загрузка изображений игроков
const playerImages = {
    archer: null,
    swordman: null
};

// Функция загрузки изображений игроков
function loadPlayerImages() {
    console.log('Загрузка изображений игроков...');
    
    // Создаем изображение лучника
    playerImages.archer = new Image();
    playerImages.archer.src = 'images/archer.png';
    playerImages.archer.onerror = function() {
        console.error('Ошибка загрузки изображения лучника');
        playerImages.archer = null;
    };
    playerImages.archer.onload = function() {
        console.log('Изображение лучника загружено успешно');
    };
    
    // Создаем изображение мечника
    playerImages.swordman = new Image();
    playerImages.swordman.src = 'images/swordman.png';
    playerImages.swordman.onerror = function() {
        console.error('Ошибка загрузки изображения мечника');
        playerImages.swordman = null;
    };
    playerImages.swordman.onload = function() {
        console.log('Изображение мечника загружено успешно');
    };
    
    console.log('Запрошены изображения: archer=', playerImages.archer.src, 'swordman=', playerImages.swordman.src);
}

// Загружаем изображения при загрузке страницы
if (typeof window !== 'undefined') {
    window.addEventListener('load', loadPlayerImages);
}

// Базовый класс персонажа
class CharacterClass {
    constructor(name, icon, description) {
        this.name = name;
        this.icon = icon;
        this.description = description;
        this.baseStats = {
            maxHealth: 100,
            speed: 720,
            regeneration: 0,
            weaponDamage: 1,
            weaponSpeed: 1,
            armor: 0,
            luck: 0,
            magnet: 0
        };
        this.startingWeapon = Weapon;
        this.specialAbilities = [];
    }

    applyToPlayer(player) {
        // Применение базовых характеристик класса
        Object.keys(this.baseStats).forEach(stat => {
            player.stats[stat] = this.baseStats[stat];
        });
        
        // Применение специальных способностей
        this.specialAbilities.forEach(ability => {
            ability.apply(player);
        });
        
        player.health = player.stats.maxHealth;
        player.characterClass = this;
    }
}

// Класс Лучник
class ArcherClass extends CharacterClass {
    constructor() {
        super('Лучник', '🏹', 'Дальний бой, высокая скорость атаки, средняя прочность');
        this.baseStats = {
            maxHealth: 90, // Увеличено с 80 до 90 для лучшего баланса
            speed: 1600, // Увеличено в 2 раза для лучшей динамики
            regeneration: 1.5, // Увеличено с 1 до 1.5
            weaponDamage: 1.3, // Увеличено с 1.2 до 1.3
            weaponSpeed: 1.6, // Увеличено с 1.5 до 1.6
            armor: 2, // Увеличено с 0 до 2
            luck: 0.15, // Увеличено с 0.1 до 0.15
            magnet: 15, // Увеличено с 10 до 15
            criticalChance: 0.05, // Базовый шанс крита
            range: 0.2 // Увеличенная дальность для лучника
        };
        this.startingWeapon = BowWeapon;
        this.specialAbilities = [
            {
                name: 'Быстрые рефлексы',
                description: 'Повышенная скорость передвижения',
                apply: (player) => {
                    player.stats.speed *= 1.1;
                }
            },
            {
                name: 'Меткость',
                description: 'Увеличенная дальность атаки',
                apply: (player) => {
                    player.baseRange = 600; // Увеличенная дальность
                }
            }
        ];
    }
}

// Класс Мечник
class SwordsmanClass extends CharacterClass {
    constructor() {
        super('Мечник', '⚔️', 'Ближний бой, высокий урон, большая прочность');
        this.baseStats = {
            maxHealth: 160, // Увеличено с 150 до 160
            speed: 1200, // Увеличено в 2 раза для лучшей динамики
            regeneration: 2.5, // Увеличено с 2 до 2.5
            weaponDamage: 1.7, // Увеличено с 1.5 до 1.7
            weaponSpeed: 0.9, // Увеличено с 0.8 до 0.9
            armor: 8, // Увеличено с 5 до 8
            luck: 0.08, // Увеличено с 0.05 до 0.08
            magnet: 8, // Увеличено с 5 до 8
            lifeSteal: 0.03, // Базовый вампиризм
            thornDamage: 0.1, // Базовое отражение урона
            berserkerRage: 0.02 // Базовый берсерк
        };
        this.startingWeapon = SwordWeapon;
        this.specialAbilities = [
            {
                name: 'Берсерк',
                description: 'Увеличенный урон при низком здоровье',
                apply: (player) => {
                    player.berserkerMode = true;
                }
            },
            {
                name: 'Стойкость',
                description: 'Повышенная броня и регенерация',
                apply: (player) => {
                    player.stats.armor += 3;
                    player.stats.regeneration += 1;
                }
            }
        ];
    }
}

// Класс Метатель бомб
class BomberClass extends CharacterClass {
    constructor() {
        super('Bomber', '💣', 'Long-range explosive attacks, medium speed, powerful blasts');
        this.baseStats = {
            maxHealth: 110, // Средняя живучесть
            speed: 1300, // Средняя скорость
            regeneration: 1.2, // Средняя регенерация
            weaponDamage: 2.0, // Высокий урон от взрывов
            weaponSpeed: 1.0, // Нормальная скорость атаки
            armor: 3, // Средняя броня
            luck: 0.1, // Средняя удача
            magnet: 12, // Средний магнетизм
            explosionRadius: 1.5, // Базовый радиус взрыва
            explosionDamage: 1.8, // Множитель урона взрыва
            knockbackPower: 1.2 // Сила отталкивания от взрывов
        };
        this.startingWeapon = BombWeapon;
        this.specialAbilities = [
            {
                name: 'Взрывчатка',
                description: 'Атаки наносят урон по области',
                apply: (player) => {
                    player.hasExplosiveAttacks = true;
                    player.explosionRadius = 80; // Базовый радиус взрыва
                }
            },
            {
                name: 'Подрывник',
                description: 'Увеличенный урон от взрывов',
                apply: (player) => {
                    player.explosionDamageMultiplier = 1.3;
                }
            }
        ];
    }
}

// Оружие мечника
class SwordWeapon extends Weapon {
    constructor(owner) {
        super(owner);
        this.damage = 25;
        this.fireRate = 1.5;
        this.range = 150; // Ближний бой
        this.projectileSpeed = 0; // Не летящий снаряд
        this.projectileLife = 0.3;
        this.name = "Меч";
        this.description = "Оружие ближнего боя";
        this.projectileType = SwordProjectile;
        this.spread = Math.PI / 6; // Широкий взмах
        this.slashAngle = 0; // Текущий угол взмаха
        this.slashStartAngle = 0; // Начальный угол взмаха
        this.slashArc = Math.PI / 2; // Дуга взмаха (90 градусов)
    }

    fire() {
        if (!this.canFire()) return [];

        this.lastFire = 0;
        
        // Определяем направление взмаха на основе движения игрока
        let slashDirection = this.owner.facingDirection;
        
        // Если игрок не двигается, взмах в сторону ближайшего врага
        if (this.owner.velX === 0 && this.owner.velY === 0) {
            const nearestEnemy = this.findNearestEnemyForDirection();
            if (nearestEnemy) {
                slashDirection = MathUtils.angle(this.owner.x, this.owner.y, nearestEnemy.x, nearestEnemy.y);
            }
        }

        // Устанавливаем углы взмаха
        this.slashStartAngle = slashDirection - this.slashArc / 2;
        this.slashAngle = this.slashStartAngle;
        
        // Создаем визуальный эффект взмаха
        const slashEffect = new SwordSlashEffect(
            this.owner.x,
            this.owner.y,
            this.slashStartAngle,
            this.slashArc,
            this.range,
            this.projectileLife,
            this.damage,
            this.owner
        );
        
        // Сразу наносим урон всем врагам в радиусе взмаха
        this.dealSlashDamage(slashDirection);
        
        return [slashEffect];
    }

    findNearestEnemyForDirection() {
        if (!window.game || !window.game.enemySystem) return null;
        
        // Ищем врагов в увеличенном радиусе для определения направления
        const enemies = window.game.enemySystem.getEnemiesInRange(
            this.owner.x, 
            this.owner.y, 
            this.range * 2
        );
        
        if (enemies.length === 0) return null;
        
        let nearest = null;
        let minDistance = Infinity;
        
        for (const enemy of enemies) {
            const distance = MathUtils.distance(
                this.owner.x, 
                this.owner.y, 
                enemy.x, 
                enemy.y
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                nearest = enemy;
            }
        }
        
        return nearest;
    }

    dealSlashDamage(slashDirection) {
        if (!window.game || !window.game.enemySystem) return;
        
        // Получаем всех врагов в радиусе взмаха
        const enemies = window.game.enemySystem.getEnemiesInRange(
            this.owner.x, 
            this.owner.y, 
            this.range
        );
        
        for (const enemy of enemies) {
            // Проверяем, находится ли враг в дуге взмаха
            const enemyAngle = MathUtils.angle(this.owner.x, this.owner.y, enemy.x, enemy.y);
            const angleDiff = MathUtils.normalizeAngle(enemyAngle - slashDirection);
            
            if (Math.abs(angleDiff) <= this.slashArc / 2) {
                // Враг в дуге взмаха - наносим урон
                let damage = this.damage;
                
                // Применяем берсерк множитель
                if (this.owner.berserkerMode && this.owner.berserkerMultiplier) {
                    damage *= this.owner.berserkerMultiplier;
                }
                
                enemy.takeDamage(damage);
                
                // Эффект попадания
                if (window.game && window.game.particleSystem) {
                    window.game.particleSystem.createHitEffect(enemy.x, enemy.y);
                }
            }
        }
    }

    // Добавляю метод upgrade() для улучшений меча
    upgrade() {
        this.level++;
        this.damage *= 1.15; // +15% урона
        this.fireRate *= 1.1; // +10% скорости атаки
        this.range *= 1.05; // +5% дальности (меньше чем у остальных)
        
        // Каждые 2 уровня увеличиваем дугу взмаха
        if (this.level % 2 === 0) {
            this.slashArc = Math.min(this.slashArc * 1.1, Math.PI); // Максимум 180°
        }
        
        // Сохраняем базовые значения
        if (this.baseDamage === undefined) {
            this.baseDamage = this.damage / 1.15;
        }
        if (this.baseFireRate === undefined) {
            this.baseFireRate = this.fireRate / 1.1;
        }
        if (this.baseRange === undefined) {
            this.baseRange = this.range / 1.05;
        }
    }
}

// Визуальный эффект взмаха меча
class SwordSlashEffect {
    constructor(x, y, startAngle, arc, range, life, damage, owner) {
        this.x = x;
        this.y = y;
        this.startAngle = startAngle;
        this.arc = arc;
        this.range = range;
        this.life = life;
        this.maxLife = life;
        this.damage = damage;
        this.owner = owner;
        this.active = true;
        this.color = '#e6e6fa';
        this.glowColor = '#ffffff';
        this.animationPhase = 0;
    }

    update(deltaTime) {
        if (!this.active) return;

        this.life -= deltaTime;
        if (this.life <= 0) {
            this.active = false;
            return;
        }

        // Обновляем фазу анимации
        this.animationPhase = 1 - (this.life / this.maxLife);
    }

    render(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Расчет альфа-канала для эффекта исчезновения
        const alpha = Math.sin(this.animationPhase * Math.PI) * 0.8;
        
        // Настройка стилей
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 4;
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        
        // Рисуем дугу взмаха
        ctx.beginPath();
        ctx.arc(0, 0, this.range, this.startAngle, this.startAngle + this.arc);
        ctx.stroke();
        
        // Рисуем несколько линий для эффекта взмаха
        const numLines = 5;
        for (let i = 0; i < numLines; i++) {
            const angle = this.startAngle + (this.arc / numLines) * i;
            const innerRadius = this.range * 0.3;
            const outerRadius = this.range * (0.8 + this.animationPhase * 0.2);
            
            const x1 = Math.cos(angle) * innerRadius;
            const y1 = Math.sin(angle) * innerRadius;
            const x2 = Math.cos(angle) * outerRadius;
            const y2 = Math.sin(angle) * outerRadius;
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
        
        // Эффект свечения
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 15;
        ctx.globalAlpha = alpha * 0.5;
        
        ctx.beginPath();
        ctx.arc(0, 0, this.range, this.startAngle, this.startAngle + this.arc);
        ctx.stroke();
        
        ctx.restore();
    }

    isOffScreen(width, height) {
        return false; // Эффект привязан к игроку
    }
}

// Снаряд меча (взмах) - оставляем для совместимости
class SwordProjectile extends Projectile {
    constructor(x, y, velX, velY, damage, life, owner) {
        super(x, y, velX, velY, damage, life, owner);
        this.size = 20;
        this.color = '#silver';
        this.piercing = 3; // Может пробивать врагов
        this.width = 40;
        this.height = 8;
    }

    render(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Отрисовка взмаха меча
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        
        // Эффект свечения
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        
        ctx.restore();
    }
}

// Система золота
class GoldSystem {
    constructor() {
        this.gold = this.loadGold();
        this.goldEarned = 0;
    }

    addGold(amount) {
        this.gold += amount;
        this.goldEarned += amount;
        this.saveGold();
        this.updateDisplay();
    }

    spendGold(amount) {
        if (this.gold >= amount) {
            this.gold -= amount;
            this.saveGold();
            this.updateDisplay();
            return true;
        }
        return false;
    }

    getGold() {
        return this.gold;
    }

    saveGold() {
        window.userManager.setUserData('gold', this.gold);
    }

    loadGold() {
        return window.userManager.getUserData('gold', 0);
    }

    updateDisplay() {
        const goldDisplay = document.getElementById('goldAmount');
        const gameGoldDisplay = document.getElementById('gameGold');
        
        if (goldDisplay) {
            goldDisplay.textContent = this.gold;
        }
        
        if (gameGoldDisplay) {
            gameGoldDisplay.textContent = this.goldEarned;
        }
    }

    reset() {
        this.goldEarned = 0;
        this.updateDisplay();
    }
}

// Система постоянных улучшений
class PermanentUpgradesSystem {
    constructor() {
        // Сначала создаем определения улучшений
        this.upgradeDefinitions = {
            vitality: {
                name: 'vitality',
                description: 'vitality',
                icon: '❤️',
                baseCost: 25,
                maxLevel: 25,
                effect: (level) => ({ maxHealth: 10 * level })
            },
            agility: {
                name: 'agility',
                description: 'agility',
                icon: '🏃',
                baseCost: 30,
                maxLevel: 20,
                effect: (level) => ({ speed: 15 * level })
            },
            damage: {
                name: 'damage',
                description: 'damage',
                icon: '⚔️',
                baseCost: 35,
                maxLevel: 15,
                effect: (level) => ({ weaponDamage: 0.08 * level })
            },
            defense: {
                name: 'defense',
                description: 'defense',
                icon: '🛡️',
                baseCost: 40,
                maxLevel: 30,
                effect: (level) => ({ armor: 1 * level })
            },
            recovery: {
                name: 'recovery',
                description: 'recovery',
                icon: '🔄',
                baseCost: 50,
                maxLevel: 20,
                effect: (level) => ({ regeneration: 0.5 * level })
            },
            fortune: {
                name: 'fortune',
                description: 'fortune',
                icon: '🍀',
                baseCost: 60,
                maxLevel: 10,
                effect: (level) => ({ luck: 0.05 * level })
            },
            magnetism: {
                name: 'magnetism',
                description: 'magnetism',
                icon: '🧲',
                baseCost: 75,
                maxLevel: 15,
                effect: (level) => ({ magnet: 10 * level }) // Было 25
            },
            swiftness: {
                name: 'swiftness',
                description: 'swiftness',
                icon: '⚡',
                baseCost: 45,
                maxLevel: 15,
                effect: (level) => ({ weaponSpeed: 0.08 * level }) // Было 0.15
            },
            precision: {
                name: 'precision',
                description: 'precision',
                icon: '🎯',
                baseCost: 80,
                maxLevel: 10,
                effect: (level) => ({ criticalChance: 0.02 * level }) // Было 0.05
            },
            vampirism: {
                name: 'vampirism',
                description: 'vampirism',
                icon: '🧛',
                baseCost: 100,
                maxLevel: 10,
                effect: (level) => ({ lifeSteal: 0.01 * level }) // Было 0.02
            },
            multishot: {
                name: 'multishot',
                description: 'multishot',
                icon: '🔫',
                baseCost: 120,
                maxLevel: 8,
                effect: (level) => ({ multishotChance: 0.05 * level }) // Было 0.1
            },
            explosive: {
                name: 'explosive',
                description: 'explosive',
                icon: '💣',
                baseCost: 140,
                maxLevel: 8,
                effect: (level) => ({ explosiveChance: 0.04 * level }) // Было 0.08
            },
            thorns: {
                name: 'thorns',
                description: 'thorns',
                icon: '🌵',
                baseCost: 110,
                maxLevel: 10,
                effect: (level) => ({ thornDamage: 0.08 * level }) // Было 0.15
            },
            dodge: {
                name: 'dodge',
                description: 'dodge',
                icon: '💨',
                baseCost: 150,
                maxLevel: 10,
                effect: (level) => ({ dodgeChance: 0.01 * level }) // Было 0.03
            },
            piercing: {
                name: 'piercing',
                description: 'piercing',
                icon: '🏹',
                baseCost: 90,
                maxLevel: 5,
                effect: (level) => ({ piercing: 1 * level })
            },
            velocity: {
                name: 'projectileSpeed',
                description: 'projectileSpeed',
                icon: '🚀',
                baseCost: 70,
                maxLevel: 10,
                effect: (level) => ({ projectileSpeed: 0.1 * level })
            },
            goldRush: {
                name: 'goldRush',
                description: 'goldRush',
                icon: '💰',
                baseCost: 130,
                maxLevel: 8,
                effect: (level) => ({ goldBonus: 0.08 * level })
            },
            berserker: {
                name: 'berserker',
                description: 'berserker',
                icon: '😤',
                baseCost: 160,
                maxLevel: 8,
                effect: (level) => ({ berserkerRage: 0.02 * level })
            },
            frost: {
                name: 'frost',
                description: 'frost',
                icon: '❄️',
                baseCost: 170,
                maxLevel: 8,
                effect: (level) => ({ frostAura: 0.04 * level })
            },
            poison: {
                name: 'poison',
                description: 'poison',
                icon: '☠️',
                baseCost: 180,
                maxLevel: 10,
                effect: (level) => ({ poisonTrail: 2 * level }) // Было 5
            },
            shielding: {
                name: 'shielding',
                description: 'shielding',
                icon: '🛡️',
                baseCost: 190,
                maxLevel: 8,
                effect: (level) => ({ shield: 10 * level }) // Было 25
            },
            timeWarp: {
                name: 'timeWarp',
                description: 'timeWarp',
                icon: '⏳',
                baseCost: 200,
                maxLevel: 5,
                effect: (level) => ({ timeWarpChance: 0.01 * level }) // Было 0.02
            },
            weaponSlots: {
                name: 'weaponSlots',
                description: 'weaponSlots',
                icon: '🔧',
                baseCost: 250,
                maxLevel: 3,
                effect: (level) => ({ weaponSlots: 1 * level })
            },
            rangeBoost: {
                name: 'rangeBoost',
                description: 'rangeBoost',
                icon: '🎯',
                baseCost: 65,
                maxLevel: 12,
                effect: (level) => ({ range: 0.08 * level }) // Было 0.15
            },
            adrenaline: {
                name: 'adrenaline',
                description: 'adrenaline',
                icon: '💊',
                baseCost: 95,
                maxLevel: 6,
                effect: (level) => ({ adrenalineBoost: 0.05 * level }) // Было 0.1
            },
            ricochet: {
                name: 'ricochet',
                description: 'ricochet',
                icon: '🎱',
                baseCost: 125,
                maxLevel: 6,
                effect: (level) => ({ ricochetChance: 0.04 * level }) // Было 0.08
            },
            elementalDamage: {
                name: 'elementalDamage',
                description: 'elementalDamage',
                icon: '🔥',
                baseCost: 180,
                maxLevel: 8,
                effect: (level) => ({ elementalDamage: 0.06 * level }) // Было 0.12
            },
            vampiricAura: {
                name: 'vampiricAura',
                description: 'vampiricAura',
                icon: '🧛',
                baseCost: 220,
                maxLevel: 5,
                effect: (level) => ({ vampiricAura: 1 * level }) // Было 2
            }
        };
        
        // Затем загружаем сохранённые данные
        this.upgrades = this.loadUpgrades();
    }

    getUpgradeLevel(upgradeId) {
        return this.upgrades[upgradeId] || 0;
    }

    getUpgradeCost(upgradeId) {
        const def = this.upgradeDefinitions[upgradeId];
        const level = this.getUpgradeLevel(upgradeId);
        return Math.floor(def.baseCost * Math.pow(1.5, level));
    }

    canUpgrade(upgradeId) {
        const def = this.upgradeDefinitions[upgradeId];
        const level = this.getUpgradeLevel(upgradeId);
        return level < def.maxLevel;
    }

    purchaseUpgrade(upgradeId, goldSystem) {
        if (!this.canUpgrade(upgradeId)) return false;
        
        const cost = this.getUpgradeCost(upgradeId);
        if (goldSystem.spendGold(cost)) {
            this.upgrades[upgradeId] = this.getUpgradeLevel(upgradeId) + 1;
            this.saveUpgrades();
            return true;
        }
        return false;
    }

    applyUpgrades(player) {
        Object.keys(this.upgrades).forEach(upgradeId => {
            const level = this.upgrades[upgradeId];
            const def = this.upgradeDefinitions[upgradeId];
            
            // Проверяем, существует ли определение улучшения
            if (!def) {
                console.warn(`Определение улучшения "${upgradeId}" не найдено. Пропускаем...`);
                return;
            }
            
            if (level > 0) {
                try {
                const effects = def.effect(level);
                Object.keys(effects).forEach(stat => {
                    if (stat === 'maxHealth') {
                        player.stats[stat] += effects[stat];
                        player.health = Math.min(player.health + effects[stat], player.stats.maxHealth);
                    } else {
                        player.stats[stat] += effects[stat];
                    }
                });
                } catch (error) {
                    console.error(`Ошибка при применении улучшения "${upgradeId}":`, error);
                }
            }
        });
    }

    getAllUpgrades() {
        return Object.keys(this.upgradeDefinitions).map(id => {
            const def = this.upgradeDefinitions[id];
            let effect = '';
            
            // Определяем эффект для отображения в карточке
            if (id === 'vitality') effect = '+10 health';
            else if (id === 'agility') effect = '+15 speed';
            else if (id === 'damage') effect = '+8% damage';
            else if (id === 'defense') effect = '+1 armor';
            else if (id === 'recovery') effect = '+0.5 regen';
            else if (id === 'fortune') effect = '+5% exp';
            else if (id === 'magnetism') effect = '+10 radius';
            else if (id === 'swiftness') effect = '+8% attack speed';
            else if (id === 'precision') effect = '+2% crit';
            else if (id === 'vampirism') effect = '+1% lifesteal';
            else if (id === 'multishot') effect = '+5% chance';
            else if (id === 'explosive') effect = '+4% chance';
            else if (id === 'thorns') effect = '+8% reflect';
            else if (id === 'dodge') effect = '+1% chance';
            else if (id === 'piercing') effect = '+1 pierce';
            else if (id === 'projectileSpeed') effect = '+10% speed';
            else if (id === 'goldRush') effect = '+8% gold';
            else if (id === 'berserker') effect = '+2% damage';
            else if (id === 'frost') effect = '+4% chance';
            else if (id === 'poison') effect = '+2 damage';
            else if (id === 'shielding') effect = '+10 shield';
            else if (id === 'timeWarp') effect = '+1% chance';
            else if (id === 'weaponSlots') effect = '+1 slot';
            else if (id === 'rangeBoost') effect = '+8% range';
            else if (id === 'adrenaline') effect = '+5% speed';
            else if (id === 'ricochet') effect = '+4% chance';
            else if (id === 'elementalDamage') effect = '+6% damage';
            else if (id === 'vampiricAura') effect = '+1 health';
            
            return {
                id,
                ...def,
            level: this.getUpgradeLevel(id),
            cost: this.getUpgradeCost(id),
                canUpgrade: this.canUpgrade(id),
                effect: effect
            };
        });
    }

    loadUpgrades() {
        let upgrades = window.userManager.getUserData('permanent_upgrades', {});
        
        // Миграция старых имён улучшений к новым
        const migrations = {
            'healthBoost': 'vitality',
            'speedBoost': 'agility',
            'damageBoost': 'damage',
            'armorBoost': 'defense',
            'regenBoost': 'recovery',
            'xpBoost': 'fortune',
            'berserk': 'berserker',
            'velocity': 'projectileSpeed'
        };
        
        let migrated = false;
        Object.keys(migrations).forEach(oldName => {
            if (upgrades[oldName]) {
                const newName = migrations[oldName];
                if (!upgrades[newName]) {
                    upgrades[newName] = upgrades[oldName];
                    console.log(`Миграция улучшения: ${oldName} → ${newName}`);
                }
                delete upgrades[oldName];
                migrated = true;
            }
        });
        
        // Очистка несуществующих улучшений
        let cleaned = false;
        Object.keys(upgrades).forEach(upgradeId => {
            if (!this.upgradeDefinitions[upgradeId]) {
                console.log(`Удаление несуществующего улучшения: ${upgradeId}`);
                delete upgrades[upgradeId];
                cleaned = true;
            }
        });
        
        // Сохраняем обновлённые данные, если были изменения
        if (migrated || cleaned) {
            this.saveUpgrades(upgrades);
            console.log('Данные улучшений обновлены');
        }
        
        return upgrades;
    }
    
    saveUpgrades(upgrades = null) {
        const dataToSave = upgrades || this.upgrades;
        window.userManager.setUserData('permanent_upgrades', dataToSave);
    }
}

// Класс игрока
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.velX = 0;
        this.velY = 0;
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.speed = 1440; // Увеличено в 2 раза для лучшей динамики
        this.size = 42; // Увеличено в 1.4 раза с 30 до 42
        this.color = '#00ff00';
        this.level = 1;
        this.experience = 0;
        this.experienceToNext = 100;
        this.active = true;
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        this.invulnerabilityDuration = 1;
        this.flashTime = 0;
        this.animationTime = 0;
        this.regeneration = 0;
        this.regenerationRate = 0;
        this.lastRegen = 0;
        
        // Характеристики
        this.stats = {
            maxHealth: 100,
            speed: 1440, // Увеличено в 2 раза для лучшей динамики
            regeneration: 0,
            weaponDamage: 1,
            weaponSpeed: 1,
            armor: 0,
            luck: 0,
            magnet: 0,
            // Новые характеристики
            criticalChance: 0,
            lifeSteal: 0,
            multishotChance: 0,
            explosiveChance: 0,
            thornDamage: 0,
            dodgeChance: 0,
            piercing: 0,
            projectileSpeed: 0,
            goldBonus: 0,
            berserkerRage: 0,
            frostAura: 0,
            poisonTrail: 0,
            shield: 0,
            timeWarpChance: 0,
            weaponSlots: 0,
            range: 0,
            adrenalineBoost: 0,
            ricochetChance: 0,
            elementalDamage: 0,
            vampiricAura: 0
        };
        
        // Улучшения
        this.upgrades = {
            vitality: 0,
            agility: 0,
            damage: 0,
            defense: 0,
            recovery: 0,
            fortune: 0,
            magnetism: 0,
            swiftness: 0,
            precision: 0,
            vampirism: 0,
            multishot: 0,
            explosive: 0,
            thorns: 0,
            dodge: 0,
            piercing: 0,
            velocity: 0,
            goldRush: 0,
            berserk: 0,
            frost: 0,
            poison: 0,
            shielding: 0,
            timeWarp: 0,
            weaponSlots: 0,
            rangeBoost: 0,
            adrenaline: 0,
            ricochet: 0,
            elementalDamage: 0,
            vampiricAura: 0
        };
        
        this.friction = 0.85;
        this.inputManager = null;
        this.weapons = [];
        this.collectRadius = 30;
        this.facingDirection = 0;
        this.baseRange = 500;
        this.characterClass = null;
        this.berserkerMode = false;
        
        // Визуальные эффекты
        this.visualEffects = {
            invincibility: {
                active: false,
                timeLeft: 0,
                color: '#f1c40f',
                pulseIntensity: 0.5
            },
            magnet: {
                active: false,
                timeLeft: 0,
                color: '#3498db',
                radius: 100
            },
            nuke: {
                active: false,
                timeLeft: 0,
                color: '#e74c3c'
            }
        };
    }

    setCharacterClass(characterClass) {
        console.log('Player.setCharacterClass:', characterClass.name);
        this.characterClass = characterClass;
        characterClass.applyToPlayer(this);
        console.log('Класс применен к игроку:', this.characterClass.name);
    }

    setInputManager(inputManager) {
        this.inputManager = inputManager;
    }

    update(deltaTime) {
        if (!this.active) return;

        this.animationTime += deltaTime;
        
        // Обновление таймеров
        if (this.invulnerable) {
            this.invulnerabilityTime -= deltaTime;
            if (this.invulnerabilityTime <= 0) {
                this.invulnerable = false;
            }
        }

        if (this.flashTime > 0) {
            this.flashTime -= deltaTime;
        }
        
        // Обновление визуальных эффектов
        this.updateVisualEffects(deltaTime);

        // Управление
        this.handleInput(deltaTime);

        // Применение физики
        this.velX *= this.friction;
        this.velY *= this.friction;

        // Обновление позиции
        this.x += this.velX * deltaTime;
        this.y += this.velY * deltaTime;

        // Регенерация
        this.handleRegeneration(deltaTime);

        // Обновление направления взгляда
        this.updateFacingDirection();

        // Автоматический сбор предметов
        this.collectNearbyItems();

        // Берсерк мод для мечника
        if (this.berserkerMode) {
            const healthPercent = this.health / this.stats.maxHealth;
            if (healthPercent < 0.5) {
                // Увеличение урона при низком здоровье
                this.berserkerMultiplier = 1 + (1 - healthPercent);
            } else {
                this.berserkerMultiplier = 1;
            }
        }
    }

    handleInput(deltaTime) {
        if (!this.inputManager) return;

        let moveX = 0;
        let moveY = 0;

        if (this.inputManager.isKeyPressed('w') || this.inputManager.isKeyPressed('arrowup')) {
            moveY = -1;
        }
        if (this.inputManager.isKeyPressed('s') || this.inputManager.isKeyPressed('arrowdown')) {
            moveY = 1;
        }
        if (this.inputManager.isKeyPressed('a') || this.inputManager.isKeyPressed('arrowleft')) {
            moveX = -1;
        }
        if (this.inputManager.isKeyPressed('d') || this.inputManager.isKeyPressed('arrowright')) {
            moveX = 1;
        }
        
        // Обработка клавиши E для сбора бонусов
        if (this.inputManager.isKeyJustPressed('e')) {
            this.collectPowerUps();
        }

        // Нормализация диагонального движения
        if (moveX !== 0 && moveY !== 0) {
            moveX *= 0.707;
            moveY *= 0.707;
        }

        // Применение движения
        const currentSpeed = this.stats.speed;
        this.velX += moveX * currentSpeed * deltaTime;
        this.velY += moveY * currentSpeed * deltaTime;
    }

    updateFacingDirection() {
        if (this.velX !== 0 || this.velY !== 0) {
            this.facingDirection = Math.atan2(this.velY, this.velX);
        }
    }

    handleRegeneration(deltaTime) {
        if (this.stats.regeneration > 0 && this.health < this.stats.maxHealth) {
            this.lastRegen += deltaTime;
            if (this.lastRegen >= 1) {
                this.heal(this.stats.regeneration);
                this.lastRegen = 0;
            }
        }
    }

    collectNearbyItems() {
        if (!window.game || !window.game.itemSystem) return;

        const items = window.game.itemSystem.getItemsInRange(
            this.x, this.y, this.collectRadius + this.stats.magnet
        );

        for (const item of items) {
            // Автоматически собираем только опыт, не бонусы
            if (item.active && !(item instanceof PowerUp)) {
                item.collect(this);
            }
        }
    }
    
    // Метод для ручного сбора бонусов (при нажатии E)
    collectPowerUps() {
        if (!window.game || !window.game.itemSystem) return;

        // Расширенный радиус для ручного сбора бонусов
        const collectRadius = this.collectRadius * 2; 
        
        const powerUps = window.game.itemSystem.items.filter(item => 
            item instanceof PowerUp && 
            item.active && 
            MathUtils.distance(this.x, this.y, item.x, item.y) <= collectRadius
        );

        // Если нашли хотя бы один бонус, собираем его
        if (powerUps.length > 0) {
            // Берем ближайший бонус
            powerUps.sort((a, b) => {
                const distA = MathUtils.distance(this.x, this.y, a.x, a.y);
                const distB = MathUtils.distance(this.x, this.y, b.x, b.y);
                return distA - distB;
            });
            
            const nearestPowerUp = powerUps[0];
            nearestPowerUp.collect(this);
            return true;
        }
        
        return false;
    }

    render(ctx) {
        if (!this.active) return;

        ctx.save();
        
        // Эффект мигания при неуязвимости
        if (this.invulnerable && this.flashTime > 0) {
            ctx.globalAlpha = 0.5;
        }

        // Берсерк эффект
        if (this.berserkerMode && this.berserkerMultiplier > 1) {
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 15;
        }

        // Отрисовка игрока
        ctx.translate(this.x, this.y);
        ctx.rotate(this.facingDirection);
        
        // Отрисовка визуальных эффектов
        this.renderVisualEffects(ctx);
        
        // Отрисовка изображения в зависимости от класса
        let playerImage = null;
        if (this.characterClass) {
            if (this.characterClass.name === 'Лучник' && playerImages.archer) {
                playerImage = playerImages.archer;
                if (!playerImage.complete) {
                    console.log('Изображение лучника не загружено полностью');
                }
            } else if (this.characterClass.name === 'Мечник' && playerImages.swordman) {
                playerImage = playerImages.swordman;
                if (!playerImage.complete) {
                    console.log('Изображение мечника не загружено полностью');
                }
            }
            
            if (this.characterClass.name === 'Мечник') {
                console.log('Отрисовка мечника:', playerImage ? 'изображение найдено' : 'изображение не найдено');
            }
        }
        
        if (playerImage) {
            // Отрисовка изображения
            ctx.drawImage(
                playerImage,
                -this.size / 2,
                -this.size / 2,
                this.size,
                this.size
            );
        } else {
            // Fallback - цветной квадрат
        if (this.characterClass) {
            if (this.characterClass.name === 'Лучник') {
                ctx.fillStyle = '#00ff00';
            } else if (this.characterClass.name === 'Мечник') {
                ctx.fillStyle = '#ff6600';
            }
        } else {
            ctx.fillStyle = this.color;
        }
        
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        
        // Направление взгляда
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.size / 4, -this.size / 6, this.size / 3, this.size / 3);
        }

        // Радиус сбора предметов (для отладки)
        if (window.game && window.game.debug) {
            ctx.strokeStyle = '#00ff0033';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, this.collectRadius + this.stats.magnet, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Радиус атаки для лучника (для отладки)
        if (window.game && window.game.debug && this.characterClass && this.characterClass.name === 'Лучник') {
            if (window.game.weaponSystem && window.game.weaponSystem.weapons.length > 0) {
                const weapon = window.game.weaponSystem.weapons[0];
                ctx.strokeStyle = '#ff000055';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(0, 0, weapon.range, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    // Отрисовка визуальных эффектов
    renderVisualEffects(ctx) {
        // Эффект неуязвимости
        if (this.visualEffects.invincibility.active) {
            const effect = this.visualEffects.invincibility;
            const pulseSize = this.size * (1 + Math.sin(this.animationTime * 5) * 0.2);
            
            ctx.save();
            ctx.globalAlpha = 0.5;
            ctx.strokeStyle = effect.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, pulseSize / 2, 0, Math.PI * 2);
            ctx.stroke();
            
            // Свечение
            ctx.shadowColor = effect.color;
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(0, 0, pulseSize / 2.5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
        
        // Эффект магнита
        if (this.visualEffects.magnet.active) {
            const effect = this.visualEffects.magnet;
            const radius = effect.radius + Math.sin(this.animationTime * 3) * 10;
            
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.strokeStyle = effect.color;
            ctx.lineWidth = 2;
            
            // Круговой эффект
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Линии притяжения
            const lineCount = 8;
            for (let i = 0; i < lineCount; i++) {
                const angle = (i / lineCount) * Math.PI * 2;
                const innerRadius = radius * 0.7;
                const outerRadius = radius;
                
                ctx.beginPath();
                ctx.moveTo(Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius);
                ctx.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
                ctx.stroke();
            }
            
            ctx.restore();
        }
        
        // Эффект ядерного взрыва (nuke)
        if (this.visualEffects.nuke.active) {
            const effect = this.visualEffects.nuke;
            const timeLeft = effect.timeLeft;
            
            if (timeLeft < 0.5) {  // Показываем только в начале активации
                const radius = 800 * (1 - timeLeft * 2);  // Расширяющийся радиус
                
                ctx.save();
                ctx.globalAlpha = 0.3 * (1 - timeLeft * 2);
                ctx.fillStyle = effect.color;
                
                // Круговая волна
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Внутренняя волна
                ctx.globalAlpha = 0.5 * (1 - timeLeft * 2);
                ctx.beginPath();
                ctx.arc(0, 0, radius * 0.8, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.restore();
            }
        }
    }
    
    takeDamage(damage) {
        if (this.invulnerable || !this.active) return;

        // Применение брони
        const actualDamage = Math.max(1, damage - this.stats.armor);
        this.health -= actualDamage;
        
        // Активация неуязвимости
        this.invulnerable = true;
        this.invulnerabilityTime = this.invulnerabilityDuration;
        this.flashTime = 0.1;

        // Проверка смерти
        if (this.health <= 0) {
            this.die();
        }
    }

    heal(amount) {
        const oldHealth = this.health;
        this.health = Math.min(this.stats.maxHealth, this.health + amount);
        
        // Эффект лечения
        if (this.health > oldHealth && window.game && window.game.particleSystem) {
            const emitter = window.game.particleSystem.createLevelUpEffect(this.x, this.y);
            emitter.colors = ['#00ff00', '#44ff44', '#88ff88'];
            emitter.duration = 0.2;
        }
    }

    die() {
        this.active = false;
        this.health = 0;
        
        // Эффект смерти
        if (window.game && window.game.particleSystem) {
            window.game.particleSystem.createExplosion(this.x, this.y);
        }

        // Конец игры
        if (window.game) {
            window.game.endGame();
        }
    }

    gainExperience(amount) {
        // Округляем опыт до целого числа, чтобы избежать проблем с плавающей точкой
        this.experience = Math.floor((this.experience + amount * (1 + this.stats.luck * 0.1)) * 100) / 100;
        
        // Проверка повышения уровня
        while (this.experience >= this.experienceToNext) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.experience -= this.experienceToNext;
        // Округляем до целого числа
        this.experience = Math.floor(this.experience);
        this.experienceToNext = Math.floor(this.experienceToNext * 1.2);
        
        // Эффект повышения уровня
        if (window.game && window.game.particleSystem) {
            window.game.particleSystem.createLevelUpEffect(this.x, this.y);
        }

        // Небольшое лечение при повышении уровня
        this.heal(this.stats.maxHealth * 0.1);

        // Показать меню улучшений
        if (window.game) {
            window.game.showLevelUpMenu();
        }
    }

    applyUpgrade(upgradeType) {
        this.upgrades[upgradeType]++;
        
        // Универсальная система для всех улучшений
        switch (upgradeType) {
            case 'vitality':
            case 'healthBoost':
                this.stats.maxHealth += 10;
                this.heal(10);
                break;
            case 'agility':
            case 'speedBoost':
                this.stats.speed += 15;
                break;
            case 'recovery':
            case 'regenBoost':
                this.stats.regeneration += 0.5;
                break;
            case 'damage':
            case 'damageBoost':
                this.stats.weaponDamage += 0.08;
                break;
            case 'swiftness':
            case 'fireRateBoost':
                this.stats.weaponSpeed += 0.08;
                break;
            case 'defense':
            case 'armorBoost':
                this.stats.armor += 1;
                break;
            case 'fortune':
            case 'luckBoost':
                this.stats.luck += 0.05;
                break;
            case 'magnetism':
            case 'magnetBoost':
                this.stats.magnet += 10;
                break;
        }
        
        // Обновление характеристик оружия
        this.updateWeaponStats();
    }

    updateWeaponStats() {
        if (!window.game || !window.game.weaponSystem) return;
        
        for (const weapon of window.game.weaponSystem.weapons) {
            let damage = weapon.baseDamage * this.stats.weaponDamage;
            
            // Применение берсерк множителя
            if (this.berserkerMode && this.berserkerMultiplier) {
                damage *= this.berserkerMultiplier;
            }
            
            weapon.damage = damage;
            weapon.fireRate = weapon.baseFireRate * this.stats.weaponSpeed;
            
            // Исправление: правильно применяем улучшения range
            if (weapon.baseRange === undefined) {
                weapon.baseRange = weapon.range;
            }
            
            // Применяем улучшения range множительно (10-15% за уровень)
            const rangeMultiplier = 1 + (this.stats.range || 0);
            weapon.range = weapon.baseRange * rangeMultiplier;
        }
    }

    addWeapon(weaponClass) {
        if (!window.game || !window.game.weaponSystem) return;
        
        const weapon = window.game.weaponSystem.addWeapon(weaponClass, this);
        weapon.baseDamage = weapon.damage;
        weapon.baseFireRate = weapon.fireRate;
        this.updateWeaponStats();
        
        return weapon;
    }

    getAvailableUpgrades() {
        const upgrades = [
            {
                type: 'vitality',
                name: 'Жизненная сила',
                description: '+10 к максимальному здоровью',
                icon: '❤️'
            },
            {
                type: 'agility',
                name: 'Ловкость',
                description: '+15 к скорости движения',
                icon: '🏃'
            },
            {
                type: 'recovery',
                name: 'Восстановление',
                description: '+0.5 к регенерации здоровья в секунду',
                icon: '🔄'
            },
            {
                type: 'damage',
                name: 'Мощь',
                description: '+8% к урону оружия',
                icon: '⚔️'
            },
            {
                type: 'swiftness',
                name: 'Быстрота',
                description: '+8% к скорости атаки',
                icon: '⚡'
            },
            {
                type: 'defense',
                name: 'Защита',
                description: '+1 к броне',
                icon: '🛡️'
            },
            {
                type: 'fortune',
                name: 'Удача',
                description: '+5% к получению опыта',
                icon: '🍀'
            },
            {
                type: 'magnetism',
                name: 'Магнетизм',
                description: '+10 к радиусу сбора предметов',
                icon: '🧲'
            }
        ];

        // Добавление новых видов оружия
        if (window.game && window.game.weaponSystem) {
            const weaponTypes = window.game.weaponSystem.availableWeapons;
            const currentWeapons = window.game.weaponSystem.weapons.length;
            
            if (currentWeapons < 6) {
                const availableWeapons = weaponTypes.filter(weaponType => {
                    return !window.game.weaponSystem.weapons.some(weapon => 
                        weapon.constructor === weaponType
                    );
                });
                
                for (const weaponType of availableWeapons.slice(0, 2)) {
                    const weapon = new weaponType(this);
                    upgrades.push({
                        type: 'newWeapon',
                        weaponClass: weaponType,
                        name: weapon.name,
                        description: weapon.description,
                        icon: '🔫'
                    });
                }
            }
        }

        // Улучшения существующего оружия
        if (window.game && window.game.weaponSystem) {
            for (const weapon of window.game.weaponSystem.weapons) {
                if (weapon.level < 10) {
                    upgrades.push({
                        type: 'weaponUpgrade',
                        weapon: weapon,
                        name: `Улучшить ${weapon.name}`,
                        description: `Уровень ${weapon.level} → ${weapon.level + 1}`,
                        icon: '⬆️'
                    });
                }
            }
        }

        // Случайный выбор 3 улучшений
        const shuffled = upgrades.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 3);
    }

    getHealthPercent() {
        return this.health / this.stats.maxHealth;
    }

    getExperiencePercent() {
        return Math.floor(this.experience) / this.experienceToNext;
    }

    getStats() {
        return {
            level: this.level,
            health: this.health,
            maxHealth: this.stats.maxHealth,
            experience: Math.floor(this.experience),
            experienceToNext: this.experienceToNext,
            speed: this.stats.speed,
            regeneration: this.stats.regeneration,
            weaponDamage: this.stats.weaponDamage,
            weaponSpeed: this.stats.weaponSpeed,
            armor: this.stats.armor,
            luck: this.stats.luck,
            magnet: this.stats.magnet,
            characterClass: this.characterClass ? this.characterClass.name : 'Неизвестно'
        };
    }

    // Добавление визуального эффекта
    addVisualEffect(effectType, duration) {
        if (!this.visualEffects[effectType]) return;
        
        this.visualEffects[effectType].active = true;
        this.visualEffects[effectType].timeLeft = duration;
        
        console.log(`Добавлен визуальный эффект ${effectType} на ${duration} секунд`);
    }
    
    // Обновление визуальных эффектов
    updateVisualEffects(deltaTime) {
        Object.keys(this.visualEffects).forEach(effectType => {
            const effect = this.visualEffects[effectType];
            
            if (effect.active) {
                effect.timeLeft -= deltaTime;
                
                if (effect.timeLeft <= 0) {
                    effect.active = false;
                    console.log(`Визуальный эффект ${effectType} закончился`);
                }
            }
        });
    }
    
    reset() {
        this.x = window.innerWidth / 2;
        this.y = window.innerHeight / 2;
        this.velX = 0;
        this.velY = 0;
        this.level = 1;
        this.experience = 0;
        this.experienceToNext = 100;
        this.active = true;
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        this.flashTime = 0;
        this.animationTime = 0;
        this.lastRegen = 0;
        this.berserkerMultiplier = 1;
        
        // Сброс характеристик к базовым значениям класса
        if (this.characterClass) {
            this.characterClass.applyToPlayer(this);
        } else {
            this.stats = {
                maxHealth: 100,
                speed: 720,
                regeneration: 0,
                weaponDamage: 1,
                weaponSpeed: 1,
                armor: 0,
                luck: 0,
                magnet: 0
            };
            this.health = this.stats.maxHealth;
        }
        
        // Сброс улучшений
        this.upgrades = {
            vitality: 0,
            agility: 0,
            damage: 0,
            defense: 0,
            recovery: 0,
            fortune: 0,
            magnetism: 0,
            swiftness: 0,
            precision: 0,
            vampirism: 0,
            multishot: 0,
            explosive: 0,
            thorns: 0,
            dodge: 0,
            piercing: 0,
            velocity: 0,
            goldRush: 0,
            berserk: 0,
            frost: 0,
            poison: 0,
            shielding: 0,
            timeWarp: 0,
            weaponSlots: 0,
            rangeBoost: 0,
            adrenaline: 0,
            ricochet: 0,
            elementalDamage: 0,
            vampiricAura: 0
        };
        
        // Сброс визуальных эффектов
        Object.keys(this.visualEffects).forEach(key => {
            this.visualEffects[key].active = false;
            this.visualEffects[key].timeLeft = 0;
        });
    }
}

// Класс бонуса (PowerUp)
class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.active = true;
        this.type = type; // "magnet", "nuke", "invincibility"
        this.size = 25;
        this.collectRadius = 50;
        this.animationTime = 0;
        this.pulseAmount = 5;
        this.glowIntensity = 0;
        this.rotationAngle = 0;
        this.duration = 10; // Длительность эффекта в секундах
        
        // Настройки в зависимости от типа
        switch(this.type) {
            case "magnet":
                this.color = '#3498db'; // Синий
                this.icon = '🧲';
                this.name = 'Магнит опыта';
                this.description = 'Притягивает весь опыт на карте';
                break;
            case "nuke":
                this.color = '#e74c3c'; // Красный
                this.icon = '💥';
                this.name = 'Мега-бомба';
                this.description = 'Уничтожает всех врагов в радиусе 800px';
                break;
            case "invincibility":
                this.color = '#f1c40f'; // Жёлтый
                this.icon = '⭐';
                this.name = 'Неуязвимость';
                this.description = 'Временная неуязвимость и повышенный урон';
                break;
            default:
                this.color = '#2ecc71'; // Зелёный
                this.icon = '❓';
                this.name = 'Бонус';
                this.description = 'Неизвестный бонус';
        }
    }

    update(deltaTime, player) {
        if (!this.active) return;

        this.animationTime += deltaTime;
        this.glowIntensity = Math.sin(this.animationTime * 3) * 0.5 + 0.5;
        this.rotationAngle += deltaTime * 2; // Вращение

        // Проверка на сбор игроком
        if (player) {
            const distance = MathUtils.distance(this.x, this.y, player.x, player.y);
            if (distance <= this.collectRadius) {
                this.collect(player);
            }
        }
    }

    render(ctx) {
        if (!this.active) return;

        ctx.save();
        
        // Эффект свечения
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15 + this.glowIntensity * 10;

        // Пульсация размера
        const pulseSize = this.size + Math.sin(this.animationTime * 3) * this.pulseAmount;
        
        // Вращение и позиционирование
        ctx.translate(this.x, this.y);
        
        // Отрисовка подсказки "Нажмите E для сбора" если игрок рядом
        if (window.game && window.game.player) {
            const distance = MathUtils.distance(this.x, this.y, window.game.player.x, window.game.player.y);
            if (distance <= this.collectRadius * 2) {
                ctx.save();
                ctx.rotate(0); // Сбрасываем вращение для текста
                ctx.fillStyle = '#ffffff';
                ctx.font = '14px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                
                // Текст с тенью для лучшей видимости
                ctx.shadowColor = '#000000';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 1;
                ctx.shadowOffsetY = 1;
                
                // Пульсирующий текст
                const textScale = 1 + Math.sin(this.animationTime * 4) * 0.1;
                ctx.scale(textScale, textScale);
                
                ctx.fillText('Нажмите E для сбора', 0, -pulseSize - 10);
                ctx.restore();
            }
        }
        
        // Вращение для самого бонуса
        ctx.rotate(this.rotationAngle);
        
        // Отрисовка фона бонуса
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, pulseSize / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Отрисовка иконки
        ctx.fillStyle = '#ffffff';
        ctx.font = `${pulseSize * 0.6}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, 0, 0);
        
        // Отрисовка названия бонуса под иконкой
        ctx.save();
        ctx.rotate(-this.rotationAngle); // Отменяем вращение для текста
        ctx.font = '12px Arial';
        ctx.fillText(this.name, 0, pulseSize);
        ctx.restore();
        
        // Отрисовка радиуса сбора (в режиме отладки)
        if (window.game && window.game.debug) {
            ctx.strokeStyle = this.color + '33';
            ctx.beginPath();
            ctx.arc(0, 0, this.collectRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.restore();
    }

    collect(player) {
        if (!this.active || !player || !window.game) return;
        
        this.active = false;
        
        // Эффект сбора
        if (window.game.particleSystem) {
            window.game.particleSystem.createExplosion(this.x, this.y, 20, this.color);
        }
        
        // Применение эффекта в зависимости от типа
        switch(this.type) {
            case "magnet":
                this.applyMagnetEffect(player);
                break;
            case "nuke":
                this.applyNukeEffect(player);
                break;
            case "invincibility":
                this.applyInvincibilityEffect(player);
                break;
        }
        
        // Показываем сообщение о сборе бонуса
        window.game.showPowerUpMessage(this);
    }
    
    // Притягивает весь опыт на карте к игроку
    applyMagnetEffect(player) {
        if (!window.game || !window.game.itemSystem) return;
        
        // Показываем визуальный эффект
        window.game.particleSystem.createMagnetEffect(player.x, player.y);
        
        // Притягиваем все сферы опыта к игроку
        const experienceOrbs = window.game.itemSystem.items.filter(item => item.type === 'experience');
        experienceOrbs.forEach(orb => {
            // Устанавливаем высокую скорость притяжения к игроку
            orb.magnetSpeed = 1000;
            orb.magnetTarget = player;
            orb.magnetized = true;
        });
        
        console.log(`Применен эффект магнита: притянуто ${experienceOrbs.length} сфер опыта`);
    }
    
    // Уничтожает всех врагов в радиусе 800px
    applyNukeEffect(player) {
        if (!window.game || !window.game.enemySystem) return;
        
        const nukeRadius = 800;
        let killCount = 0;
        
        // Показываем визуальный эффект взрыва
        window.game.particleSystem.createNukeEffect(player.x, player.y, nukeRadius);
        
        // Применяем урон ко всем врагам в радиусе
        const enemies = window.game.enemySystem.enemies.filter(enemy => {
            const distance = MathUtils.distance(player.x, player.y, enemy.x, enemy.y);
            return distance <= nukeRadius;
        });
        
        enemies.forEach(enemy => {
            enemy.takeDamage(enemy.health * 10, player); // Гарантированное убийство
            killCount++;
        });
        
        // Вибрация экрана
        if (window.game.shakeCamera) {
            window.game.shakeCamera(20, 1);
        }
        
        console.log(`Применен эффект мега-бомбы: уничтожено ${killCount} врагов`);
    }
    
    // Временная неуязвимость и повышенный урон
    applyInvincibilityEffect(player) {
        if (!player) return;
        
        // Устанавливаем неуязвимость
        player.invincible = true;
        player.invincibleTime = this.duration;
        
        // Временно повышаем урон
        player.damageMultiplier = (player.damageMultiplier || 1) * 2;
        
        // Визуальный эффект
        player.addVisualEffect('invincibility', this.duration);
        
        // Создаем таймер для отключения эффекта
        setTimeout(() => {
            player.invincible = false;
            player.damageMultiplier = (player.damageMultiplier || 2) / 2;
            console.log('Эффект неуязвимости закончился');
        }, this.duration * 1000);
        
        console.log(`Применен эффект неуязвимости на ${this.duration} секунд`);
    }
}

// Класс сундука с улучшениями (выпадает от босса)
class TreasureChest {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.active = true;
        this.size = 30;
        this.color = '#ffcc00'; // Золотой цвет
        this.collectRadius = 50;
        this.animationTime = 0;
        this.pulseAmount = 5;
        this.upgradeCount = 3; // Количество улучшений
        this.glowIntensity = 0;
    }

    update(deltaTime, player) {
        if (!this.active) return;

        this.animationTime += deltaTime;
        this.glowIntensity = Math.sin(this.animationTime * 3) * 0.5 + 0.5;

        // Проверка на сбор игроком
        if (player) {
            const distance = MathUtils.distance(this.x, this.y, player.x, player.y);
            if (distance <= this.collectRadius) {
                this.collect(player);
            }
        }
    }

    render(ctx) {
        if (!this.active) return;

        ctx.save();
        
        // Эффект свечения вокруг сундука
        ctx.shadowColor = '#ffcc00';
        ctx.shadowBlur = 15 + this.glowIntensity * 10;

        // Пульсация размера
        const pulseSize = this.size + Math.sin(this.animationTime * 3) * this.pulseAmount;
        
        // Отрисовка сундука
        ctx.fillStyle = this.color;
        ctx.fillRect(
            this.x - pulseSize / 2,
            this.y - pulseSize / 2,
            pulseSize,
            pulseSize
        );
        
        // Детали сундука
        ctx.fillStyle = '#996600';
        ctx.fillRect(
            this.x - pulseSize / 2,
            this.y - pulseSize / 4,
            pulseSize,
            pulseSize / 10
        );
        
        // Замок сундука
        ctx.fillStyle = '#663300';
        ctx.fillRect(
            this.x - pulseSize / 10,
            this.y - pulseSize / 4,
            pulseSize / 5,
            pulseSize / 5
        );
        
        // Отрисовка радиуса сбора
        if (window.game && window.game.debug) {
            ctx.strokeStyle = '#ffcc0033';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.collectRadius, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Текст подсказки "Collect"
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Collect', this.x, this.y - pulseSize / 2 - 10);

        ctx.restore();
    }

    collect(player) {
        if (!this.active) return;
        
        this.active = false;
        
        // Эффект сбора
        if (window.game && window.game.particleSystem) {
            window.game.particleSystem.createExplosion(this.x, this.y, 20, '#ffcc00');
        }
        
        // Показываем меню выбора 3 случайных улучшений
        if (window.game) {
            window.game.showChestUpgradeMenu(this.upgradeCount);
        }
    }
}

// Система предметов
class ItemSystem {
    constructor() {
        this.items = [];
        this.chests = []; // Массив для сундуков
        this.itemPool = new ObjectPool(
            () => new ExperienceOrb(0, 0, 0),
            (item) => item.reset(),
            75 // Увеличено с 50 до 75 для лучшей производительности
        );
    }

    spawnExperienceOrb(x, y, value) {
        // Округляем значение опыта до целого числа
        const roundedValue = Math.floor(value);
        const orb = this.itemPool.get();
        orb.init(x, y, roundedValue);
        this.items.push(orb);
    }
    
    spawnChest(x, y) {
        const chest = new TreasureChest(x, y);
        
        // Проверяем, есть ли доступ к enemySystem через window.game
        if (window.game && window.game.enemySystem) {
            window.game.enemySystem.chests.push(chest);
            console.log('Сундук с сокровищами появился на карте!');
        } else {
            console.error('Не удалось получить доступ к enemySystem для добавления сундука');
            // Fallback - добавляем в наш локальный массив
            this.chests.push(chest);
        }
        
        return chest;
    }

    update(deltaTime) {
        // Получаем ссылку на игрока
        const player = window.game ? window.game.player : null;
        
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            
            // Передаем игрока в метод update для PowerUp
            if (item instanceof PowerUp) {
                item.update(deltaTime, player);
            } else {
                item.update(deltaTime);
            }
            
            // Удаление неактивных предметов
            if (!item.active) {
                this.items.splice(i, 1);
                if (item.type === 'experience') {
                    this.itemPool.release(item);
                }
                continue;
            }
            
            // Удаление предметов слишком далеко от игрока (для предотвращения накопления)
            // Увеличена дистанция для поддержки дальнобойных классов
            // НЕ удаляем бонусы (PowerUp), только сферы опыта и другие предметы  
            if (!(item instanceof PowerUp) && window.game && window.game.player) {
                const distance = MathUtils.distance(item.x, item.y, window.game.player.x, window.game.player.y);
                if (distance > 5000) {
                    item.active = false;
                    this.items.splice(i, 1);
                    this.itemPool.release(item);
                }
            }
        }
        
        // Принудительная очистка если слишком много предметов
        // Фильтруем предметы - оставляем все бонусы и только предметы опыта для очистки
        const nonPowerUps = this.items.filter(item => !(item instanceof PowerUp));
        
        if (nonPowerUps.length > 80) { // Уменьшено с 100 до 80
            console.log('Принудительная очистка сфер опыта, было:', nonPowerUps.length);
            // Удаляем самые дальние от игрока предметы
            if (window.game && window.game.player) {
                const player = window.game.player;
                
                // Отсортируем неPowerUp предметы по расстоянию от игрока
                nonPowerUps.sort((a, b) => {
                    const distA = MathUtils.distance(a.x, a.y, player.x, player.y);
                    const distB = MathUtils.distance(b.x, b.y, player.x, player.y);
                    return distB - distA;
                });
                
                // Удаляем дальние предметы (сохраняя 40)
                const itemsToRemove = nonPowerUps.slice(40); // Оставляем 40 ближайших
                
                // Удаляем эти предметы из оригинального массива
                itemsToRemove.forEach(item => {
                    const index = this.items.indexOf(item);
                    if (index !== -1) {
                        this.items.splice(index, 1);
                        item.active = false;
                        if (item.type === 'experience') {
                            this.itemPool.release(item);
                        }
                    }
                });
            }
            console.log('Принудительная очистка завершена, осталось без учета бонусов:', 
                this.items.filter(item => !(item instanceof PowerUp)).length);
        }
    }

    render(ctx) {
        for (const item of this.items) {
            item.render(ctx);
        }
    }

    getItemsInRange(x, y, range) {
        return this.items.filter(item => {
            const distance = MathUtils.distance(x, y, item.x, item.y);
            return distance <= range && item.active;
        });
    }

    clear() {
        this.items = [];
        this.itemPool.clear();
    }
}

// Сфера опыта
class ExperienceOrb {
    constructor(x, y, value) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.active = false;
        this.size = 8;
        this.color = '#00ff00';
        this.attractionRadius = 100;
        this.attractionSpeed = 200;
        this.animationTime = 0;
        this.velX = 0;
        this.velY = 0;
        this.magnetized = false;
        this.lifetime = 30;
        this.maxLifetime = 30;
    }

    init(x, y, value) {
        this.x = x;
        this.y = y;
        // Убеждаемся, что значение опыта целое число
        this.value = Math.floor(value);
        this.active = true;
        this.animationTime = 0;
        this.velX = MathUtils.random(-50, 50);
        this.velY = MathUtils.random(-50, 50);
        this.magnetized = false;
        this.lifetime = this.maxLifetime;
        
        // Размер зависит от значения
        this.size = Math.max(4, Math.min(12, 4 + this.value / 2));
        
        // Цвет зависит от значения
        if (this.value >= 20) {
            this.color = '#ff6600';
        } else if (this.value >= 10) {
            this.color = '#0066ff';
        } else {
            this.color = '#00ff00';
        }
    }

    update(deltaTime) {
        if (!this.active) return;

        this.animationTime += deltaTime;
        
        // Уменьшение времени жизни
        this.lifetime -= deltaTime;
        if (this.lifetime <= 0) {
            this.active = false;
            console.log('Сфера опыта удалена по истечении времени жизни');
            return;
        }

        // Проверка притяжения к игроку
        if (window.game && window.game.player) {
            const player = window.game.player;
            const distance = MathUtils.distance(this.x, this.y, player.x, player.y);
            const totalRadius = this.attractionRadius + player.stats.magnet;
            
            if (distance <= totalRadius) {
                this.magnetized = true;
                
                // Движение к игроку
                const dx = player.x - this.x;
                const dy = player.y - this.y;
                const normalizedX = dx / distance;
                const normalizedY = dy / distance;
                
                this.velX = normalizedX * this.attractionSpeed;
                this.velY = normalizedY * this.attractionSpeed;
            }
        }

        // Обновление позиции
        this.x += this.velX * deltaTime;
        this.y += this.velY * deltaTime;

        // Трение если не намагничен
        if (!this.magnetized) {
            this.velX *= 0.9;
            this.velY *= 0.9;
        }
    }

    render(ctx) {
        if (!this.active) return;

        ctx.save();
        
        // Эффект пульсации
        const pulse = 1 + Math.sin(this.animationTime * 8) * 0.1;
        const currentSize = this.size * pulse;
        
        // Эффект мерцания при приближении к концу жизни
        let alpha = 1;
        if (this.lifetime < 5) {
            alpha = 0.5 + 0.5 * Math.sin(this.animationTime * 10);
        }
        
        // Эффект свечения
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.globalAlpha = alpha;
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentSize / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Внутренний круг
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentSize / 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    collect(player) {
        if (!this.active) return;
        
        this.active = false;
        // Округляем значение опыта до целого числа
        const expValue = Math.floor(this.value);
        player.gainExperience(expValue);
        
        // Добавление золота за сбор
        const goldAmount = Math.max(1, Math.floor(this.value / 250)); // Уменьшено в 50 раз (было / 5)
            window.game.goldSystem.addGold(goldAmount);
        
        // Эффект сбора
        if (window.game && window.game.particleSystem) {
            window.game.particleSystem.createSparks(this.x, this.y);
        }
    }

    reset() {
        this.active = false;
        this.magnetized = false;
        this.velX = 0;
        this.velY = 0;
        this.animationTime = 0;
        this.lifetime = this.maxLifetime;
    }
}

// Экспорт классов
window.CharacterClass = CharacterClass;
window.ArcherClass = ArcherClass;
window.SwordsmanClass = SwordsmanClass;
window.BomberClass = BomberClass;
window.SwordWeapon = SwordWeapon;
window.SwordSlashEffect = SwordSlashEffect;
window.SwordProjectile = SwordProjectile;
window.GoldSystem = GoldSystem;
window.PermanentUpgradesSystem = PermanentUpgradesSystem;
window.Player = Player;
window.ItemSystem = ItemSystem;
window.ExperienceOrb = ExperienceOrb; 