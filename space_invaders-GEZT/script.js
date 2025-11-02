// ===== VALIDACIÓN DEL DOM =====
/**
 * Obtiene un elemento del DOM y valida su existencia
 * @param {string} id - ID del elemento
 * @returns {HTMLElement} El elemento encontrado
 * @throws {Error} Si el elemento no existe
 */
const getElement = (id) => {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Elemento con id '${id}' no encontrado`);
    return el;
};

// ===== DECLARACIÓN DE VARIABLES GLOBALES =====
const canvas = getElement('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = getElement('startScreen');
const gameOverScreen = getElement('gameOverScreen');
const startBtn = getElement('startBtn');
const restartBtn = getElement('restartBtn');
const scoreDisplay = getElement('score');
const livesDisplay = getElement('lives');
const finalScoreDisplay = getElement('finalScore');

// Variables del juego
let gameActive = false;
let score = 0;
let lives = 3;
let animationId;
let inputAnimationId;
let invaders = [];
let playerProjectiles = [];
let enemyProjectiles = [];
let shields = [];
let ufo = null;
let lastUfoTime = 0;
let lastEnemyShotTime = 0;
let enemyDirection = 1; // 1 = derecha, -1 = izquierda
let enemyDropDown = false;
let enemySpeed = 1;
let level = 1;
let aliveInvadersCount = 0; // MEJORA: Cachear contador

// ===== CONFIGURACIONES DEL JUEGO =====
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 20;
const PLAYER_SPEED = 5;
const PROJECTILE_SPEED = 7;
const ENEMY_ROWS = 5;
const ENEMY_COLS = 10;
const ENEMY_WIDTH = 40;
const ENEMY_HEIGHT = 30;
const ENEMY_GAP = 10;
const SHIELD_WIDTH = 80;
const SHIELD_HEIGHT = 40;
const UFO_WIDTH = 60;
const UFO_HEIGHT = 30;
const UFO_SPEED = 2;
const MAX_PLAYER_PROJECTILES = 3; // MEJORA: Permitir múltiples proyectiles
const UFO_APPEARANCE_INTERVAL = 5000; // MEJORA: Aumentado a 5 segundos
const UFO_APPEARANCE_CHANCE = 0.05; // MEJORA: Aumentado a 0.05 (5%)

// Posición inicial del jugador
let player = {
    x: canvas.width / 2 - PLAYER_WIDTH / 2,
    y: canvas.height - 40,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    speed: PLAYER_SPEED
};

// ===== INICIALIZACIÓN DEL JUEGO =====
/**
 * Inicializa el juego con todas las variables reiniciadas
 */
function initGame() {
    // Reiniciar variables del juego
    gameActive = true;
    score = 0;
    lives = 3;
    level = 1;
    enemyDirection = 1;
    enemySpeed = 1;
    updateScore();
    updateLives();

    // Limpiar arrays
    invaders = [];
    playerProjectiles = [];
    enemyProjectiles = [];
    shields = [];
    ufo = null;

    // Crear invasores
    createInvaders();

    // Crear escudos
    createShields();

    // Ocultar pantallas
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';

    // Iniciar bucle del juego
    gameLoop();
}

// ===== CREACIÓN DE ELEMENTOS DEL JUEGO =====

/**
 * Crea invasores en formación
 */
function createInvaders() {
    for (let row = 0; row < ENEMY_ROWS; row++) {
        for (let col = 0; col < ENEMY_COLS; col++) {
            invaders.push({
                x: col * (ENEMY_WIDTH + ENEMY_GAP) + 50,
                y: row * (ENEMY_HEIGHT + ENEMY_GAP) + 50,
                width: ENEMY_WIDTH,
                height: ENEMY_HEIGHT,
                alive: true,
                points: (ENEMY_ROWS - row) * 10 // Puntos según la fila
            });
        }
    }
}

/**
 * Crea escudos defensivos
 */
function createShields() {
    const shieldCount = 4;
    const shieldSpacing = canvas.width / (shieldCount + 1);

    for (let i = 1; i <= shieldCount; i++) {
        shields.push({
            x: shieldSpacing * i - SHIELD_WIDTH / 2,
            y: canvas.height - 150,
            width: SHIELD_WIDTH,
            height: SHIELD_HEIGHT,
            health: 100
        });
    }
}

/**
 * Crea una nave misteriosa (UFO)
 */
function createUFO() {
    ufo = {
        x: -UFO_WIDTH,
        y: 30,
        width: UFO_WIDTH,
        height: UFO_HEIGHT,
        speed: UFO_SPEED,
        points: Math.floor(Math.random() * 3 + 1) * 50 // 50, 100 o 150 puntos
    };
}

// ===== ACTUALIZACIÓN DE LA INTERFAZ =====

/**
 * Actualiza la puntuación en pantalla
 */
function updateScore() {
    scoreDisplay.textContent = score;
}

/**
 * Actualiza las vidas mostradas en pantalla
 */
function updateLives() {
    livesDisplay.innerHTML = '';
    for (let i = 0; i < lives; i++) {
        const lifeElement = document.createElement('div');
        lifeElement.className = 'life';
        livesDisplay.appendChild(lifeElement);
    }
}

// ===== UTILIDADES =====

/**
 * Cuenta y cachea los invasores que están vivos
 * MEJORA: Función separada para evitar calcular múltiples veces
 * @returns {number} Cantidad de invasores vivos
 */
function countAliveInvaders() {
    return invaders.filter(inv => inv.alive).length;
}

// ===== CONTROL DEL JUGADOR =====

/**
 * Mueve el jugador en una dirección con límites
 * @param {number} direction - 1 para derecha, -1 para izquierda
 */
function movePlayer(direction) {
    if (!gameActive) return;

    player.x += player.speed * direction;

    // Limitar movimiento dentro del canvas
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }
}

/**
 * Dispara un proyectil del jugador
 * MEJORA: Permite múltiples proyectiles (hasta MAX_PLAYER_PROJECTILES)
 */
function playerShoot() {
    if (!gameActive || playerProjectiles.length >= MAX_PLAYER_PROJECTILES) return;

    playerProjectiles.push({
        x: player.x + player.width / 2 - 2,
        y: player.y,
        width: 4,
        height: 10,
        speed: -PROJECTILE_SPEED // Hacia arriba
    });
}

// ===== MOVIMIENTO Y COMPORTAMIENTO DE ENEMIGOS =====

/**
 * Mueve los invasores y verifica si han llegado al fondo
 */
function moveInvaders() {
    let moveDown = false;
    const margin = 20; // Margen para evitar que toquen los bordes

    // Verificar si algún invasor ha llegado al borde
    for (const invader of invaders) {
        if (!invader.alive) continue;

        // Añadimos márgenes para que no toquen exactamente los bordes
        if ((invader.x + invader.width >= canvas.width - margin && enemyDirection === 1) ||
            (invader.x <= margin && enemyDirection === -1)) {
            moveDown = true;
            break;
        }
    }

    // Cambiar dirección antes de mover
    if (moveDown) {
        enemyDirection *= -1;
    }

    // Mover invasores
    let lowestInvaderY = 0;
    for (const invader of invaders) {
        if (!invader.alive) continue;

        if (moveDown) {
            invader.y += 15; // Movimiento fijo hacia abajo
        }
        invader.x += enemySpeed * enemyDirection;

        // Registrar la posición Y más baja
        if (invader.y + invader.height > lowestInvaderY) {
            lowestInvaderY = invader.y + invader.height;
        }
    }

    // Verificar game over solo una vez por frame, usando la posición más baja
    if (lowestInvaderY >= player.y - 80) { // Aumentado el margen de seguridad
        gameOver();
        return;
    }
}

/**
 * Enemigos disparan aleatoriamente
 */
function enemyShoot() {
    if (!gameActive || invaders.length === 0) return;

    const currentTime = Date.now();
    if (currentTime - lastEnemyShotTime < 1000) return; // Disparar cada segundo

    // Seleccionar un invasor aleatorio vivo
    const aliveInvaders = invaders.filter(inv => inv.alive);
    if (aliveInvaders.length === 0) return;

    const shooter = aliveInvaders[Math.floor(Math.random() * aliveInvaders.length)];

    enemyProjectiles.push({
        x: shooter.x + shooter.width / 2 - 2,
        y: shooter.y + shooter.height,
        width: 4,
        height: 10,
        speed: PROJECTILE_SPEED // Hacia abajo
    });

    lastEnemyShotTime = currentTime;
}

// ===== DETECCIÓN DE COLISIONES =====

/**
 * Verifica colisión AABB (Axis-Aligned Bounding Box) entre dos rectángulos
 * @param {Object} rect1 - Primer rectángulo
 * @param {Object} rect2 - Segundo rectángulo
 * @returns {boolean} true si hay colisión
 */
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y;
}

/**
 * Verifica todas las colisiones de proyectiles
 */
function checkProjectileCollisions() {
    // Proyectiles del jugador vs invasores
    for (let i = playerProjectiles.length - 1; i >= 0; i--) {
        const projectile = playerProjectiles[i];
        
        // Verificar si el proyectil es indefinido
        if (!projectile) {
            console.warn('Proyectil indefinido encontrado en el índice', i, 'de playerProjectiles');
            playerProjectiles.splice(i, 1);
            continue;
        }

        // Colisión con invasores
        for (let j = invaders.length - 1; j >= 0; j--) {
            const invader = invaders[j];
            
            // Verificar si el invasor es indefinido
            if (!invader) {
                console.warn('Invasor indefinido encontrado en el índice', j, 'de invaders');
                continue;
            }
            
            if (invader.alive && checkCollision(projectile, invader)) {
                // Eliminar proyectil e invasor
                playerProjectiles.splice(i, 1);
                invader.alive = false;

                // Aumentar puntuación
                score += invader.points;
                updateScore();

                // MEJORA: Recalcular contador en lugar de decrementarlo (más seguro)
                aliveInvadersCount = countAliveInvaders();

                // Aumentar velocidad de invasores según cuántos quedan, pero con un límite más bajo
                enemySpeed = 1 + (1 - aliveInvadersCount / (ENEMY_ROWS * ENEMY_COLS)) * 1.5;

                // Verificar si todos los invasores fueron eliminados
                if (aliveInvadersCount === 0) {
                    nextLevel();
                }

                break;
            }
        }

        // Colisión con OVNI
        if (ufo && projectile && checkCollision(projectile, ufo)) {
            playerProjectiles.splice(i, 1);
            score += ufo.points;
            updateScore();
            ufo = null;
            break; // Salir del bucle después de destruir el OVNI
        }

        // Colisión con escudos
        for (const shield of shields) {
            if (shield && shield.health > 0 && checkCollision(projectile, shield)) {
                playerProjectiles.splice(i, 1);
                shield.health -= 25;
                break;
            }
        }
    }

    // Proyectiles enemigos vs jugador
    for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
        const projectile = enemyProjectiles[i];
        
        // Verificar si el proyectil es indefinido
        if (!projectile) {
            console.warn('Proyectil enemigo indefinido encontrado en el índice', i, 'de enemyProjectiles');
            enemyProjectiles.splice(i, 1);
            continue;
        }

        // Colisión con jugador
        if (player && checkCollision(projectile, player)) {
            enemyProjectiles.splice(i, 1);
            loseLife();
            break;
        }

        // Colisión con escudos
        for (const shield of shields) {
            if (shield && shield.health > 0 && checkCollision(projectile, shield)) {
                enemyProjectiles.splice(i, 1);
                shield.health -= 25;
                break;
            }
        }
    }
}

// ===== GESTIÓN DE VIDAS Y NIVELES =====

/**
 * Pierde una vida y verifica si es game over
 */
function loseLife() {
    lives--;
    updateLives();

    if (lives <= 0) {
        gameOver();
    }
}

/**
 * Pasa al siguiente nivel
 */
function nextLevel() {
    level++;

    // Limpiar proyectiles
    playerProjectiles = [];
    enemyProjectiles = [];

    // Reparar escudos
    for (const shield of shields) {
        shield.health = 100;
    }

    // Crear nueva oleada de invasores más cerca y más rápidos
    createInvaders();
    aliveInvadersCount = invaders.length; // MEJORA: Actualizar contador
    enemySpeed = 1 + level * 0.5;
}

// ===== FINALIZACIÓN DEL JUEGO =====

/**
 * Finaliza el juego y muestra pantalla de game over
 * MEJORA: Cancela ambos bucles de animación
 */
function gameOver() {
    gameActive = false;
    cancelAnimationFrame(animationId);
    cancelAnimationFrame(inputAnimationId); // MEJORA: Cancelar input loop

    finalScoreDisplay.textContent = `Tu puntuación: ${score}`;
    gameOverScreen.style.display = 'flex';
}

// ===== BUCLE PRINCIPAL DEL JUEGO =====

/**
 * Actualiza el estado del juego
 */
function update() {
    if (!gameActive) return;

    // Mover invasores
    moveInvaders();

    // Disparo enemigo
    enemyShoot();

    // Mover proyectiles
    moveProjectiles();

    // Mover OVNI
    moveUFO();

    // Verificar colisiones
    checkProjectileCollisions();
}

/**
 * Mueve los proyectiles y los elimina si salen de pantalla
 */
function moveProjectiles() {
    // Proyectiles del jugador
    for (let i = playerProjectiles.length - 1; i >= 0; i--) {
        playerProjectiles[i].y += playerProjectiles[i].speed;

        // Eliminar si sale de la pantalla
        if (playerProjectiles[i].y < 0) {
            playerProjectiles.splice(i, 1);
        }
    }

    // Proyectiles enemigos
    for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
        enemyProjectiles[i].y += enemyProjectiles[i].speed;

        // Eliminar si sale de la pantalla
        if (enemyProjectiles[i].y > canvas.height) {
            enemyProjectiles.splice(i, 1);
        }
    }
}

/**
 * Mueve el UFO y lo crea aleatoriamente
 * MEJORA: Mayor probabilidad y frecuencia
 */
function moveUFO() {
    const currentTime = Date.now();

    // Crear UFO aleatoriamente con mayor frecuencia
    if (!ufo && currentTime - lastUfoTime > UFO_APPEARANCE_INTERVAL &&
        Math.random() < UFO_APPEARANCE_CHANCE) {
        createUFO();
        lastUfoTime = currentTime;
        return; // Salir temprano si acabamos de crear un nuevo OVNI
    }

    // Mover UFO si existe
    if (ufo) {
        ufo.x += ufo.speed;

        // Eliminar si sale de la pantalla
        if (ufo.x > canvas.width) {
            ufo = null;
            return; // Salir después de eliminar el OVNI
        }
    }
}

/**
 * Dibuja todos los elementos en el canvas
 */
function draw() {
    // Limpiar canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar jugador
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Dibujar base del jugador
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(player.x + player.width, player.y);
    ctx.lineTo(player.x + player.width / 2, player.y - 15);
    ctx.closePath();
    ctx.fill();

    // Dibujar invasores
    for (const invader of invaders) {
        if (!invader.alive) continue;

        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(invader.x, invader.y, invader.width, invader.height);

        // Detalles del invasor
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(invader.x + 5, invader.y + 5, invader.width - 10, 5);
        ctx.fillRect(invader.x + 5, invader.y + invader.height - 10, invader.width - 10, 5);
        ctx.fillRect(invader.x + 15, invader.y + 10, 10, invader.height - 20);
    }

    // Dibujar proyectiles del jugador
    ctx.fillStyle = '#00ff00';
    for (const projectile of playerProjectiles) {
        ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
    }

    // Dibujar proyectiles enemigos
    ctx.fillStyle = '#ff0000';
    for (const projectile of enemyProjectiles) {
        ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
    }

    // Dibujar escudos
    for (const shield of shields) {
        if (shield.health > 0) {
            // Escudo con degradado según salud
            const greenValue = Math.floor(255 * (shield.health / 100));
            ctx.fillStyle = `rgb(0, ${greenValue}, 0)`;

            // Dibujar escudo con forma irregular
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
    }

    // Dibujar OVNI
    if (ufo) {
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.ellipse(ufo.x + ufo.width / 2, ufo.y + ufo.height / 2,
            ufo.width / 2, ufo.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Detalles del OVNI
        ctx.fillStyle = '#ff6600';
        ctx.fillRect(ufo.x + 10, ufo.y + 5, ufo.width - 20, 5);
        ctx.fillRect(ufo.x + 15, ufo.y + ufo.height - 10, ufo.width - 30, 5);
    }

    // Dibujar información del nivel
    ctx.fillStyle = '#00ffff';
    ctx.font = '16px "Courier New"';
    ctx.fillText(`NIVEL: ${level}`, 10, 25);
}

/**
 * Bucle principal del juego
 */
function gameLoop() {
    update();
    draw();

    if (gameActive) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

// ===== CONTROL DE TECLADO =====

// Estado de teclas presionadas
const keys = {};

/**
 * Maneja las teclas presionadas
 */
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    // Disparar con espacio
    if (e.key === ' ' && gameActive) {
        playerShoot();
        e.preventDefault(); // Evitar scroll con espacio
    }
});

/**
 * Maneja las teclas liberadas
 */
window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

/**
 * Actualiza el movimiento del jugador según teclas presionadas
 */
function handlePlayerMovement() {
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        movePlayer(-1);
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        movePlayer(1);
    }
}

/**
 * Bucle para el movimiento continuo del jugador
 * MEJORA: Ahora respeta gameActive y se cancela correctamente
 */
function inputLoop() {
    if (!gameActive) return;
    handlePlayerMovement();
    inputAnimationId = requestAnimationFrame(inputLoop);
}

// ===== INICIALIZACIÓN Y EVENTOS =====

/**
 * Iniciar juego al hacer clic en el botón
 */
startBtn.addEventListener('click', () => {
    cancelAnimationFrame(inputAnimationId); // MEJORA: Cancelar anterior
    initGame();
    inputLoop();
});

/**
 * Reiniciar juego
 */
restartBtn.addEventListener('click', () => {
    cancelAnimationFrame(inputAnimationId); // MEJORA: Cancelar anterior
    initGame();
    inputLoop();
});

/**
 * Inicializar vidas al cargar la página
 */
updateLives();
