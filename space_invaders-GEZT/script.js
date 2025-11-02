// ===== CONFIGURACIÓN GLOBAL =====
const CONFIG = {
    PLAYER: {
        WIDTH: 50,
        HEIGHT: 20,
        SPEED: 5
    },
    PROJECTILE: {
        SPEED: 7,
        MAX_PLAYER: 3
    },
    ENEMY: {
        ROWS: 5,
        COLS: 10,
        WIDTH: 40,
        HEIGHT: 30,
        GAP: 10,
        BASE_SPEED: 1,
        SPEED_INCREMENT: 0.3, // Reducido de 1.5 a 0.3
        SHOOT_INTERVAL: 800, // Reducido de 1000 a 800ms
        GAME_OVER_MARGIN: 120 // Aumentado de 80 a 120
    },
    SHIELD: {
        COUNT: 4,
        WIDTH: 80,
        HEIGHT: 40,
        MAX_HEALTH: 100
    },
    UFO: {
        WIDTH: 60,
        HEIGHT: 30,
        SPEED: 2,
        APPEARANCE_INTERVAL: 3000, // Reducido de 5000 a 3000
        APPEARANCE_CHANCE: 0.15 // Aumentado de 0.05 a 0.15
    }
};

// ===== MANEJO DE ACTIVACIÓN DE SONIDO =====
const AudioManager = {
    enabled: false,
    context: null,
    masterGain: null,

    async init() {
        if (this.enabled) return;
        
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();
            
            // Crear nodo de ganancia maestro
            this.masterGain = this.context.createGain();
            this.masterGain.gain.value = 0.7;
            this.masterGain.connect(this.context.destination);
            
            // Oscilador de prueba silencioso
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            gainNode.gain.value = 0;
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            oscillator.start();
            oscillator.stop(this.context.currentTime + 0.1);
            
            this.enabled = true;
            return true;
        } catch (e) {
            console.error('Error al activar el audio:', e);
            return false;
        }
    },

    play(type) {
        if (!this.enabled || !this.context || this.context.state === 'suspended') {
            return;
        }
        
        const sound = this.sounds[type];
        if (!sound) return;
        
        try {
            const now = this.context.currentTime;
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            
            oscillator.type = sound.type;
            oscillator.frequency.setValueAtTime(sound.frequency, now);
            
            if (sound.frequencyEnd !== undefined) {
                oscillator.frequency.exponentialRampToValueAtTime(
                    sound.frequencyEnd, 
                    now + sound.duration
                );
            }
            
            // Envolvente ADSR
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(sound.volume, now + sound.attack);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + sound.attack + sound.decay);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            oscillator.start(now);
            oscillator.stop(now + sound.duration + 0.1);
            
            // Limpieza automática
            oscillator.onended = () => {
                try {
                    oscillator.disconnect();
                    gainNode.disconnect();
                } catch (e) {
                    // Ignorar errores de desconexión
                }
            };
        } catch (e) {
            console.error('Error al reproducir sonido:', e);
        }
    },

    sounds: {
        damage: {
            type: 'sine',
            frequency: 110,
            frequencyEnd: 55,
            duration: 0.5,
            volume: 1.0,
            attack: 0.1,
            decay: 0.4
        },
        ufo: {
            type: 'sine',
            frequency: 220,
            frequencyEnd: 110,
            duration: 0.8,
            volume: 0.6,
            attack: 0.2,
            decay: 0.6
        },
        shoot: {
            type: 'square',
            frequency: 392,
            frequencyEnd: 196,
            duration: 0.15,
            volume: 0.3,
            attack: 0,
            decay: 0.15
        },
        enemyShoot: {
            type: 'sine',
            frequency: 330,
            frequencyEnd: 165,
            duration: 0.2,
            volume: 0.3,
            attack: 0,
            decay: 0.2
        },
        explosion: {
            type: 'sawtooth',
            frequency: 250,
            frequencyEnd: 60,
            duration: 0.6,
            volume: 0.9,
            attack: 0.1,
            decay: 0.5
        },
        powerup: {
            type: 'triangle',
            frequency: 523.25,
            frequencyEnd: 1046.5,
            duration: 0.6,
            volume: 0.8,
            attack: 0.1,
            decay: 0.5
        },
        levelComplete: {
            type: 'sine',
            frequency: 523.25,
            frequencyEnd: 1046.5,
            duration: 0.8,
            volume: 0.7,
            attack: 0.2,
            decay: 0.6
        }
    }
};

// Configurar prompt de sonido
function setupSoundPrompt() {
    const prompt = document.createElement('div');
    prompt.id = 'soundPrompt';
    prompt.innerHTML = '🔊 <span>Haz clic para activar el sonido</span>';
    document.body.appendChild(prompt);
    
    const enableAudio = async () => {
        const success = await AudioManager.init();
        if (success) {
            prompt.style.opacity = '0';
            setTimeout(() => prompt.remove(), 300);
        }
    };
    
    prompt.addEventListener('click', enableAudio);
    document.addEventListener('click', enableAudio, { once: true });
    document.addEventListener('keydown', enableAudio, { once: true });
}

document.addEventListener('DOMContentLoaded', setupSoundPrompt);

// ===== UTILIDADES DOM =====
const getElement = (id) => {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Elemento con id '${id}' no encontrado`);
    return el;
};

// ===== ELEMENTOS DEL DOM =====
const DOM = {
    canvas: getElement('gameCanvas'),
    startScreen: getElement('startScreen'),
    gameOverScreen: getElement('gameOverScreen'),
    startBtn: getElement('startBtn'),
    restartBtn: getElement('restartBtn'),
    scoreDisplay: getElement('score'),
    livesDisplay: getElement('lives'),
    finalScoreDisplay: getElement('finalScore')
};

const ctx = DOM.canvas.getContext('2d');

// ===== ESTADO DEL JUEGO =====
const GameState = {
    active: false,
    paused: false,
    score: 0,
    lives: 3,
    level: 1,
    animationId: null,
    inputAnimationId: null,
    
    // Entidades
    player: {
        x: DOM.canvas.width / 2 - CONFIG.PLAYER.WIDTH / 2,
        y: DOM.canvas.height - 40,
        width: CONFIG.PLAYER.WIDTH,
        height: CONFIG.PLAYER.HEIGHT,
        speed: CONFIG.PLAYER.SPEED
    },
    invaders: [],
    playerProjectiles: [],
    enemyProjectiles: [],
    shields: [],
    ufo: null,
    
    // Control de enemigos
    enemyDirection: 1,
    enemySpeed: CONFIG.ENEMY.BASE_SPEED,
    lastEnemyShotTime: 0,
    lastUfoTime: 0,
    
    // Efectos visuales
    playerHitEffect: false,
    
    reset() {
        this.active = true;
        this.paused = false;
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.enemyDirection = 1;
        this.enemySpeed = CONFIG.ENEMY.BASE_SPEED;
        this.lastEnemyShotTime = 0;
        this.lastUfoTime = 0;
        this.playerHitEffect = false;
        
        // Resetear posición del jugador
        this.player.x = DOM.canvas.width / 2 - CONFIG.PLAYER.WIDTH / 2;
        this.player.y = DOM.canvas.height - 40;
        
        // Limpiar arrays
        this.invaders = [];
        this.playerProjectiles = [];
        this.enemyProjectiles = [];
        this.shields = [];
        this.ufo = null;
    }
};

// ===== CREACIÓN DE ENTIDADES =====
const EntityFactory = {
    createInvaders() {
        const invaders = [];
        for (let row = 0; row < CONFIG.ENEMY.ROWS; row++) {
            for (let col = 0; col < CONFIG.ENEMY.COLS; col++) {
                invaders.push({
                    x: col * (CONFIG.ENEMY.WIDTH + CONFIG.ENEMY.GAP) + 50,
                    y: row * (CONFIG.ENEMY.HEIGHT + CONFIG.ENEMY.GAP) + 50,
                    width: CONFIG.ENEMY.WIDTH,
                    height: CONFIG.ENEMY.HEIGHT,
                    alive: true,
                    points: (CONFIG.ENEMY.ROWS - row) * 10
                });
            }
        }
        return invaders;
    },

    createShields() {
        const shields = [];
        const spacing = DOM.canvas.width / (CONFIG.SHIELD.COUNT + 1);
        
        for (let i = 1; i <= CONFIG.SHIELD.COUNT; i++) {
            shields.push({
                x: spacing * i - CONFIG.SHIELD.WIDTH / 2,
                y: DOM.canvas.height - 150,
                width: CONFIG.SHIELD.WIDTH,
                height: CONFIG.SHIELD.HEIGHT,
                health: CONFIG.SHIELD.MAX_HEALTH
            });
        }
        return shields;
    },

    createUFO() {
        return {
            x: -CONFIG.UFO.WIDTH,
            y: 30,
            width: CONFIG.UFO.WIDTH,
            height: CONFIG.UFO.HEIGHT,
            speed: CONFIG.UFO.SPEED,
            points: [50, 100, 150][Math.floor(Math.random() * 3)]
        };
    },

    createProjectile(x, y, isPlayer) {
        return {
            x: x,
            y: y,
            width: 4,
            height: 10,
            speed: isPlayer ? -CONFIG.PROJECTILE.SPEED : CONFIG.PROJECTILE.SPEED
        };
    }
};

// ===== ACTUALIZACIÓN DE UI =====
const UI = {
    updateScore() {
        DOM.scoreDisplay.textContent = GameState.score;
    },

    updateLives() {
        // Solo actualizar si el número de vidas ha cambiado
        const currentLivesCount = DOM.livesDisplay.children.length;
        if (currentLivesCount === GameState.lives) return;
        
        DOM.livesDisplay.innerHTML = '';
        
        for (let i = 0; i < GameState.lives; i++) {
            const lifeElement = document.createElement('div');
            lifeElement.className = 'life';
            DOM.livesDisplay.appendChild(lifeElement);
        }
    },

    animateLifeLost() {
        const lifeElements = DOM.livesDisplay.querySelectorAll('.life');
        if (lifeElements.length > 0) {
            const lastLife = lifeElements[lifeElements.length - 1];
            lastLife.classList.add('lost');
            setTimeout(() => lastLife.remove(), 1000);
        }
    },

    showPlayerHit() {
        DOM.canvas.classList.add('screen-shake');
        GameState.playerHitEffect = true;
        
        setTimeout(() => {
            DOM.canvas.classList.remove('screen-shake');
            GameState.playerHitEffect = false;
        }, 500);
    },

    showLevelComplete() {
        const overlay = document.createElement('div');
        overlay.className = 'level-complete-overlay';
        overlay.innerHTML = `
            <div class="level-complete-content">
                <h2>¡NIVEL ${GameState.level - 1} COMPLETADO!</h2>
                <p>Preparando nivel ${GameState.level}...</p>
            </div>
        `;
        document.body.appendChild(overlay);
        
        AudioManager.play('levelComplete');
        
        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 300);
        }, 2000);
    },

    showGameOver() {
        DOM.finalScoreDisplay.textContent = `Tu puntuación: ${GameState.score}`;
        DOM.gameOverScreen.style.display = 'flex';
    },

    hideScreens() {
        DOM.startScreen.style.display = 'none';
        DOM.gameOverScreen.style.display = 'none';
    }
};

// ===== CONTROL DEL JUGADOR =====
const PlayerController = {
    keys: {},

    init() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            if (e.key === ' ' && GameState.active && !GameState.paused) {
                this.shoot();
                e.preventDefault();
            }
            
            // Pausa con P o ESC
            if ((e.key === 'p' || e.key === 'P' || e.key === 'Escape') && GameState.active) {
                Game.togglePause();
                e.preventDefault();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    },

    move(direction) {
        if (!GameState.active || GameState.paused) return;
        
        GameState.player.x += GameState.player.speed * direction;
        
        // Limitar movimiento
        if (GameState.player.x < 0) GameState.player.x = 0;
        if (GameState.player.x + GameState.player.width > DOM.canvas.width) {
            GameState.player.x = DOM.canvas.width - GameState.player.width;
        }
    },

    shoot() {
        if (GameState.playerProjectiles.length >= CONFIG.PROJECTILE.MAX_PLAYER) return;
        
        const projectile = EntityFactory.createProjectile(
            GameState.player.x + GameState.player.width / 2 - 2,
            GameState.player.y,
            true
        );
        
        GameState.playerProjectiles.push(projectile);
        AudioManager.play('shoot');
    },

    handleMovement() {
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
            this.move(-1);
        }
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
            this.move(1);
        }
    }
};

// ===== LÓGICA DE ENEMIGOS =====
const EnemyController = {
    move() {
        let moveDown = false;
        const margin = 20;
        
        // Verificar si algún invasor llegó al borde
        for (const invader of GameState.invaders) {
            if (!invader.alive) continue;
            
            if ((invader.x + invader.width >= DOM.canvas.width - margin && GameState.enemyDirection === 1) ||
                (invader.x <= margin && GameState.enemyDirection === -1)) {
                moveDown = true;
                break;
            }
        }
        
        // Cambiar dirección si es necesario
        if (moveDown) {
            GameState.enemyDirection *= -1;
        }
        
        // Mover invasores y verificar game over
        let lowestY = 0;
        for (const invader of GameState.invaders) {
            if (!invader.alive) continue;
            
            if (moveDown) invader.y += 15;
            invader.x += GameState.enemySpeed * GameState.enemyDirection;
            
            if (invader.y + invader.height > lowestY) {
                lowestY = invader.y + invader.height;
            }
        }
        
        // Verificar game over
        if (lowestY >= GameState.player.y - CONFIG.ENEMY.GAME_OVER_MARGIN) {
            Game.over();
        }
    },

    shoot() {
        const currentTime = Date.now();
        if (currentTime - GameState.lastEnemyShotTime < CONFIG.ENEMY.SHOOT_INTERVAL) return;
        
        const aliveInvaders = GameState.invaders.filter(inv => inv.alive);
        if (aliveInvaders.length === 0) return;
        
        const shooter = aliveInvaders[Math.floor(Math.random() * aliveInvaders.length)];
        const projectile = EntityFactory.createProjectile(
            shooter.x + shooter.width / 2 - 2,
            shooter.y + shooter.height,
            false
        );
        
        GameState.enemyProjectiles.push(projectile);
        GameState.lastEnemyShotTime = currentTime;
        AudioManager.play('enemyShoot');
    },

    updateSpeed() {
        const aliveCount = GameState.invaders.filter(inv => inv.alive).length;
        const totalCount = CONFIG.ENEMY.ROWS * CONFIG.ENEMY.COLS;
        const ratio = 1 - (aliveCount / totalCount);
        GameState.enemySpeed = CONFIG.ENEMY.BASE_SPEED + (ratio * CONFIG.ENEMY.SPEED_INCREMENT);
    }
};

// ===== LÓGICA DE UFO =====
const UFOController = {
    update() {
        const currentTime = Date.now();
        
        // Crear UFO si es tiempo
        if (!GameState.ufo && 
            currentTime - GameState.lastUfoTime > CONFIG.UFO.APPEARANCE_INTERVAL &&
            Math.random() < CONFIG.UFO.APPEARANCE_CHANCE) {
            GameState.ufo = EntityFactory.createUFO();
            GameState.lastUfoTime = currentTime;
            AudioManager.play('ufo');
        }
        
        // Mover UFO
        if (GameState.ufo) {
            GameState.ufo.x += GameState.ufo.speed;
            
            // Eliminar si sale de pantalla
            if (GameState.ufo.x > DOM.canvas.width) {
                GameState.ufo = null;
            }
        }
    }
};

// ===== SISTEMA DE COLISIONES =====
const CollisionSystem = {
    checkAABB(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    },

    checkAll() {
        this.checkPlayerProjectiles();
        this.checkEnemyProjectiles();
    },

    checkPlayerProjectiles() {
        for (let i = GameState.playerProjectiles.length - 1; i >= 0; i--) {
            const projectile = GameState.playerProjectiles[i];
            if (!projectile) continue;
            
            let hit = false;
            
            // Colisión con invasores
            for (const invader of GameState.invaders) {
                if (invader.alive && this.checkAABB(projectile, invader)) {
                    GameState.playerProjectiles.splice(i, 1);
                    invader.alive = false;
                    GameState.score += invader.points;
                    UI.updateScore();
                    EnemyController.updateSpeed();
                    AudioManager.play('explosion');
                    
                    // Verificar si todos murieron
                    if (GameState.invaders.every(inv => !inv.alive)) {
                        Game.nextLevel();
                    }
                    hit = true;
                    break;
                }
            }
            
            if (hit) continue;
            
            // Colisión con UFO
            if (GameState.ufo && this.checkAABB(projectile, GameState.ufo)) {
                GameState.playerProjectiles.splice(i, 1);
                GameState.score += GameState.ufo.points;
                UI.updateScore();
                GameState.ufo = null;
                AudioManager.play('powerup');
                continue;
            }
            
            // Colisión con escudos
            for (const shield of GameState.shields) {
                if (shield.health > 0 && this.checkAABB(projectile, shield)) {
                    GameState.playerProjectiles.splice(i, 1);
                    shield.health -= 25;
                    break;
                }
            }
        }
    },

    checkEnemyProjectiles() {
        for (let i = GameState.enemyProjectiles.length - 1; i >= 0; i--) {
            const projectile = GameState.enemyProjectiles[i];
            if (!projectile) continue;
            
            // Colisión con jugador
            if (this.checkAABB(projectile, GameState.player)) {
                GameState.enemyProjectiles.splice(i, 1);
                this.playerHit();
                continue;
            }
            
            // Colisión con escudos
            for (const shield of GameState.shields) {
                if (shield.health > 0 && this.checkAABB(projectile, shield)) {
                    GameState.enemyProjectiles.splice(i, 1);
                    shield.health -= 25;
                    break;
                }
            }
        }
    },

    playerHit() {
        if (GameState.lives <= 0) return;
        
        GameState.lives--;
        UI.animateLifeLost();
        UI.showPlayerHit();
        AudioManager.play('damage');
        
        if (GameState.lives <= 0) {
            setTimeout(() => Game.over(), 1000);
        }
    }
};

// ===== ACTUALIZACIÓN DE PROYECTILES =====
const ProjectileSystem = {
    update() {
        // Proyectiles del jugador
        for (let i = GameState.playerProjectiles.length - 1; i >= 0; i--) {
            GameState.playerProjectiles[i].y += GameState.playerProjectiles[i].speed;
            
            if (GameState.playerProjectiles[i].y < 0) {
                GameState.playerProjectiles.splice(i, 1);
            }
        }
        
        // Proyectiles enemigos
        for (let i = GameState.enemyProjectiles.length - 1; i >= 0; i--) {
            GameState.enemyProjectiles[i].y += GameState.enemyProjectiles[i].speed;
            
            if (GameState.enemyProjectiles[i].y > DOM.canvas.height) {
                GameState.enemyProjectiles.splice(i, 1);
            }
        }
    }
};

// ===== SISTEMA DE RENDERIZADO =====
const Renderer = {
    clear() {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, DOM.canvas.width, DOM.canvas.height);
    },

    drawPlayer() {
        // Efecto de parpadeo al ser golpeado
        if (GameState.playerHitEffect && Math.floor(Date.now() / 100) % 2 === 0) {
            ctx.fillStyle = '#ff0000';
        } else {
            ctx.fillStyle = '#00ff00';
        }
        
        ctx.fillRect(GameState.player.x, GameState.player.y, 
                     GameState.player.width, GameState.player.height);
        
        // Base del jugador
        ctx.beginPath();
        ctx.moveTo(GameState.player.x, GameState.player.y);
        ctx.lineTo(GameState.player.x + GameState.player.width, GameState.player.y);
        ctx.lineTo(GameState.player.x + GameState.player.width / 2, GameState.player.y - 15);
        ctx.closePath();
        ctx.fill();
    },

    drawInvaders() {
        for (const invader of GameState.invaders) {
            if (!invader.alive) continue;
            
            ctx.fillStyle = '#ff00ff';
            ctx.fillRect(invader.x, invader.y, invader.width, invader.height);
            
            // Detalles
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(invader.x + 5, invader.y + 5, invader.width - 10, 5);
            ctx.fillRect(invader.x + 5, invader.y + invader.height - 10, invader.width - 10, 5);
            ctx.fillRect(invader.x + 15, invader.y + 10, 10, invader.height - 20);
        }
    },

    drawProjectiles() {
        // Proyectiles del jugador
        ctx.fillStyle = '#00ff00';
        for (const p of GameState.playerProjectiles) {
            ctx.fillRect(p.x, p.y, p.width, p.height);
        }
        
        // Proyectiles enemigos
        ctx.fillStyle = '#ff0000';
        for (const p of GameState.enemyProjectiles) {
            ctx.fillRect(p.x, p.y, p.width, p.height);
        }
    },

    drawShields() {
        for (const shield of GameState.shields) {
            if (shield.health <= 0) continue;
            
            const greenValue = Math.floor(255 * (shield.health / 100));
            ctx.fillStyle = `rgb(0, ${greenValue}, 0)`;
            
            ctx.beginPath();
            ctx.moveTo(shield.x, shield.y + shield.height);
            ctx.lineTo(shield.x + 10, shield.y + shield.height - 10);
            ctx.lineTo(shield.x + shield.width - 10, shield.y + shield.height - 10);
            ctx.lineTo(shield.x + shield.width, shield.y + shield.height);
            ctx.lineTo(shield.x + shield.width, shield.y + 20);
            ctx.lineTo(shield.x + shield.width - 10, shield.y + 10);
            ctx.lineTo(shield.x + 10, shield.y + 10);
            ctx.lineTo(shield.x, shield.y + 20);
            ctx.closePath();
            ctx.fill();
        }
    },

    drawUFO() {
        if (!GameState.ufo) return;
        
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.ellipse(GameState.ufo.x + GameState.ufo.width / 2, 
                    GameState.ufo.y + GameState.ufo.height / 2,
                    GameState.ufo.width / 2, GameState.ufo.height / 2, 
                    0, 0, Math.PI * 2);
        ctx.fill();
        
        // Detalles
        ctx.fillStyle = '#ff6600';
        ctx.fillRect(GameState.ufo.x + 10, GameState.ufo.y + 5, 
                     GameState.ufo.width - 20, 5);
        ctx.fillRect(GameState.ufo.x + 15, GameState.ufo.y + GameState.ufo.height - 10, 
                     GameState.ufo.width - 30, 5);
    },

    drawUI() {
        ctx.fillStyle = '#00ffff';
        ctx.font = '16px "Courier New"';
        ctx.fillText(`NIVEL: ${GameState.level}`, 10, 25);
        
        if (GameState.paused) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, DOM.canvas.width, DOM.canvas.height);
            
            ctx.fillStyle = '#00ff00';
            ctx.font = '48px "Courier New"';
            ctx.textAlign = 'center';
            ctx.fillText('PAUSA', DOM.canvas.width / 2, DOM.canvas.height / 2);
            ctx.font = '16px "Courier New"';
            ctx.fillText('Presiona P o ESC para continuar', 
                        DOM.canvas.width / 2, DOM.canvas.height / 2 + 40);
            ctx.textAlign = 'left';
        }
    },

    render() {
        this.clear();
        this.drawPlayer();
        this.drawInvaders();
        this.drawProjectiles();
        this.drawShields();
        this.drawUFO();
        this.drawUI();
    }
};

// ===== CONTROL DEL JUEGO =====
const Game = {
    init() {
        GameState.reset();
        GameState.invaders = EntityFactory.createInvaders();
        GameState.shields = EntityFactory.createShields();
        
        UI.updateScore();
        UI.updateLives();
        UI.hideScreens();
        
        this.start();
    },

    start() {
        GameState.active = true;
        this.loop();
        this.inputLoop();
    },

    togglePause() {
        if (!GameState.active) return;
        GameState.paused = !GameState.paused;
    },

    update() {
        if (!GameState.active || GameState.paused) return;
        
        EnemyController.move();
        EnemyController.shoot();
        ProjectileSystem.update();
        UFOController.update();
        CollisionSystem.checkAll();
    },

    loop() {
        this.update();
        Renderer.render();
        
        if (GameState.active) {
            GameState.animationId = requestAnimationFrame(() => this.loop());
        }
    },

    inputLoop() {
        if (!GameState.active) return;
        PlayerController.handleMovement();
        GameState.inputAnimationId = requestAnimationFrame(() => this.inputLoop());
    },

    nextLevel() {
        GameState.level++;
        
        // Mostrar pantalla de nivel completado
        UI.showLevelComplete();
        
        // Pausar el juego temporalmente
        GameState.paused = true;
        
        setTimeout(() => {
            // Limpiar proyectiles
            GameState.playerProjectiles = [];
            GameState.enemyProjectiles = [];
            
            // Reparar escudos
            for (const shield of GameState.shields) {
                shield.health = CONFIG.SHIELD.MAX_HEALTH;
            }
            
            // Crear nueva oleada
            GameState.invaders = EntityFactory.createInvaders();
            GameState.enemySpeed = CONFIG.ENEMY.BASE_SPEED + GameState.level * 0.3;
            
            // Reanudar el juego
            GameState.paused = false;
        }, 2500);
    },

    over() {
        GameState.active = false;
        cancelAnimationFrame(GameState.animationId);
        cancelAnimationFrame(GameState.inputAnimationId);
        UI.showGameOver();
    }
};

// ===== INICIALIZACIÓN =====
PlayerController.init();

DOM.startBtn.addEventListener('click', () => {
    cancelAnimationFrame(GameState.inputAnimationId);
    Game.init();
});

DOM.restartBtn.addEventListener('click', () => {
    cancelAnimationFrame(GameState.inputAnimationId);
    Game.init();
});

// Inicializar UI
UI.updateLives();