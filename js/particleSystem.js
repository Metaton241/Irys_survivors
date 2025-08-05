// Базовый класс частицы
class Particle {
    constructor(x, y, velX, velY, life, color, size) {
        this.x = x;
        this.y = y;
        this.velX = velX;
        this.velY = velY;
        this.life = life;
        this.maxLife = life;
        this.color = color;
        this.size = size;
        this.initialSize = size;
        this.gravity = 0;
        this.friction = 0.99;
        this.active = true;
        this.alpha = 1;
        this.rotation = 0;
        this.rotationSpeed = 0;
    }

    update(deltaTime) {
        if (!this.active) return;

        // Обновление позиции
        this.x += this.velX * deltaTime;
        this.y += this.velY * deltaTime;

        // Применение гравитации
        this.velY += this.gravity * deltaTime;

        // Применение трения
        this.velX *= this.friction;
        this.velY *= this.friction;

        // Обновление времени жизни
        this.life -= deltaTime;
        if (this.life <= 0) {
            this.active = false;
            return;
        }

        // Обновление альфа-канала
        this.alpha = this.life / this.maxLife;

        // Обновление размера
        this.size = this.initialSize * this.alpha;

        // Обновление вращения
        this.rotation += this.rotationSpeed * deltaTime;
    }

    render(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }
}

// Круглая частица
class CircleParticle extends Particle {
    render(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Частица с градиентом
class GradientParticle extends Particle {
    constructor(x, y, velX, velY, life, colors, size) {
        super(x, y, velX, velY, life, colors[0], size);
        this.colors = colors;
    }

    render(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size / 2
        );
        
        for (let i = 0; i < this.colors.length; i++) {
            gradient.addColorStop(i / (this.colors.length - 1), this.colors[i]);
        }
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Искра
class SparkParticle extends Particle {
    constructor(x, y, velX, velY, life, color, size) {
        super(x, y, velX, velY, life, color, size);
        this.length = size * 3;
        this.friction = 0.95;
    }

    render(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.size;
        ctx.lineCap = 'round';
        
        const angle = Math.atan2(this.velY, this.velX);
        const endX = this.x - Math.cos(angle) * this.length;
        const endY = this.y - Math.sin(angle) * this.length;
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.restore();
    }
}

// Текстовая частица
class TextParticle extends Particle {
    constructor(x, y, velX, velY, life, text, color, fontSize) {
        super(x, y, velX, velY, life, color, fontSize);
        this.text = text;
        this.fontSize = fontSize;
        this.fontFamily = 'Arial';
        this.fontWeight = 'bold';
    }

    render(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.font = `${this.fontWeight} ${this.fontSize}px ${this.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Тень для лучшей читаемости
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

// Эмиттер частиц
class ParticleEmitter {
    constructor(x, y, particleCount, particleType = Particle) {
        this.x = x;
        this.y = y;
        this.particleCount = particleCount;
        this.particleType = particleType;
        this.particles = [];
        this.active = true;
        this.emissionRate = 10;
        this.lastEmission = 0;
        this.duration = -1; // -1 = бесконечно
        this.life = 0;
        
        // Настройки генерации частиц
        this.minVelocity = 50;
        this.maxVelocity = 200;
        this.minAngle = 0;
        this.maxAngle = Math.PI * 2;
        this.minLife = 0.5;
        this.maxLife = 2;
        this.minSize = 2;
        this.maxSize = 8;
        this.colors = ['#ff0000', '#ff4444', '#ff8888'];
        this.gravity = 0;
        this.friction = 0.99;
    }

    emit(count = 1) {
        for (let i = 0; i < count; i++) {
            const angle = MathUtils.random(this.minAngle, this.maxAngle);
            const velocity = MathUtils.random(this.minVelocity, this.maxVelocity);
            const velX = Math.cos(angle) * velocity;
            const velY = Math.sin(angle) * velocity;
            const life = MathUtils.random(this.minLife, this.maxLife);
            const size = MathUtils.random(this.minSize, this.maxSize);
            const color = this.colors[MathUtils.randomInt(0, this.colors.length - 1)];
            
            let particle;
            if (this.particleType === GradientParticle) {
                particle = new GradientParticle(this.x, this.y, velX, velY, life, this.colors, size);
            } else {
                particle = new this.particleType(this.x, this.y, velX, velY, life, color, size);
            }
            
            particle.gravity = this.gravity;
            particle.friction = this.friction;
            
            this.particles.push(particle);
        }
    }

    update(deltaTime) {
        if (!this.active) return;

        // Обновление времени жизни эмиттера
        this.life += deltaTime;
        if (this.duration > 0 && this.life >= this.duration) {
            this.active = false;
        }

        // Эмиссия новых частиц
        if (this.active) {
            this.lastEmission += deltaTime;
            if (this.lastEmission >= 1 / this.emissionRate) {
                this.emit(1);
                this.lastEmission = 0;
            }
        }

        // Обновление существующих частиц
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (!particle.active) {
                this.particles.splice(i, 1);
            }
        }
    }

    render(ctx) {
        for (const particle of this.particles) {
            particle.render(ctx);
        }
    }

    burst(count) {
        this.emit(count);
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    stop() {
        this.active = false;
    }

    getParticleCount() {
        return this.particles.length;
    }
}

// Система частиц
class ParticleSystem {
    constructor() {
        this.emitters = [];
        this.maxParticles = 800; // Уменьшено с 1000 до 800 для лучшей производительности
        this.particleCount = 0;
        this.maxEmitters = 40; // Уменьшено с 50 до 40 для оптимизации
    }

    addEmitter(emitter) {
        this.emitters.push(emitter);
    }

    removeEmitter(emitter) {
        const index = this.emitters.indexOf(emitter);
        if (index > -1) {
            this.emitters.splice(index, 1);
        }
    }

    update(deltaTime) {
        this.particleCount = 0;
        
        for (let i = this.emitters.length - 1; i >= 0; i--) {
            const emitter = this.emitters[i];
            emitter.update(deltaTime);
            this.particleCount += emitter.getParticleCount();
            
            // Улучшенная логика удаления эмиттеров
            const shouldRemove = (!emitter.active && emitter.getParticleCount() === 0) ||
                                (emitter.duration > 0 && emitter.life > emitter.duration + 10); // Добавляем буферное время для полной очистки
            
            if (shouldRemove) {
                console.log('Удален эмиттер, частиц:', emitter.getParticleCount(), 'активен:', emitter.active, 'жизнь:', emitter.life, 'осталось эмиттеров:', this.emitters.length - 1);
                this.emitters.splice(i, 1);
            }
        }
        
        // Принудительная очистка если слишком много эмиттеров
        if (this.emitters.length > this.maxEmitters) {
            console.log('Принудительная очистка старых эмиттеров, было:', this.emitters.length);
            this.emitters = this.emitters.slice(-Math.floor(this.maxEmitters * 0.6)); // Оставляем только 60% от максимума
            console.log('Принудительная очистка завершена, осталось:', this.emitters.length);
        }
    }

    render(ctx) {
        for (const emitter of this.emitters) {
            emitter.render(ctx);
        }
    }

    // Предустановленные эффекты
    createBloodSplash(x, y) {
        const emitter = new ParticleEmitter(x, y, 20, CircleParticle);
        emitter.colors = ['#8B0000', '#FF0000', '#FF4444'];
        emitter.minVelocity = 100;
        emitter.maxVelocity = 300;
        emitter.minLife = 2;
        emitter.maxLife = 3;
        emitter.minSize = 2;
        emitter.maxSize = 6;
        emitter.gravity = 200;
        emitter.friction = 0.95;
        emitter.duration = 0.1;
        emitter.emissionRate = 200;
        
        this.addEmitter(emitter);
        console.log('Создана кровь в', x, y, 'эмиттеров всего:', this.emitters.length);
        return emitter;
    }

    createExplosion(x, y) {
        const emitter = new ParticleEmitter(x, y, 30, GradientParticle);
        emitter.colors = ['#FFD700', '#FF6347', '#FF4500', '#8B0000'];
        emitter.minVelocity = 150;
        emitter.maxVelocity = 400;
        emitter.minLife = 0.5;
        emitter.maxLife = 2;
        emitter.minSize = 8;
        emitter.maxSize = 16;
        emitter.gravity = 100;
        emitter.friction = 0.96;
        emitter.duration = 0.2;
        emitter.emissionRate = 150;
        
        this.addEmitter(emitter);
        return emitter;
    }

    createSparks(x, y) {
        const emitter = new ParticleEmitter(x, y, 15, SparkParticle);
        emitter.colors = ['#FFD700', '#FFA500', '#FF6347'];
        emitter.minVelocity = 200;
        emitter.maxVelocity = 500;
        emitter.minLife = 0.2;
        emitter.maxLife = 0.8;
        emitter.minSize = 1;
        emitter.maxSize = 3;
        emitter.gravity = 300;
        emitter.friction = 0.92;
        emitter.duration = 0.05;
        emitter.emissionRate = 300;
        
        this.addEmitter(emitter);
        return emitter;
    }

    createMuzzleFlash(x, y, angle) {
        const emitter = new ParticleEmitter(x, y, 10, GradientParticle);
        emitter.colors = ['#FFFF00', '#FF6347', '#FF4500'];
        emitter.minAngle = angle - Math.PI / 6;
        emitter.maxAngle = angle + Math.PI / 6;
        emitter.minVelocity = 100;
        emitter.maxVelocity = 300;
        emitter.minLife = 0.1;
        emitter.maxLife = 0.4;
        emitter.minSize = 4;
        emitter.maxSize = 10;
        emitter.gravity = 0;
        emitter.friction = 0.85;
        emitter.duration = 0.1;
        emitter.emissionRate = 100;
        
        this.addEmitter(emitter);
        return emitter;
    }

    createHitEffect(x, y) {
        const emitter = new ParticleEmitter(x, y, 8, CircleParticle);
        emitter.colors = ['#FFFF00', '#FFA500'];
        emitter.minVelocity = 50;
        emitter.maxVelocity = 150;
        emitter.minLife = 0.2;
        emitter.maxLife = 0.6;
        emitter.minSize = 2;
        emitter.maxSize = 5;
        emitter.gravity = 0;
        emitter.friction = 0.9;
        emitter.duration = 0.1;
        emitter.emissionRate = 80;
        
        this.addEmitter(emitter);
        return emitter;
    }

    createLevelUpEffect(x, y) {
        const emitter = new ParticleEmitter(x, y, 25, GradientParticle);
        emitter.colors = ['#00FF00', '#00FFFF', '#0080FF'];
        emitter.minVelocity = 50;
        emitter.maxVelocity = 200;
        emitter.minLife = 1;
        emitter.maxLife = 3;
        emitter.minSize = 6;
        emitter.maxSize = 12;
        emitter.gravity = -50;
        emitter.friction = 0.98;
        emitter.duration = 0.3;
        emitter.emissionRate = 80;
        
        this.addEmitter(emitter);
        return emitter;
    }

    createScoreText(x, y, text, color = '#ffff00') {
        const emitter = new ParticleEmitter(x, y, 1, CircleParticle);
        emitter.colors = [color];
        emitter.minVelocity = 50;
        emitter.maxVelocity = 50;
        emitter.minAngle = -Math.PI / 2;
        emitter.maxAngle = -Math.PI / 2;
        emitter.minLife = 2;
        emitter.maxLife = 2;
        emitter.minSize = 12;
        emitter.maxSize = 12;
        emitter.gravity = 0;
        emitter.friction = 0.98;
        emitter.duration = 0.01;
        emitter.emissionRate = 1;
        
        // Создаем текстовую частицу
        const textParticle = new TextParticle(x, y, 0, -50, 2, text, color, 16);
        emitter.particles.push(textParticle);
        
        this.addEmitter(emitter);
        return emitter;
    }

    // Создание взрыва
    createExplosion(x, y, radius, color = '#ff4444', particleCount = 30) {
        const emitter = new ParticleEmitter(x, y);
        emitter.particleCount = particleCount;
        emitter.life = 0.1;
        emitter.size = 8;
        emitter.speed = 400;
        emitter.spread = Math.PI * 2;
        emitter.color = color;
        emitter.gravity = 200;
        emitter.friction = 0.95;
        emitter.duration = 0.05;
        emitter.emissionRate = particleCount / 0.05;
        emitter.particleClass = CircleParticle;
        
        // Дополнительные огненные частицы
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 100 + Math.random() * 300;
            const velX = Math.cos(angle) * speed;
            const velY = Math.sin(angle) * speed;
            
            const particle = new GradientParticle(
                x, y, velX, velY, 
                0.5 + Math.random() * 0.5,
                ['#ff4444', '#ffaa00', '#ffff00'],
                6 + Math.random() * 8
            );
            particle.gravity = 150;
            particle.friction = 0.95;
            emitter.particles.push(particle);
        }
        
        this.addEmitter(emitter);
        return emitter;
    }

    // Создание ядовитого следа
    createPoisonTrail(x, y) {
        const emitter = new ParticleEmitter(x, y);
        emitter.particleCount = 3;
        emitter.life = 1;
        emitter.size = 4;
        emitter.speed = 30;
        emitter.spread = Math.PI / 4;
        emitter.color = '#00ff00';
        emitter.gravity = 50;
        emitter.friction = 0.98;
        emitter.duration = 0.1;
        emitter.emissionRate = 30;
        emitter.particleClass = CircleParticle;
        
        this.addEmitter(emitter);
        return emitter;
    }

    // Создание ядовитой лужи
    createPoisonPool(x, y, radius) {
        const emitter = new ParticleEmitter(x, y);
        emitter.particleCount = 20;
        emitter.life = 3;
        emitter.size = 6;
        emitter.speed = 80;
        emitter.spread = Math.PI * 2;
        emitter.color = '#00cc00';
        emitter.gravity = 100;
        emitter.friction = 0.9;
        emitter.duration = 0.5;
        emitter.emissionRate = 40;
        emitter.particleClass = CircleParticle;
        
        // Создаем круговую лужу
        for (let i = 0; i < 15; i++) {
            const angle = (i / 15) * Math.PI * 2;
            const distance = Math.random() * radius;
            const poolX = x + Math.cos(angle) * distance;
            const poolY = y + Math.sin(angle) * distance;
            
            const particle = new CircleParticle(
                poolX, poolY, 
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                2 + Math.random() * 2,
                '#00aa00',
                4 + Math.random() * 6
            );
            particle.gravity = 50;
            particle.friction = 0.95;
            emitter.particles.push(particle);
        }
        
        this.addEmitter(emitter);
        return emitter;
    }

    // Создание эффекта магнита
    createMagnetEffect(x, y) {
        const particleCount = 50;
        const radius = 100;
        const colors = ['#3498db', '#2980b9', '#1abc9c'];
        
        // Создаем частицы, которые движутся к центру
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius;
            
            const particleX = x + Math.cos(angle) * distance;
            const particleY = y + Math.sin(angle) * distance;
            
            // Скорость направлена к центру
            const velX = (x - particleX) * (Math.random() * 2 + 1);
            const velY = (y - particleY) * (Math.random() * 2 + 1);
            
            const life = Math.random() * 0.5 + 0.2;
            const size = Math.random() * 6 + 2;
            
            const particle = new GradientParticle(
                particleX, particleY, velX, velY, life, colors, size
            );
            
            const emitter = new ParticleEmitter(particleX, particleY, 1, GradientParticle);
            emitter.particles = [particle];
            this.addEmitter(emitter);
        }
        
        // Создаем частицы, которые движутся от центра
        for (let i = 0; i < particleCount / 2; i++) {
            const angle = Math.random() * Math.PI * 2;
            
            // Скорость направлена от центра
            const velX = Math.cos(angle) * (Math.random() * 100 + 50);
            const velY = Math.sin(angle) * (Math.random() * 100 + 50);
            
            const life = Math.random() * 0.8 + 0.4;
            const size = Math.random() * 4 + 1;
            
            const particle = new CircleParticle(
                x, y, velX, velY, life, colors[Math.floor(Math.random() * colors.length)], size
            );
            
            const emitter = new ParticleEmitter(x, y, 1, CircleParticle);
            emitter.particles = [particle];
            this.addEmitter(emitter);
        }
    }
    
    // Создание эффекта ядерного взрыва
    createNukeEffect(x, y, radius) {
        // Основная волна взрыва
        const waveParticleCount = 100;
        const waveColors = ['#ff5500', '#ff0000', '#ffff00'];
        
        // Создаем кольцевую волну
        for (let i = 0; i < waveParticleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 200 + 400;
            
            const velX = Math.cos(angle) * speed;
            const velY = Math.sin(angle) * speed;
            
            const life = Math.random() * 1 + 0.5;
            const size = Math.random() * 20 + 10;
            
            const particle = new GradientParticle(
                x, y, velX, velY, life, waveColors, size
            );
            
            const emitter = new ParticleEmitter(x, y, 1, GradientParticle);
            emitter.particles = [particle];
            this.addEmitter(emitter);
        }
        
        // Создаем центральное облако взрыва
        const cloudParticleCount = 30;
        const cloudColors = ['#ff0000', '#ff5500', '#ffaa00'];
        
        for (let i = 0; i < cloudParticleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 30;
            
            const particleX = x + Math.cos(angle) * distance;
            const particleY = y + Math.sin(angle) * distance;
            
            const velX = Math.cos(angle) * (Math.random() * 50);
            const velY = Math.sin(angle) * (Math.random() * 50) - 100; // Движение вверх
            
            const life = Math.random() * 2 + 1;
            const size = Math.random() * 40 + 20;
            
            const particle = new GradientParticle(
                particleX, particleY, velX, velY, life, cloudColors, size
            );
            
            // Добавляем гравитацию для эффекта подъема и опускания
            particle.gravity = -20 + Math.random() * 40;
            
            const emitter = new ParticleEmitter(particleX, particleY, 1, GradientParticle);
            emitter.particles = [particle];
            this.addEmitter(emitter);
        }
        
        // Создаем текстовый эффект
        this.createScoreText(x, y, 'BOOM!', '#ff0000');
    }

    clear() {
        this.emitters = [];
        this.particleCount = 0;
    }

    getParticleCount() {
        return this.particleCount;
    }
}

// Экспорт классов
window.Particle = Particle;
window.CircleParticle = CircleParticle;
window.GradientParticle = GradientParticle;
window.SparkParticle = SparkParticle;
window.TextParticle = TextParticle;
window.ParticleEmitter = ParticleEmitter;
window.ParticleSystem = ParticleSystem; 