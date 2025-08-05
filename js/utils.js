// Математические утилиты
const MathUtils = {
    // Расстояние между двумя точками
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    // Нормализация вектора
    normalize(x, y) {
        const length = Math.sqrt(x * x + y * y);
        if (length === 0) return { x: 0, y: 0 };
        return { x: x / length, y: y / length };
    },

    // Линейная интерполяция
    lerp(start, end, t) {
        return start + (end - start) * t;
    },

    // Ограничение значения
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    // Случайное число в диапазоне
    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    // Случайное целое число
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Угол между двумя точками
    angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    },

    // Нормализация угла в диапазон [-π, π]
    normalizeAngle(angle) {
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        return angle;
    },

    // Вращение точки вокруг центра
    rotate(x, y, centerX, centerY, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const dx = x - centerX;
        const dy = y - centerY;
        return {
            x: centerX + dx * cos - dy * sin,
            y: centerY + dx * sin + dy * cos
        };
    }
};

// Система коллизий
const CollisionSystem = {
    // Проверка коллизии между двумя прямоугольниками
    rectRect(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
    },

    // Проверка коллизии между двумя кругами
    circleCircle(x1, y1, r1, x2, y2, r2) {
        const distance = MathUtils.distance(x1, y1, x2, y2);
        return distance < r1 + r2;
    },

    // Проверка коллизии между кругом и прямоугольником
    circleRect(cx, cy, r, rx, ry, rw, rh) {
        const closestX = MathUtils.clamp(cx, rx, rx + rw);
        const closestY = MathUtils.clamp(cy, ry, ry + rh);
        const distance = MathUtils.distance(cx, cy, closestX, closestY);
        return distance < r;
    },

    // Проверка точки в прямоугольнике
    pointInRect(px, py, rx, ry, rw, rh) {
        return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    },

    // Проверка точки в круге
    pointInCircle(px, py, cx, cy, r) {
        const distance = MathUtils.distance(px, py, cx, cy);
        return distance <= r;
    }
};

// Object Pool для оптимизации производительности
class ObjectPool {
    constructor(createFn, resetFn, initialSize = 10) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];
        this.active = [];
        
        // Предзаполнение пула
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
        }
    }

    get() {
        let object;
        if (this.pool.length > 0) {
            object = this.pool.pop();
        } else {
            object = this.createFn();
        }
        this.active.push(object);
        return object;
    }

    release(object) {
        const index = this.active.indexOf(object);
        if (index > -1) {
            this.active.splice(index, 1);
            this.resetFn(object);
            this.pool.push(object);
        }
    }

    clear() {
        this.pool = [];
        this.active = [];
    }

    getActiveCount() {
        return this.active.length;
    }

    getPoolSize() {
        return this.pool.length;
    }
}

// Spatial Grid для оптимизации коллизий
class SpatialGrid {
    constructor(width, height, cellSize) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        this.cols = Math.ceil(width / cellSize);
        this.rows = Math.ceil(height / cellSize);
        this.grid = [];
        this.clear();
    }

    clear() {
        this.grid = [];
        for (let i = 0; i < this.cols * this.rows; i++) {
            this.grid[i] = [];
        }
    }

    hash(x, y) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
            return -1;
        }
        return row * this.cols + col;
    }

    insert(object, x, y) {
        const index = this.hash(x, y);
        if (index >= 0) {
            this.grid[index].push(object);
        }
    }

    query(x, y, radius = 0) {
        const results = [];
        const startCol = Math.max(0, Math.floor((x - radius) / this.cellSize));
        const endCol = Math.min(this.cols - 1, Math.floor((x + radius) / this.cellSize));
        const startRow = Math.max(0, Math.floor((y - radius) / this.cellSize));
        const endRow = Math.min(this.rows - 1, Math.floor((y + radius) / this.cellSize));

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const index = row * this.cols + col;
                results.push(...this.grid[index]);
            }
        }
        return results;
    }
}

// Загрузчик ресурсов
class ResourceLoader {
    constructor() {
        this.resources = new Map();
        this.loadedCount = 0;
        this.totalCount = 0;
    }

    loadImage(name, src) {
        this.totalCount++;
        const img = new Image();
        img.onload = () => {
            this.loadedCount++;
            this.resources.set(name, img);
        };
        img.src = src;
        return img;
    }

    loadAudio(name, src) {
        this.totalCount++;
        const audio = new Audio();
        audio.onloadeddata = () => {
            this.loadedCount++;
            this.resources.set(name, audio);
        };
        audio.src = src;
        return audio;
    }

    get(name) {
        return this.resources.get(name);
    }

    isLoaded() {
        return this.loadedCount === this.totalCount;
    }

    getProgress() {
        return this.totalCount === 0 ? 1 : this.loadedCount / this.totalCount;
    }
}

// Менеджер ввода
class InputManager {
    constructor() {
        this.keys = {};
        this.previousKeys = {};
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseDown = false;
        this.previousMouseDown = false;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        document.addEventListener('mousemove', (e) => {
            const rect = document.getElementById('gameCanvas').getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });

        document.addEventListener('mousedown', () => {
            this.mouseDown = true;
        });

        document.addEventListener('mouseup', () => {
            this.mouseDown = false;
        });
    }
    
    // Метод для определения только что нажатой клавиши (однократное нажатие)
    update() {
        // Копируем текущее состояние клавиш для следующего кадра
        this.previousKeys = {...this.keys};
        this.previousMouseDown = this.mouseDown;
    }

    isKeyPressed(key) {
        return !!this.keys[key.toLowerCase()];
    }
    
    // Проверяет, была ли клавиша только что нажата (одно нажатие)
    isKeyJustPressed(key) {
        const lowKey = key.toLowerCase();
        return !!this.keys[lowKey] && !this.previousKeys[lowKey];
    }

    getMousePosition() {
        return { x: this.mouseX, y: this.mouseY };
    }

    isMousePressed() {
        return this.mouseDown;
    }
    
    // Проверяет, была ли кнопка мыши только что нажата (одно нажатие)
    isMouseJustPressed() {
        return this.mouseDown && !this.previousMouseDown;
    }
}

// Менеджер времени
class TimeManager {
    constructor() {
        this.lastTime = 0;
        this.deltaTime = 0;
        this.gameTime = 0;
        this.timeScale = 1;
    }

    update(currentTime) {
        this.deltaTime = (currentTime - this.lastTime) / 1000 * this.timeScale;
        this.lastTime = currentTime;
        this.gameTime += this.deltaTime;
    }

    getDeltaTime() {
        return this.deltaTime;
    }

    getGameTime() {
        return this.gameTime;
    }

    setTimeScale(scale) {
        this.timeScale = scale;
    }
}

// Система анимации
class AnimationSystem {
    constructor() {
        this.animations = new Map();
    }

    createAnimation(name, frames, duration, loop = true) {
        this.animations.set(name, {
            frames,
            duration,
            loop,
            currentFrame: 0,
            currentTime: 0
        });
    }

    update(name, deltaTime) {
        const anim = this.animations.get(name);
        if (!anim) return null;

        anim.currentTime += deltaTime;
        const frameTime = anim.duration / anim.frames.length;

        if (anim.currentTime >= frameTime) {
            anim.currentTime = 0;
            anim.currentFrame++;
            
            if (anim.currentFrame >= anim.frames.length) {
                if (anim.loop) {
                    anim.currentFrame = 0;
                } else {
                    anim.currentFrame = anim.frames.length - 1;
                }
            }
        }

        return anim.frames[anim.currentFrame];
    }

    reset(name) {
        const anim = this.animations.get(name);
        if (anim) {
            anim.currentFrame = 0;
            anim.currentTime = 0;
        }
    }
}

// Экспорт глобальных объектов
window.MathUtils = MathUtils;
window.CollisionSystem = CollisionSystem;
window.ObjectPool = ObjectPool;
window.SpatialGrid = SpatialGrid;
window.ResourceLoader = ResourceLoader;
window.InputManager = InputManager;
window.TimeManager = TimeManager;
window.AnimationSystem = AnimationSystem; 