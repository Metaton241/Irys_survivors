// Базовый класс снаряда
class Projectile {
    constructor(x, y, velX, velY, damage, life, owner) {
        this.x = x;
        this.y = y;
        this.velX = velX;
        this.velY = velY;
        this.damage = damage;
        this.life = life;
        this.maxLife = life;
        this.owner = owner;
        this.active = true;
        this.size = 4;
        this.color = '#ffff00';
        this.piercing = 0;
        this.pierceCount = 0;
        this.speed = Math.sqrt(velX * velX + velY * velY);
        this.angle = Math.atan2(velY, velX);
        this.gravity = 0;
        this.homing = false;
        this.homingStrength = 0;
        this.target = null;
    }

    update(deltaTime) {
        if (!this.active) return;

        // Обновление позиции
        this.x += this.velX * deltaTime;
        this.y += this.velY * deltaTime;

        // Применение гравитации
        this.velY += this.gravity * deltaTime;

        // Самонаведение
        if (this.homing && this.target) {
            const targetX = this.target.x;
            const targetY = this.target.y;
            const distance = MathUtils.distance(this.x, this.y, targetX, targetY);
            
            if (distance > 0) {
                const targetAngle = MathUtils.angle(this.x, this.y, targetX, targetY);
                const angleDiff = targetAngle - this.angle;
                
                // Нормализация угла
                let normalizedAngle = angleDiff;
                if (normalizedAngle > Math.PI) normalizedAngle -= 2 * Math.PI;
                if (normalizedAngle < -Math.PI) normalizedAngle += 2 * Math.PI;
                
                this.angle += normalizedAngle * this.homingStrength * deltaTime;
                this.velX = Math.cos(this.angle) * this.speed;
                this.velY = Math.sin(this.angle) * this.speed;
            }
        }

        // Обновление времени жизни
        this.life -= deltaTime;
        if (this.life <= 0) {
            this.active = false;
        }

        // Обновление угла для отрисовки
        this.angle = Math.atan2(this.velY, this.velX);
    }

    render(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }

    onHit(target) {
        this.pierceCount++;
        if (this.pierceCount > this.piercing) {
            this.active = false;
        }
        return this.damage;
    }

    isOffScreen(screenWidth, screenHeight) {
        // Для дальнобойного оружия увеличиваем допустимую зону
        const margin = this.speed > 1000 ? 300 : 50; // Увеличенная зона для быстрых снарядов
        return this.x < -margin || this.x > screenWidth + margin || 
               this.y < -margin || this.y > screenHeight + margin;
    }
}

// Пуля
class Bullet extends Projectile {
    constructor(x, y, velX, velY, damage, life, owner) {
        super(x, y, velX, velY, damage, life, owner);
        this.size = 6;
        this.color = '#ffff00';
    }

    render(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size, -this.size / 2, this.size * 2, this.size);
        ctx.restore();
    }
}

// Лазер
class Laser extends Projectile {
    constructor(x, y, velX, velY, damage, life, owner) {
        super(x, y, velX, velY, damage, life, owner);
        this.size = 8;
        this.color = '#00ffff';
        this.piercing = 2;
    }

    render(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Создание эффекта свечения
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size * 1.5, -this.size / 2, this.size * 3, this.size);
        
        ctx.restore();
    }
}

// Ракета
class Missile extends Projectile {
    constructor(x, y, velX, velY, damage, life, owner) {
        super(x, y, velX, velY, damage, life, owner);
        this.size = 10;
        this.color = '#ff6600';
        this.homing = true;
        this.homingStrength = 3;
        this.explosionRadius = 50;
    }

    render(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size, -this.size / 2, this.size * 2, this.size);
        
        // Огонь от ракеты
        ctx.fillStyle = '#ff3300';
        ctx.fillRect(-this.size * 1.5, -this.size / 4, this.size, this.size / 2);
        
        ctx.restore();
    }

    onHit(target) {
        // Создание взрыва
        if (window.game && window.game.particleSystem) {
            window.game.particleSystem.createExplosion(this.x, this.y);
        }
        
        this.active = false;
        return this.damage;
    }
}

// Молния
class Lightning extends Projectile {
    constructor(x, y, velX, velY, damage, life, owner) {
        super(x, y, velX, velY, damage, life, owner);
        this.size = 12;
        this.color = '#9966ff';
        this.piercing = 5;
        this.chainRange = 80;
        this.chainCount = 0;
        this.maxChains = 3;
    }

    render(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Эффект молнии
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-this.size, 0);
        ctx.lineTo(this.size, 0);
        ctx.stroke();
        
        ctx.restore();
    }

    onHit(target) {
        // Цепная молния
        if (this.chainCount < this.maxChains && window.game && window.game.enemySystem) {
            const nearbyEnemies = window.game.enemySystem.getEnemiesInRange(this.x, this.y, this.chainRange);
            
            for (const enemy of nearbyEnemies) {
                if (enemy !== target && enemy.active) {
                    const chainLightning = new Lightning(
                        this.x, this.y,
                        (enemy.x - this.x) * 10,
                        (enemy.y - this.y) * 10,
                        this.damage * 0.7,
                        0.1,
                        this.owner
                    );
                    chainLightning.chainCount = this.chainCount + 1;
                    chainLightning.target = enemy;
                    
                    if (window.game.weaponSystem) {
                        window.game.weaponSystem.addProjectile(chainLightning);
                    }
                    break;
                }
            }
        }
        
        this.pierceCount++;
        if (this.pierceCount > this.piercing) {
            this.active = false;
        }
        return this.damage;
    }
}

// Базовый класс оружия
class Weapon {
    constructor(owner) {
        this.owner = owner;
        this.damage = 10;
        this.fireRate = 2; // выстрелов в секунду
        this.lastFire = 0;
        this.range = 500; // Увеличено с 300 до 500 для лучшего покрытия
        this.projectileSpeed = 1200; // Увеличено с 400 до 1200
        this.projectileLife = 2; // Увеличено с 1 до 2 для дальнобойного оружия
        this.projectileType = Bullet;
        this.level = 1;
        this.autoFire = true;
        this.spread = 0;
        this.projectileCount = 1;
        this.piercing = 0;
        this.name = "Пистолет";
        this.description = "Базовое оружие";
    }

    update(deltaTime) {
        this.lastFire += deltaTime;
        
        // Убираю автоматическую стрельбу отсюда - она будет в WeaponSystem
        // if (this.autoFire && this.canFire()) {
        //     this.fire();
        // }
    }

    canFire() {
        return this.lastFire >= 1 / this.fireRate;
    }

    fire() {
        if (!this.canFire()) return [];

        this.lastFire = 0;
        const projectiles = [];

        // Поиск ближайшего врага
        const target = this.findNearestEnemy();
        if (!target) return projectiles;

        const angle = MathUtils.angle(this.owner.x, this.owner.y, target.x, target.y);
        
        for (let i = 0; i < this.projectileCount; i++) {
            const spread = (this.spread > 0) ? 
                MathUtils.random(-this.spread, this.spread) : 0;
            const projectileAngle = angle + spread;
            
            const velX = Math.cos(projectileAngle) * this.projectileSpeed;
            const velY = Math.sin(projectileAngle) * this.projectileSpeed;
            
            const projectile = new this.projectileType(
                this.owner.x,
                this.owner.y,
                velX,
                velY,
                this.damage,
                this.projectileLife,
                this.owner
            );
            
            projectile.piercing = this.piercing;
            if (projectile.homing) {
                projectile.target = target;
            }
            
            projectiles.push(projectile);
        }

        // Эффекты выстрела убраны

        return projectiles;
    }

    findNearestEnemy() {
        if (!window.game || !window.game.enemySystem) return null;
        
        // Для большинства оружий ищем врагов в пределах дальности атаки
        const searchRange = this.range || 500;
        const enemies = window.game.enemySystem.getEnemiesInRange(
            this.owner.x, 
            this.owner.y, 
            searchRange
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
            
            if (distance <= searchRange && distance < minDistance) {
                minDistance = distance;
                nearest = enemy;
            }
        }
        
        return nearest;
    }

    levelUp() {
        this.level++;
        this.damage *= 1.2;
        this.fireRate *= 1.1;
        
        if (this.level % 3 === 0) {
            this.piercing++;
        }
        
        if (this.level % 5 === 0) {
            this.projectileCount++;
        }
    }

    getStats() {
        return {
            name: this.name,
            level: this.level,
            damage: Math.floor(this.damage),
            fireRate: Math.floor(this.fireRate * 10) / 10,
            piercing: this.piercing,
            projectileCount: this.projectileCount
        };
    }

    // Добавляю метод upgrade() для улучшений второго уровня
    upgrade() {
        this.level++;
        this.damage *= 1.15; // +15% урона
        this.fireRate *= 1.1; // +10% скорости атаки
        
        // Каждые 2 уровня добавляем пробитие
        if (this.level % 2 === 0) {
            this.piercing++;
        }
        
        // Каждые 3 уровня добавляем снаряд
        if (this.level % 3 === 0) {
            this.projectileCount++;
        }
        
        // Сохраняем базовые значения для правильного применения улучшений
        if (this.baseDamage === undefined) {
            this.baseDamage = this.damage / 1.15;
        }
        if (this.baseFireRate === undefined) {
            this.baseFireRate = this.fireRate / 1.1;
        }
    }
}

// Лазерная пушка
class LaserCannon extends Weapon {
    constructor(owner) {
        super(owner);
        this.damage = 15;
        this.fireRate = 1.5;
        this.projectileSpeed = 1800; // Увеличено с 600 до 1800
        this.projectileType = Laser;
        this.piercing = 2;
        this.name = "Лазерная пушка";
        this.description = "Энергетическое оружие с пробиванием";
    }

    levelUp() {
        super.levelUp();
        this.piercing += 0.5;
    }
}

// Ракетница
class RocketLauncher extends Weapon {
    constructor(owner) {
        super(owner);
        this.damage = 35;
        this.fireRate = 0.8;
        this.projectileSpeed = 750; // Увеличено с 250 до 750
        this.projectileType = Missile;
        this.name = "Ракетница";
        this.description = "Самонаводящиеся ракеты с взрывом";
    }
}

// Пулемет
class MachineGun extends Weapon {
    constructor(owner) {
        super(owner);
        this.damage = 8;
        this.fireRate = 6;
        this.projectileSpeed = 1500; // Увеличено с 500 до 1500
        this.spread = Math.PI / 12;
        this.projectileCount = 1;
        this.name = "Пулемет";
        this.description = "Быстрая стрельба с разбросом";
    }

    levelUp() {
        super.levelUp();
        this.fireRate *= 1.15;
        this.spread *= 0.95;
    }
}

// Дробовик
class Shotgun extends Weapon {
    constructor(owner) {
        super(owner);
        this.damage = 12;
        this.fireRate = 1.2;
        this.projectileSpeed = 1050; // Увеличено с 350 до 1050
        this.spread = Math.PI / 6;
        this.projectileCount = 5;
        this.projectileLife = 0.5;
        this.name = "Дробовик";
        this.description = "Множественные снаряды";
    }

    levelUp() {
        super.levelUp();
        this.projectileCount += 2;
    }
}

// Молниемет
class LightningGun extends Weapon {
    constructor(owner) {
        super(owner);
        this.damage = 20;
        this.fireRate = 1;
        this.projectileSpeed = 1200; // Увеличено с 400 до 1200
        this.projectileType = Lightning;
        this.name = "Молниемет";
        this.description = "Цепная молния";
    }
}

// Оружие лучника
class BowWeapon extends Weapon {
    constructor(owner) {
        super(owner);
        this.damage = 15;
        this.fireRate = 3; // Высокая скорость атаки
        this.range = 400; // Уменьшенная дальность атаки
        this.projectileSpeed = 1500; // Высокая скорость снаряда
        this.projectileLife = 3; // Долгое время жизни снаряда
        this.name = "Лук";
        this.description = "Дальнобойное оружие с ограниченной дальностью";
        this.projectileType = ArrowProjectile;
        this.piercing = 1; // Стрелы пробивают врагов
    }

    // Переопределяем метод для более строгой проверки дальности
    findNearestEnemy() {
        if (!window.game || !window.game.enemySystem) return null;
        
        // Для лучника - строгое ограничение дальности 400px
        const enemies = window.game.enemySystem.getEnemiesInRange(
            this.owner.x, 
            this.owner.y, 
            this.range
        );
        
        if (enemies.length === 0) return null;
        
        let nearest = null;
        let minDistance = Infinity;
        
        // Проверяем каждого врага на соответствие дальности
        for (const enemy of enemies) {
            const distance = MathUtils.distance(
                this.owner.x, 
                this.owner.y, 
                enemy.x, 
                enemy.y
            );
            
            // Строгая проверка: враг должен быть точно в пределах дальности
            if (distance <= this.range && distance < minDistance) {
                minDistance = distance;
                nearest = enemy;
            }
        }
        
        return nearest;
    }

    // Добавляю метод upgrade() для улучшений бомбардира
    upgrade() {
        this.level++;
        this.damage *= 1.15; // +15% урона
        this.fireRate *= 1.1; // +10% скорости атаки
        this.range *= 1.08; // +8% дальности
        
        // Каждые 2 уровня уменьшаем разброс (повышаем точность)
        if (this.level % 2 === 0) {
            this.spread = Math.max(this.spread * 0.9, Math.PI / 16);
        }
        
        // Сохраняем базовые значения
        if (this.baseDamage === undefined) {
            this.baseDamage = this.damage / 1.15;
        }
        if (this.baseFireRate === undefined) {
            this.baseFireRate = this.fireRate / 1.1;
        }
        if (this.baseRange === undefined) {
            this.baseRange = this.range / 1.08;
        }
    }
}

// Стрела
class ArrowProjectile extends Projectile {
    constructor(x, y, velX, velY, damage, life, owner) {
        super(x, y, velX, velY, damage, life, owner);
        this.size = 8;
        this.color = '#8B4513';
        this.piercing = 1;
    }

    render(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Древко стрелы
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-this.size, 0);
        ctx.lineTo(this.size, 0);
        ctx.stroke();
        
        // Наконечник стрелы
        ctx.fillStyle = '#C0C0C0';
        ctx.beginPath();
        ctx.moveTo(this.size, 0);
        ctx.lineTo(this.size - 4, -2);
        ctx.lineTo(this.size - 4, 2);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
}

// Система оружия
class WeaponSystem {
    constructor() {
        this.weapons = [];
        this.projectiles = [];
        this.availableWeapons = [
            SwordWeapon,
            LaserCannon,
            RocketLauncher,
            MachineGun,
            Shotgun,
            LightningGun
        ];
    }

    addWeapon(weaponClass, owner) {
        const weapon = new weaponClass(owner);
        
        // Устанавливаем базовые характеристики для всех видов оружия
        weapon.baseDamage = weapon.damage;
        weapon.baseFireRate = weapon.fireRate;
        
        this.weapons.push(weapon);
        return weapon;
    }

    removeWeapon(weapon) {
        const index = this.weapons.indexOf(weapon);
        if (index > -1) {
            this.weapons.splice(index, 1);
        }
    }

    addProjectile(projectile) {
        this.projectiles.push(projectile);
    }

    update(deltaTime) {
        // Обновление оружия
        for (const weapon of this.weapons) {
            weapon.update(deltaTime);
            
            // Создание новых снарядов только если оружие может стрелять
            if (weapon.autoFire && weapon.canFire()) {
                const newProjectiles = weapon.fire();
                this.projectiles.push(...newProjectiles);
            }
        }

        // Обновление снарядов
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.update(deltaTime);
            
            // Удаление неактивных снарядов
            // Для дальнобойного оружия используем более мягкую проверку границ
            const shouldRemove = !projectile.active || 
                (projectile.speed < 1000 && projectile.isOffScreen(window.innerWidth, window.innerHeight)) ||
                (projectile.speed >= 1000 && projectile.life <= 0);
            
            if (shouldRemove) {
                this.projectiles.splice(i, 1);
            }
        }
    }

    render(ctx) {
        for (const projectile of this.projectiles) {
            projectile.render(ctx);
        }
    }

    checkCollisions(enemies) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            if (!projectile.active) continue;

            for (const enemy of enemies) {
                if (!enemy.active) continue;

                const distance = MathUtils.distance(
                    projectile.x, 
                    projectile.y, 
                    enemy.x, 
                    enemy.y
                );

                if (distance < projectile.size + enemy.size) {
                    const damage = projectile.onHit(enemy);
                    enemy.takeDamage(damage);
                    
                    // Эффект попадания
                    if (window.game && window.game.particleSystem) {
                        window.game.particleSystem.createHitEffect(
                            enemy.x, 
                            enemy.y
                        );
                    }
                    
                    if (!projectile.active) {
                        this.projectiles.splice(i, 1);
                        break;
                    }
                }
            }
        }
    }

    getRandomWeapon() {
        const randomIndex = MathUtils.randomInt(0, this.availableWeapons.length - 1);
        return this.availableWeapons[randomIndex];
    }

    clear() {
        this.weapons = [];
        this.projectiles = [];
    }

    getProjectileCount() {
        return this.projectiles.length;
    }

    getWeaponStats() {
        return this.weapons.map(weapon => weapon.getStats());
    }
}

// Класс бомбы (упрощенная версия без физики)
class BombProjectile extends Projectile {
    constructor(x, y, velX, velY, damage, life, owner) {
        super(x, y, velX, velY, damage, life, owner);
        this.size = 12;
        this.color = '#ff4444';
        this.explosionRadius = owner.explosionRadius || 80;
        this.explosionDamage = damage * (owner.explosionDamageMultiplier || 1);
        this.armTime = 0.1; // Быстрая активация
        this.armed = false;
        this.exploded = false;
        this.gravity = 0; // Убираем гравитацию
        this.spinSpeed = 5;
        this.spinAngle = 0;
    }

    update(deltaTime) {
        if (!this.active || this.exploded) return;

        // Обновление анимации вращения
        this.spinAngle += this.spinSpeed * deltaTime;

        // Простое обновление позиции без физики
        this.x += this.velX * deltaTime;
        this.y += this.velY * deltaTime;

        // Уменьшение времени жизни
        this.life -= deltaTime;
        
        // Автоматический взрыв по истечении времени
        if (this.life <= 0) {
            this.explode();
            return;
        }

        // Быстрая активация
        if (!this.armed && this.maxLife - this.life >= this.armTime) {
            this.armed = true;
        }

        // Обновление угла для отрисовки
        this.angle = Math.atan2(this.velY, this.velX);
    }

    render(ctx) {
        if (!this.active || this.exploded) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.spinAngle);
        
        // Рисуем бомбу как круг
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Простой фитиль
        if (this.armed) {
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, -this.size / 2);
            ctx.lineTo(0, -this.size / 2 - 6);
            ctx.stroke();
        }
        
        ctx.restore();
    }

    onHit(target) {
        if (this.armed && !this.exploded) {
            this.explode();
        }
        return 0; // Урон наносит только взрыв
    }

    explode() {
        if (this.exploded) return;
        
        this.exploded = true;
        this.active = false;

        // Создание эффекта взрыва
        if (window.game && window.game.particleSystem) {
            window.game.particleSystem.createExplosion(
                this.x, 
                this.y, 
                this.explosionRadius,
                '#ff4444',
                30
            );
        }

        // Нанесение урона всем врагам в радиусе
        if (window.game && window.game.enemySystem) {
            const enemies = window.game.enemySystem.getEnemiesInRange(
                this.x, 
                this.y, 
                this.explosionRadius
            );

            enemies.forEach(enemy => {
                const distance = MathUtils.distance(this.x, this.y, enemy.x, enemy.y);
                if (distance <= this.explosionRadius) {
                    // Урон убывает с расстоянием
                    const damageFalloff = 1 - (distance / this.explosionRadius) * 0.5;
                    const finalDamage = this.explosionDamage * damageFalloff;
                    
                    enemy.takeDamage(finalDamage);
                    
                    // Отталкивание
                    const knockbackForce = (this.owner.knockbackPower || 1) * 
                                         (1 - distance / this.explosionRadius) * 300;
                    const angle = MathUtils.angle(this.x, this.y, enemy.x, enemy.y);
                    enemy.velX += Math.cos(angle) * knockbackForce;
                    enemy.velY += Math.sin(angle) * knockbackForce;
                }
            });
        }
    }


}

// Оружие бомбардира (исправленная версия)
class BombWeapon extends Weapon {
    constructor(owner) {
        super(owner);
        this.damage = 45;
        this.fireRate = 4.0; // Увеличил для нормальной игры (было 0.67)
        this.range = 800; // Увеличена дальность
        this.projectileSpeed = 600; // Увеличена скорость
        this.projectileLife = 4.0; // Увеличено время жизни
        this.name = "Bombs";
        this.description = "Explosive projectiles with area damage";
        this.projectileType = BombProjectile;
        this.spread = Math.PI / 16; // Уменьшен разброс для точности
    }

    fire() {
        if (!this.canFire()) return [];

        this.lastFire = 0;
        const projectiles = [];

        // Ищем ближайшего врага
        const nearestEnemy = this.findNearestEnemy();
        if (!nearestEnemy) return projectiles; // Не стреляем если нет цели
        

        // Прямое нацеливание на врага
        const targetAngle = MathUtils.angle(this.owner.x, this.owner.y, nearestEnemy.x, nearestEnemy.y);
        
        // Минимальный разброс для точности
        const spreadAngle = (Math.random() - 0.5) * this.spread;
        const finalAngle = targetAngle + spreadAngle;
        
        const velX = Math.cos(finalAngle) * this.projectileSpeed;
        const velY = Math.sin(finalAngle) * this.projectileSpeed;

        const projectile = new this.projectileType(
            this.owner.x,
            this.owner.y,
            velX,
            velY,
            this.damage,
            this.projectileLife,
            this.owner
        );

        projectiles.push(projectile);
        return projectiles;
    }

    findNearestEnemy() {
        if (!window.game || !window.game.enemySystem) return null;
        
        // Исправление: ищем ВСЕХ врагов без ограничений по дальности
        const allEnemies = window.game.enemySystem.enemies.filter(enemy => enemy.active);
        if (allEnemies.length === 0) return null;
        
        let nearest = null;
        let minDistance = Infinity;
        
        for (const enemy of allEnemies) {
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
}

// Экспорт классов
window.Projectile = Projectile;
window.Bullet = Bullet;
window.Laser = Laser;
window.Missile = Missile;
window.Lightning = Lightning;
window.Weapon = Weapon;
window.LaserCannon = LaserCannon;
window.RocketLauncher = RocketLauncher;
window.MachineGun = MachineGun;
window.Shotgun = Shotgun;
window.LightningGun = LightningGun;
window.BombProjectile = BombProjectile;
window.BombWeapon = BombWeapon;
window.WeaponSystem = WeaponSystem; 