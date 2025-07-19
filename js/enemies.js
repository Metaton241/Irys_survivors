// Загрузка изображений врагов
const enemyImages = {
    range_virus: null,
    tank_virus: null,
    mother_virus: null,
    child_virus: null,
    ghost_virus: null
};

// Функция загрузки изображений
function loadEnemyImages() {
    const imageNames = ['range_virus', 'tank_virus', 'mother_virus', 'child_virus', 'ghost_virus'];
    
    imageNames.forEach(name => {
        enemyImages[name] = new Image();
        enemyImages[name].src = `images/${name}.png`;
    });
}

// Загружаем изображения при загрузке страницы
if (typeof window !== 'undefined') {
    window.addEventListener('load', loadEnemyImages);
}

// Базовый класс врага
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.velX = 0;
        this.velY = 0;
        this.maxHealth = 20;
        this.health = this.maxHealth;
        this.damage = 10;
        this.speed = 300; // Увеличено с 100 до 300
        this.size = 24; // Увеличено в 1.5 раза с 16 до 24
        this.color = '#ff0000';
        this.active = true;
        this.xpValue = 5;
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        this.knockbackResistance = 0.5;
        this.target = null;
        this.lastAttack = 0;
        this.attackRate = 1;
        this.attackRange = 45; // Увеличено в 1.5 раза с 30 до 45
        this.type = "basic";
        this.deathEffect = true;
        this.animationTime = 0;
        this.hurtTime = 0;
        this.flashTime = 0;
        this.mass = 1;
        this.friction = 0.9;
    }

    update(deltaTime, player) {
        if (!this.active) return;

        this.animationTime += deltaTime;
        
        // Обновление таймеров
        if (this.invulnerable) {
            this.invulnerabilityTime -= deltaTime;
            if (this.invulnerabilityTime <= 0) {
                this.invulnerable = false;
            }
        }

        if (this.hurtTime > 0) {
            this.hurtTime -= deltaTime;
        }

        if (this.flashTime > 0) {
            this.flashTime -= deltaTime;
        }

        // Обновление поведения
        this.updateBehavior(deltaTime, player);

        // Применение физики
        this.velX *= this.friction;
        this.velY *= this.friction;

        // Обновление позиции
        this.x += this.velX * deltaTime;
        this.y += this.velY * deltaTime;

        // Атака игрока
        if (player && this.canAttack(player)) {
            this.attack(player);
        }

        // Обновление таймера атаки
        this.lastAttack += deltaTime;
    }

    updateBehavior(deltaTime, player) {
        if (!player) return;

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            const normalizedX = dx / distance;
            const normalizedY = dy / distance;
            
            // Отталкивание от игрока если слишком близко
            const minDistance = (this.size + player.size) / 2 + 10;
            if (distance < minDistance) {
                // Отталкивание от игрока
                this.velX -= normalizedX * this.speed * deltaTime * 2;
                this.velY -= normalizedY * this.speed * deltaTime * 2;
            } else {
                // Обычное следование за игроком
                this.velX += normalizedX * this.speed * deltaTime;
                this.velY += normalizedY * this.speed * deltaTime;
            }
        }
    }

    render(ctx) {
        if (!this.active) return;

        ctx.save();
        
        // Эффект мигания при получении урона
        if (this.flashTime > 0) {
            ctx.globalAlpha = 0.5;
        }

        // Эффект неуязвимости
        if (this.invulnerable) {
            ctx.globalAlpha = 0.7;
        }

        ctx.fillStyle = this.color;
        ctx.fillRect(
            this.x - this.size / 2, 
            this.y - this.size / 2, 
            this.size, 
            this.size
        );

        // Полоса здоровья
        if (this.health < this.maxHealth) {
            this.renderHealthBar(ctx);
        }

        ctx.restore();
    }

    renderHealthBar(ctx) {
        const barWidth = this.size;
        const barHeight = 6; // Увеличено в 1.5 раза с 4 до 6
        const barY = this.y - this.size / 2 - 12; // Увеличено в 1.5 раза с 8 до 12
        
        // Фон полосы здоровья
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - barWidth / 2, barY, barWidth, barHeight);
        
        // Полоса здоровья
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : 
                        healthPercent > 0.25 ? '#ffff00' : '#ff0000';
        ctx.fillRect(this.x - barWidth / 2, barY, barWidth * healthPercent, barHeight);
    }

    takeDamage(damage) {
        if (this.invulnerable || !this.active) return false;

        this.health -= damage;
        this.hurtTime = 0.1;
        this.flashTime = 0.1;

        // Эффект крови
        if (window.game && window.game.particleSystem) {
            window.game.particleSystem.createBloodSplash(this.x, this.y);
        }

        if (this.health <= 0) {
            this.die();
            return true;
        }

        return false;
    }

    die() {
        this.active = false;
        
        // Эффект смерти
        if (this.deathEffect && window.game && window.game.particleSystem) {
            window.game.particleSystem.createBloodSplash(this.x, this.y);
        }

        // Создание сферы опыта
        if (window.game && window.game.itemSystem && this.xpValue > 0) {
            window.game.itemSystem.spawnExperienceOrb(this.x, this.y, this.xpValue);
        }

        // Увеличить счет с учетом комбо
        if (window.game) {
            window.game.addKillScore(this.xpValue);
        }

        // Добавление золота за убийство
        const goldReward = Math.max(1, Math.floor(this.xpValue / 150)); // Уменьшено в 50 раз (было / 3)
            window.game.goldSystem.addGold(goldReward);
    }

    canAttack(player) {
        const distance = MathUtils.distance(this.x, this.y, player.x, player.y);
        return distance <= this.attackRange && this.lastAttack >= 1 / this.attackRate;
    }

    attack(player) {
        player.takeDamage(this.damage);
        this.lastAttack = 0;
    }

    applyKnockback(forceX, forceY) {
        const resistance = 1 - this.knockbackResistance;
        this.velX += forceX * resistance / this.mass;
        this.velY += forceY * resistance / this.mass;
    }

    isTooFarFromPlayer(player, maxDistance = 3000) {
        if (!player) return false;
        const distance = MathUtils.distance(this.x, this.y, player.x, player.y);
        return distance > maxDistance;
    }

    getStats() {
        return {
            type: this.type,
            health: this.health,
            maxHealth: this.maxHealth,
            damage: this.damage,
            speed: this.speed,
            xpValue: this.xpValue
        };
    }
}

// Быстрый враг
class FastEnemy extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.maxHealth = 15;
        this.health = this.maxHealth;
        this.damage = 8;
        this.speed = 540; // Увеличено с 180 до 540
        this.size = 12;
        this.color = '#ff6600';
        this.xpValue = 8;
        this.type = "fast";
        this.attackRate = 1.5;
        this.mass = 0.7;
    }

    render(ctx) {
        if (!this.active) return;

        ctx.save();
        
        if (this.flashTime > 0) {
            ctx.globalAlpha = 0.5;
        }

        if (this.invulnerable) {
            ctx.globalAlpha = 0.7;
        }

        // Треугольная форма для быстрого врага
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.size / 2);
        ctx.lineTo(this.x - this.size / 2, this.y + this.size / 2);
        ctx.lineTo(this.x + this.size / 2, this.y + this.size / 2);
        ctx.closePath();
        ctx.fill();

        if (this.health < this.maxHealth) {
            this.renderHealthBar(ctx);
        }

        ctx.restore();
    }
}

// Танк
class TankEnemy extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.maxHealth = 60;
        this.health = this.maxHealth;
        this.damage = 20;
        this.speed = 180; // Увеличено с 60 до 180
        this.size = 36; // Увеличено в 1.5 раза с 24 до 36
        this.color = '#660000';
        this.xpValue = 20;
        this.type = "tank";
        this.knockbackResistance = 0.8;
        this.mass = 2;
        this.attackRange = 60; // Увеличено в 1.5 раза с 40 до 60
    }

    render(ctx) {
        if (!this.active) return;

        ctx.save();
        
        if (this.flashTime > 0) {
            ctx.globalAlpha = 0.5;
        }

        if (this.invulnerable) {
            ctx.globalAlpha = 0.7;
        }

        // Отрисовка изображения tank_virus
        if (enemyImages.tank_virus && enemyImages.tank_virus.complete) {
            ctx.drawImage(
                enemyImages.tank_virus,
                this.x - this.size / 2,
                this.y - this.size / 2,
                this.size,
                this.size
            );
        } else {
            // Fallback - большой квадрат для танка
            ctx.fillStyle = this.color;
            ctx.fillRect(
                this.x - this.size / 2, 
                this.y - this.size / 2, 
                this.size, 
                this.size
            );

            // Дополнительная деталь
            ctx.fillStyle = '#990000';
            ctx.fillRect(
                this.x - this.size / 3, 
                this.y - this.size / 3, 
                this.size / 1.5, 
                this.size / 1.5
            );
        }

        if (this.health < this.maxHealth) {
            this.renderHealthBar(ctx);
        }

        ctx.restore();
    }
}

// Взрывающийся враг
class ExplodingEnemy extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.maxHealth = 10;
        this.health = this.maxHealth;
        this.damage = 30;
        this.speed = 360; // Увеличено с 120 до 360
        this.size = 21; // Увеличено в 1.5 раза с 14 до 21
        this.color = '#ff9900';
        this.xpValue = 12;
        this.type = "exploding";
        this.explosionRadius = 80;
        this.explosionDamage = 25;
        this.attackRange = 37; // Увеличено в 1.5 раза с 25 до 37
        this.blinkTime = 0;
        this.blinkInterval = 0.2;
    }

    update(deltaTime, player) {
        super.update(deltaTime, player);
        
        // Эффект мигания при приближении к игроку
        if (player) {
            const distance = MathUtils.distance(this.x, this.y, player.x, player.y);
            if (distance < this.explosionRadius * 1.5) {
                this.blinkTime += deltaTime;
                if (this.blinkTime >= this.blinkInterval) {
                    this.blinkTime = 0;
                    this.blinkInterval *= 0.95; // Ускорение мигания
                }
            }
        }
    }

    render(ctx) {
        if (!this.active) return;

        ctx.save();
        
        // Эффект мигания
        if (this.blinkTime > this.blinkInterval / 2) {
            ctx.globalAlpha = 0.3;
        }

        if (this.flashTime > 0) {
            ctx.globalAlpha = 0.5;
        }

        if (this.invulnerable) {
            ctx.globalAlpha = 0.7;
        }

        // Круглая форма
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        ctx.fill();

        // Внутренний круг
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 3, 0, Math.PI * 2);
        ctx.fill();

        if (this.health < this.maxHealth) {
            this.renderHealthBar(ctx);
        }

        ctx.restore();
    }

    die() {
        if (this.active) {
            this.explode();
        }
        super.die();
    }

    attack(player) {
        this.explode();
        this.die(); // Используем die() вместо super.die()
    }

    explode() {
        // Эффект взрыва
        if (window.game && window.game.particleSystem) {
            window.game.particleSystem.createExplosion(this.x, this.y);
        }

        // Урон игроку если он в радиусе
        if (window.game && window.game.player) {
            const distance = MathUtils.distance(
                this.x, this.y, 
                window.game.player.x, 
                window.game.player.y
            );
            
            if (distance <= this.explosionRadius) {
                window.game.player.takeDamage(this.explosionDamage);
            }
        }
    }
}

// Стрелок
class ShooterEnemy extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.maxHealth = 25;
        this.health = this.maxHealth;
        this.damage = 8; // Уменьшено с 12 до 8
        this.speed = 240; // Увеличено с 80 до 240
        this.size = 27; // Увеличено в 1.5 раза с 18 до 27
        this.color = '#9900ff';
        this.xpValue = 15;
        this.type = "shooter";
        this.attackRange = 180; // Увеличено в 1.5 раза с 120 до 180
        this.attackRate = 0.8;
        this.projectileSpeed = 600; // Уменьшено с 900 до 600
        this.projectiles = [];
        this.keepDistance = 150; // Увеличено в 1.5 раза с 100 до 150
    }

    updateBehavior(deltaTime, player) {
        if (!player) return;

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            const normalizedX = dx / distance;
            const normalizedY = dy / distance;
            
            // Держать дистанцию
            if (distance < this.keepDistance) {
                this.velX -= normalizedX * this.speed * deltaTime;
                this.velY -= normalizedY * this.speed * deltaTime;
            } else if (distance > this.keepDistance * 1.5) {
                this.velX += normalizedX * this.speed * deltaTime;
                this.velY += normalizedY * this.speed * deltaTime;
            }
        }

        // Обновление снарядов
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.update(deltaTime);
            
            if (!projectile.active) {
                this.projectiles.splice(i, 1);
            }
        }
    }

    render(ctx) {
        if (!this.active) return;

        // Отрисовка снарядов
        for (const projectile of this.projectiles) {
            projectile.render(ctx);
        }

        ctx.save();
        
        if (this.flashTime > 0) {
            ctx.globalAlpha = 0.5;
        }

        if (this.invulnerable) {
            ctx.globalAlpha = 0.7;
        }

        // Отрисовка изображения range_virus
        if (enemyImages.range_virus && enemyImages.range_virus.complete) {
            ctx.drawImage(
                enemyImages.range_virus,
                this.x - this.size / 2,
                this.y - this.size / 2,
                this.size,
                this.size
            );
        } else {
            // Fallback - шестиугольная форма
            ctx.fillStyle = this.color;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI * 2) / 6;
                const x = this.x + Math.cos(angle) * this.size / 2;
                const y = this.y + Math.sin(angle) * this.size / 2;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.fill();
        }

        if (this.health < this.maxHealth) {
            this.renderHealthBar(ctx);
        }

        ctx.restore();
    }

    attack(player) {
        // Создание снаряда
        const angle = MathUtils.angle(this.x, this.y, player.x, player.y);
        const velX = Math.cos(angle) * this.projectileSpeed;
        const velY = Math.sin(angle) * this.projectileSpeed;
        
        const projectile = new EnemyProjectile(
            this.x, this.y, velX, velY, this.damage, 2
        );
        
        this.projectiles.push(projectile);
        this.lastAttack = 0;
    }

    getProjectiles() {
        return this.projectiles;
    }
}

// Снаряд врага
class EnemyProjectile {
    constructor(x, y, velX, velY, damage, life) {
        this.x = x;
        this.y = y;
        this.velX = velX;
        this.velY = velY;
        this.damage = damage;
        this.life = life;
        this.active = true;
        this.size = 9; // Увеличено в 1.5 раза с 6 до 9
        this.color = '#ff00ff';
        this.angle = Math.atan2(velY, velX);
    }

    update(deltaTime) {
        if (!this.active) return;

        this.x += this.velX * deltaTime;
        this.y += this.velY * deltaTime;

        this.life -= deltaTime;
        if (this.life <= 0) {
            this.active = false;
        }
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

// Fast Runner - быстрый бегун
class FastRunnerEnemy extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.maxHealth = 15;
        this.health = this.maxHealth;
        this.damage = 8;
        this.speed = 500; // Очень быстрый
        this.size = 18; // Увеличено в 1.5 раза с 12 до 18
        this.color = '#00ff00';
        this.xpValue = 8;
        this.type = "fast_runner";
        this.zigzagTime = 0;
        this.zigzagDirection = 1;
        this.zigzagIntensity = 200;
    }

    updateBehavior(deltaTime, player) {
        if (!player) return;

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            const normalizedX = dx / distance;
            const normalizedY = dy / distance;
            
            // Зигзагообразное движение
            this.zigzagTime += deltaTime * 3;
            this.zigzagDirection = Math.sin(this.zigzagTime);
            
            // Основное движение к игроку
            this.velX += normalizedX * this.speed * deltaTime;
            this.velY += normalizedY * this.speed * deltaTime;
            
            // Добавление зигзага
            this.velX += -normalizedY * this.zigzagDirection * this.zigzagIntensity * deltaTime;
            this.velY += normalizedX * this.zigzagDirection * this.zigzagIntensity * deltaTime;
        }
    }

    render(ctx) {
        if (!this.active) return;

        ctx.save();
        
        if (this.flashTime > 0) {
            ctx.globalAlpha = 0.5;
        }

        if (this.invulnerable) {
            ctx.globalAlpha = 0.7;
        }

        // Рисуем стрелку для показа скорости
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x + this.size / 2, this.y);
        ctx.lineTo(this.x - this.size / 2, this.y - this.size / 2);
        ctx.lineTo(this.x - this.size / 4, this.y);
        ctx.lineTo(this.x - this.size / 2, this.y + this.size / 2);
        ctx.closePath();
        ctx.fill();

        if (this.health < this.maxHealth) {
            this.renderHealthBar(ctx);
        }

        ctx.restore();
    }
}

// Tank - танк
class TankEnemyV2 extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.maxHealth = 80;
        this.health = this.maxHealth;
        this.damage = 20;
        this.speed = 150; // Медленный
        this.size = 36; // Увеличено в 1.5 раза с 24 до 36
        this.color = '#888888';
        this.xpValue = 15;
        this.type = "tank_v2";
        this.armor = 5;
        this.chargeTime = 0;
        this.chargeCooldown = 3;
        this.isCharging = false;
        this.chargeSpeed = 800;
        this.chargeDistance = 200;
        this.chargeStartX = 0;
        this.chargeStartY = 0;
    }

    updateBehavior(deltaTime, player) {
        if (!player) return;

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        this.chargeTime += deltaTime;

        if (!this.isCharging && this.chargeTime >= this.chargeCooldown && distance < 300) {
            // Начинаем атаку рывка
            this.isCharging = true;
            this.chargeStartX = this.x;
            this.chargeStartY = this.y;
            this.chargeTime = 0;
            
            if (distance > 0) {
                const normalizedX = dx / distance;
                const normalizedY = dy / distance;
                this.velX = normalizedX * this.chargeSpeed;
                this.velY = normalizedY * this.chargeSpeed;
            }
        } else if (this.isCharging) {
            // Проверяем расстояние рывка
            const chargeDist = Math.sqrt(
                (this.x - this.chargeStartX) ** 2 + 
                (this.y - this.chargeStartY) ** 2
            );
            
            if (chargeDist >= this.chargeDistance || this.chargeTime >= 1) {
                this.isCharging = false;
                this.chargeTime = 0;
                this.velX *= 0.1;
                this.velY *= 0.1;
            }
        } else {
            // Обычное движение
            if (distance > 0) {
                const normalizedX = dx / distance;
                const normalizedY = dy / distance;
                this.velX += normalizedX * this.speed * deltaTime;
                this.velY += normalizedY * this.speed * deltaTime;
            }
        }
    }

    takeDamage(damage) {
        // Танк получает меньше урона
        const reducedDamage = Math.max(1, damage - this.armor);
        super.takeDamage(reducedDamage);
    }

    render(ctx) {
        if (!this.active) return;

        ctx.save();
        
        if (this.flashTime > 0) {
            ctx.globalAlpha = 0.5;
        }

        if (this.invulnerable) {
            ctx.globalAlpha = 0.7;
        }

        // Рисуем квадрат для танка
        ctx.fillStyle = this.isCharging ? '#ff0000' : this.color;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        
        // Рисуем детали танка
        ctx.fillStyle = '#444444';
        ctx.fillRect(this.x - this.size / 3, this.y - this.size / 3, this.size / 1.5, this.size / 1.5);

        if (this.health < this.maxHealth) {
            this.renderHealthBar(ctx);
        }

        ctx.restore();
    }
}

// Splitter - разделитель
class SplitterEnemy extends Enemy {
    constructor(x, y, isSmall = false) {
        super(x, y);
        this.isSmall = isSmall;
        this.maxHealth = isSmall ? 8 : 25;
        this.health = this.maxHealth;
        this.damage = isSmall ? 5 : 12;
        this.speed = isSmall ? 400 : 250;
        this.size = isSmall ? 10 : 18;
        this.color = isSmall ? '#ffff00' : '#ff8800';
        this.xpValue = isSmall ? 3 : 10;
        this.type = "splitter";
        this.splitCount = isSmall ? 0 : 3;
        this.pulsateTime = 0;
    }

    updateBehavior(deltaTime, player) {
        this.pulsateTime += deltaTime * 4;
        super.updateBehavior(deltaTime, player);
    }

    die() {
        super.die();
        
        // Создаем маленьких врагов при смерти
        if (!this.isSmall && this.splitCount > 0 && window.game && window.game.enemySystem) {
            for (let i = 0; i < this.splitCount; i++) {
                const angle = (i / this.splitCount) * Math.PI * 2;
                const distance = 30;
                const smallX = this.x + Math.cos(angle) * distance;
                const smallY = this.y + Math.sin(angle) * distance;
                
                const smallEnemy = new SplitterEnemy(smallX, smallY, true);
                window.game.enemySystem.enemies.push(smallEnemy);
            }
        }
    }

    render(ctx) {
        if (!this.active) return;

        ctx.save();
        
        if (this.flashTime > 0) {
            ctx.globalAlpha = 0.5;
        }

        if (this.invulnerable) {
            ctx.globalAlpha = 0.7;
        }

        // Пульсирующий эффект
        const pulseSize = this.size + Math.sin(this.pulsateTime) * 2;
        
        // Отрисовка изображения mother_virus или child_virus
        const imageKey = this.isSmall ? 'child_virus' : 'mother_virus';
        if (enemyImages[imageKey] && enemyImages[imageKey].complete) {
            ctx.drawImage(
                enemyImages[imageKey],
                this.x - pulseSize / 2,
                this.y - pulseSize / 2,
                pulseSize,
                pulseSize
            );
        } else {
            // Fallback - круговая форма
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, pulseSize / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Внутренний круг
            ctx.fillStyle = this.isSmall ? '#ffff88' : '#ffaa00';
            ctx.beginPath();
            ctx.arc(this.x, this.y, pulseSize / 4, 0, Math.PI * 2);
            ctx.fill();
        }

        if (this.health < this.maxHealth) {
            this.renderHealthBar(ctx);
        }

        ctx.restore();
    }
}

// Teleporter - телепортер
class TeleporterEnemy extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.maxHealth = 20;
        this.health = this.maxHealth;
        this.damage = 15;
        this.speed = 200;
        this.size = 24; // Увеличено в 1.5 раза с 16 до 24
        this.color = '#9900ff';
        this.xpValue = 12;
        this.type = "teleporter";
        this.teleportCooldown = 2;
        this.teleportTime = 0;
        this.teleportRange = 150;
        this.isTeleporting = false;
        this.teleportEffect = 0;
    }

    updateBehavior(deltaTime, player) {
        if (!player) return;

        this.teleportTime += deltaTime;
        
        if (this.isTeleporting) {
            this.teleportEffect += deltaTime * 10;
            if (this.teleportEffect >= 1) {
                this.isTeleporting = false;
                this.teleportEffect = 0;
            }
            return;
        }

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Телепорт к игроку
        if (this.teleportTime >= this.teleportCooldown && distance > this.teleportRange) {
            this.teleport(player);
        } else {
            // Обычное движение
            if (distance > 0) {
                const normalizedX = dx / distance;
                const normalizedY = dy / distance;
                this.velX += normalizedX * this.speed * deltaTime;
                this.velY += normalizedY * this.speed * deltaTime;
            }
        }
    }

    teleport(player) {
        this.teleportTime = 0;
        this.isTeleporting = true;
        this.teleportEffect = 0;
        
        // Телепортируемся дальше от игрока (в 1.5 раза дальше)
        const angle = Math.random() * Math.PI * 2;
        const distance = 75 + Math.random() * 75; // Увеличено в 1.5 раза с 50 до 75
        this.x = player.x + Math.cos(angle) * distance;
        this.y = player.y + Math.sin(angle) * distance;
        
        this.velX = 0;
        this.velY = 0;
    }

    render(ctx) {
        if (!this.active) return;

        ctx.save();
        
        if (this.flashTime > 0) {
            ctx.globalAlpha = 0.5;
        }

        if (this.invulnerable || this.isTeleporting) {
            ctx.globalAlpha = 0.3 + 0.7 * Math.sin(this.teleportEffect * Math.PI * 4);
        }

        // Отрисовка изображения ghost_virus
        if (enemyImages.ghost_virus && enemyImages.ghost_virus.complete) {
            ctx.drawImage(
                enemyImages.ghost_virus,
                this.x - this.size / 2,
                this.y - this.size / 2,
                this.size,
                this.size
            );
        } else {
            // Fallback - рисуем ромб
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - this.size / 2);
            ctx.lineTo(this.x + this.size / 2, this.y);
            ctx.lineTo(this.x, this.y + this.size / 2);
            ctx.lineTo(this.x - this.size / 2, this.y);
            ctx.closePath();
            ctx.fill();
        }
        
        // Эффект телепорта
        if (this.isTeleporting) {
            ctx.strokeStyle = '#ff00ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * (1 + this.teleportEffect), 0, Math.PI * 2);
            ctx.stroke();
        }

        if (this.health < this.maxHealth) {
            this.renderHealthBar(ctx);
        }

        ctx.restore();
    }
}

// Poison Spider - ядовитый паук
class PoisonSpiderEnemy extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.maxHealth = 18;
        this.health = this.maxHealth;
        this.damage = 10;
        this.speed = 280;
        this.size = 21; // Увеличено в 1.5 раза с 14 до 21
        this.color = '#00cc00';
        this.xpValue = 9;
        this.type = "poison_spider";
        this.poisonTrailTime = 0;
        this.poisonTrailInterval = 0.5;
        this.legAnimationTime = 0;
    }

    updateBehavior(deltaTime, player) {
        super.updateBehavior(deltaTime, player);
        
        this.poisonTrailTime += deltaTime;
        this.legAnimationTime += deltaTime * 8;
        
        // Оставляем ядовитый след
        if (this.poisonTrailTime >= this.poisonTrailInterval) {
            this.poisonTrailTime = 0;
            this.createPoisonTrail();
        }
    }

    createPoisonTrail() {
        if (window.game && window.game.particleSystem) {
            window.game.particleSystem.createPoisonTrail(this.x, this.y);
        }
    }

    die() {
        super.die();
        
        // Создаем ядовитую лужу при смерти
        if (window.game && window.game.particleSystem) {
            window.game.particleSystem.createPoisonPool(this.x, this.y, 60);
        }
    }

    render(ctx) {
        if (!this.active) return;

        ctx.save();
        
        if (this.flashTime > 0) {
            ctx.globalAlpha = 0.5;
        }

        if (this.invulnerable) {
            ctx.globalAlpha = 0.7;
        }

        // Рисуем тело паука
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Рисуем ноги
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        const legOffset = Math.sin(this.legAnimationTime) * 3;
        
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const legLength = this.size / 2 + 4 + legOffset;
            const legX = this.x + Math.cos(angle) * legLength;
            const legY = this.y + Math.sin(angle) * legLength;
            
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(legX, legY);
            ctx.stroke();
        }

        if (this.health < this.maxHealth) {
            this.renderHealthBar(ctx);
        }

        ctx.restore();
    }
}

// Система врагов
class EnemySystem {
    constructor() {
        this.enemies = [];
        this.spatialGrid = null;
        this.enemyTypes = [
            { class: Enemy, weight: 0 }, // Скрыт - нет изображения
            { class: FastEnemy, weight: 0 }, // Скрыт - нет изображения
            { class: TankEnemy, weight: 1 }, // tank_virus.png
            { class: ExplodingEnemy, weight: 0 }, // Скрыт - нет изображения
            { class: ShooterEnemy, weight: 1 }, // range_virus.png
            { class: FastRunnerEnemy, weight: 0 }, // Скрыт - нет изображения
            { class: TankEnemyV2, weight: 0 }, // Скрыт - нет изображения
            { class: SplitterEnemy, weight: 2 }, // mother_virus.png, child_virus.png
            { class: TeleporterEnemy, weight: 1 }, // ghost_virus.png
            { class: PoisonSpiderEnemy, weight: 0 } // Скрыт - нет изображения
        ];
        this.spawnRate = 6; // Увеличено с 2 до 6
        this.spawnTimer = 0;
        this.maxEnemies = 75; // Увеличено с 50 до 75
        this.difficultyMultiplier = 1;
        this.waveSystem = {
            currentWave: 1,
            enemiesPerWave: 15, // Увеличено с 10 до 15
            waveTimer: 0,
            waveDuration: 25, // Уменьшено с 30 до 25 для более быстрой эскалации
            betweenWaves: false
        };
    }

    initSpatialGrid(width, height) {
        this.spatialGrid = new SpatialGrid(width, height, 100);
    }

    update(deltaTime, player) {
        // Обновление пространственной сетки
        if (this.spatialGrid) {
            this.spatialGrid.clear();
            for (const enemy of this.enemies) {
                if (enemy.active) {
                    this.spatialGrid.insert(enemy, enemy.x, enemy.y);
                }
            }
        }

        // Обновление врагов
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(deltaTime, player);
            
            // Удаление неактивных врагов или слишком далеких от игрока
            // Увеличена дистанция для поддержки дальнобойных классов
            if (!enemy.active || enemy.isTooFarFromPlayer(player, 4000)) {
                this.enemies.splice(i, 1);
            }
        }

        // Система спавна
        this.updateSpawning(deltaTime, player);

        // Система волн
        this.updateWaveSystem(deltaTime);

        // Увеличение сложности
        this.updateDifficulty(deltaTime);
    }

    updateSpawning(deltaTime, player) {
        if (!player || this.enemies.length >= this.maxEnemies) return;

        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= 1 / this.spawnRate) {
            this.spawnEnemy(player);
            this.spawnTimer = 0;
        }
    }

    updateWaveSystem(deltaTime) {
        this.waveSystem.waveTimer += deltaTime;
        
        if (this.waveSystem.waveTimer >= this.waveSystem.waveDuration) {
            this.waveSystem.currentWave++;
            this.waveSystem.waveTimer = 0;
            this.waveSystem.enemiesPerWave = Math.floor(this.waveSystem.enemiesPerWave * 1.25); // Увеличено с 1.2 до 1.25
            
            // Увеличение максимального количества врагов более агрессивно
            this.maxEnemies = Math.min(150, this.maxEnemies + 8); // Увеличено с 100 до 150, с +5 до +8
            
            // Увеличение скорости спавна со временем
            this.spawnRate = Math.min(12, this.spawnRate + 0.5); // Максимум до 12 врагов в секунду
            
            // Каждые 5 волн уменьшаем время волны для ускорения
            if (this.waveSystem.currentWave % 5 === 0) {
                this.waveSystem.waveDuration = Math.max(15, this.waveSystem.waveDuration - 2);
            }
        }
    }

    updateDifficulty(deltaTime) {
        // Более агрессивное увеличение сложности
        this.difficultyMultiplier += deltaTime * 0.02; // Увеличено с 0.01 до 0.02
        
        // Базовая скорость спавна теперь растет быстрее
        const baseSpawnRate = 6 + this.difficultyMultiplier * 0.8; // Увеличено коэффициент с 0.5 до 0.8
        this.spawnRate = Math.min(12, baseSpawnRate);
        
        // Добавляем рост разнообразия врагов со временем
        if (this.difficultyMultiplier > 2) {
            // Увеличиваем вес более сильных врагов
            this.enemyTypes[2].weight = Math.min(3, 1 + this.difficultyMultiplier * 0.1); // Танк
            this.enemyTypes[3].weight = Math.min(4, 2 + this.difficultyMultiplier * 0.1); // Взрывной
            this.enemyTypes[4].weight = Math.min(3, 1 + this.difficultyMultiplier * 0.1); // Стрелок
        }
    }

    spawnEnemy(player) {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // Спавн врагов относительно позиции игрока для бесконечной карты
        const spawnDistance = 400; // Увеличено расстояние спавна для лучшего покрытия
        const side = MathUtils.randomInt(0, 3);
        let x, y;
        
        // Определяем позицию камеры
        const cameraX = player.x - screenWidth / 2;
        const cameraY = player.y - screenHeight / 2;
        
        switch (side) {
            case 0: // Сверху
                x = cameraX + MathUtils.random(-spawnDistance, screenWidth + spawnDistance);
                y = cameraY - spawnDistance;
                break;
            case 1: // Справа
                x = cameraX + screenWidth + spawnDistance;
                y = cameraY + MathUtils.random(-spawnDistance, screenHeight + spawnDistance);
                break;
            case 2: // Снизу
                x = cameraX + MathUtils.random(-spawnDistance, screenWidth + spawnDistance);
                y = cameraY + screenHeight + spawnDistance;
                break;
            case 3: // Слева
                x = cameraX - spawnDistance;
                y = cameraY + MathUtils.random(-spawnDistance, screenHeight + spawnDistance);
                break;
        }

        // Выбор типа врага
        const enemyType = this.getRandomEnemyType();
        const enemy = new enemyType(x, y);
        
        // Применение множителя сложности
        enemy.health = Math.floor(enemy.health * this.difficultyMultiplier);
        enemy.maxHealth = enemy.health;
        enemy.damage = Math.floor(enemy.damage * this.difficultyMultiplier);
        enemy.speed = Math.floor(enemy.speed * (1 + this.difficultyMultiplier * 0.1));
        enemy.xpValue = Math.floor(enemy.xpValue * this.difficultyMultiplier);
        
        this.enemies.push(enemy);
    }

    getRandomEnemyType() {
        const totalWeight = this.enemyTypes.reduce((sum, type) => sum + type.weight, 0);
        let random = MathUtils.random(0, totalWeight);
        
        for (const type of this.enemyTypes) {
            random -= type.weight;
            if (random <= 0) {
                return type.class;
            }
        }
        
        return Enemy;
    }

    render(ctx) {
        for (const enemy of this.enemies) {
            enemy.render(ctx);
        }
    }

    getEnemiesInRange(x, y, range) {
        if (this.spatialGrid) {
            const candidates = this.spatialGrid.query(x, y, range);
            return candidates.filter(enemy => {
                const distance = MathUtils.distance(x, y, enemy.x, enemy.y);
                return distance <= range && enemy.active;
            });
        }
        
        return this.enemies.filter(enemy => {
            const distance = MathUtils.distance(x, y, enemy.x, enemy.y);
            return distance <= range && enemy.active;
        });
    }

    checkCollisions(player) {
        for (const enemy of this.enemies) {
            if (!enemy.active) continue;

            const distance = MathUtils.distance(
                player.x, player.y, 
                enemy.x, enemy.y
            );

            if (distance < player.size + enemy.size) {
                if (enemy.canAttack(player)) {
                    enemy.attack(player);
                }
            }

            // Проверка столкновения снарядов врагов с игроком
            if (enemy.getProjectiles) {
                const projectiles = enemy.getProjectiles();
                for (let i = projectiles.length - 1; i >= 0; i--) {
                    const projectile = projectiles[i];
                    if (!projectile.active) continue;

                    const projDistance = MathUtils.distance(
                        player.x, player.y,
                        projectile.x, projectile.y
                    );

                    if (projDistance < player.size + projectile.size) {
                        player.takeDamage(projectile.damage);
                        projectile.active = false;
                        projectiles.splice(i, 1);
                    }
                }
            }
        }
    }

    clear() {
        this.enemies = [];
        this.spawnTimer = 0;
        this.difficultyMultiplier = 1;
        this.waveSystem.currentWave = 1;
        this.waveSystem.waveTimer = 0;
    }

    getEnemyCount() {
        return this.enemies.length;
    }

    getActiveEnemies() {
        return this.enemies.filter(enemy => enemy.active);
    }

    getWaveInfo() {
        return {
            currentWave: this.waveSystem.currentWave,
            timeLeft: this.waveSystem.waveDuration - this.waveSystem.waveTimer,
            enemiesPerWave: this.waveSystem.enemiesPerWave,
            difficulty: this.difficultyMultiplier
        };
    }
}

// Экспорт классов
window.Enemy = Enemy;
window.FastEnemy = FastEnemy;
window.TankEnemy = TankEnemy;
window.ExplodingEnemy = ExplodingEnemy;
window.ShooterEnemy = ShooterEnemy;
window.FastRunnerEnemy = FastRunnerEnemy;
window.TankEnemyV2 = TankEnemyV2;
window.SplitterEnemy = SplitterEnemy;
window.TeleporterEnemy = TeleporterEnemy;
window.PoisonSpiderEnemy = PoisonSpiderEnemy;
window.EnemyProjectile = EnemyProjectile;
window.EnemySystem = EnemySystem; 