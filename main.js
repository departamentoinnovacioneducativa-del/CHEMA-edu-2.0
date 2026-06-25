/* =============================================================
   EDU CHEMA 2.o — Módulo Principal (ES6)
   =============================================================
   Estructura preparada para importar módulos futuros:
     import { playFireworks } from './main.js';
     import { initRuleta }   from './ruleta.js';
   ============================================================= */

// ============================================================
// 1. ESTADO GLOBAL DE LA APLICACIÓN
// ============================================================

const state = {
    soundEnabled: true,
    activeTool: null,
    particles: [],
    rockets: [],
    animRunning: false,
    animFrameId: null,
    screenShake: { intensity: 0, decay: 0.88 }
};


// ============================================================
// 2. CANVAS FX — Configuración y clase Partícula
// ============================================================

const canvas = document.getElementById('fx-canvas');
const ctx = canvas.getContext('2d');

/** Ajusta el canvas al tamaño de la ventana */
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Mantener estilo pixelado en el contexto
    ctx.imageSmoothingEnabled = false;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();


/**
 * Clase Partícula — Unidad básica del sistema de efectos.
 * Soporta forma circular (fuegos artificiales) y cuadrada (explosión pixelada).
 */
class Particle {
    constructor(opts = {}) {
        this.x = opts.x ?? 0;
        this.y = opts.y ?? 0;
        this.vx = opts.vx ?? 0;
        this.vy = opts.vy ?? 0;
        this.size = opts.size ?? 3;
        this.color = opts.color ?? '#00cc55';
        this.alpha = opts.alpha ?? 1;
        this.life = opts.life ?? 60;
        this.maxLife = this.life;
        this.gravity = opts.gravity ?? 0.05;
        this.friction = opts.friction ?? 0.99;
        this.shape = opts.shape ?? 'circle';   // 'circle' | 'square'
        this.shrink = opts.shrink ?? true;
        this.glow = opts.glow ?? false;         // Resplandor para el núcleo
    }

    update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.alpha = Math.max(0, this.life / this.maxLife);
        if (this.shrink) {
            this.size *= 0.985;
        }
    }

    draw(c) {
        if (this.alpha <= 0.01 || this.size < 0.3) return;

        c.save();
        c.globalAlpha = this.alpha;

        // Resplandor suave para núcleos de explosión
        if (this.glow && this.size > 4) {
            c.shadowColor = this.color;
            c.shadowBlur = this.size * 2;
        }

        c.fillStyle = this.color;

        if (this.shape === 'square') {
            // Coordenadas enteras para píxeles nítidos
            const px = Math.round(this.x);
            const py = Math.round(this.y);
            const ps = Math.max(1, Math.round(this.size));
            c.fillRect(px - (ps >> 1), py - (ps >> 1), ps, ps);
        } else {
            c.beginPath();
            c.arc(this.x, this.y, Math.max(0.5, this.size), 0, Math.PI * 2);
            c.fill();
        }

        c.restore();
    }

    get isDead() {
        return this.life <= 0 || this.size < 0.3;
    }
}


// ============================================================
// 3. LOOP DE ANIMACIÓN PRINCIPAL
// ============================================================

function startLoop() {
    if (state.animRunning) return;
    state.animRunning = true;
    tick();
}

function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- Screen shake ---
    let shaking = state.screenShake.intensity > 0.5;
    if (shaking) {
        const sx = (Math.random() - 0.5) * state.screenShake.intensity;
        const sy = (Math.random() - 0.5) * state.screenShake.intensity;
        ctx.save();
        ctx.translate(sx, sy);
        state.screenShake.intensity *= state.screenShake.decay;
    }

    // --- Actualizar y dibujar partículas ---
    for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.update();
        p.draw(ctx);
        if (p.isDead) state.particles.splice(i, 1);
    }

    if (shaking) ctx.restore();

    // --- Continuar o detener ---
    const hasWork = state.particles.length > 0 || state.screenShake.intensity > 0.5;
    if (hasWork) {
        state.animFrameId = requestAnimationFrame(tick);
    } else {
        state.animRunning = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}


// ============================================================
// 4. FUEGOS ARTIFICIALES 🎆
// ============================================================

const FW_COLORS = [
    '#00ff66', '#00cc55', '#33ff99',     // Verdes
    '#ffc800', '#ffe066', '#ffdd33',     // Amarillos
    '#ff4466', '#ff6688', '#ff3355',     // Rojos/rosas
    '#44ddff', '#66eeff', '#22ccff',     // Cian/azul claro
    '#cc77ff', '#ff66dd', '#aa55ff',     // Púrpura/magenta
];

/**
 * Hace explotar un fuego artificial en las coordenadas dadas.
 * @param {number} x - Centro X
 * @param {number} y - Centro Y
 * @param {string} baseColor - Color base del fuego
 */
function explodeFirework(x, y, baseColor) {
    const count = 70 + Math.floor(Math.random() * 50);
    const altColor = FW_COLORS[Math.floor(Math.random() * FW_COLORS.length)];

    // --- Anillo principal ---
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
        const speed = 2.5 + Math.random() * 5;
        state.particles.push(new Particle({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 1.5 + Math.random() * 3,
            color: Math.random() > 0.4 ? baseColor : altColor,
            life: 45 + Math.random() * 35,
            gravity: 0.055,
            friction: 0.97,
            shape: 'circle',
            shrink: true
        }));
    }

    // --- Flash central blanco ---
    state.particles.push(new Particle({
        x, y, vx: 0, vy: 0,
        size: 25,
        color: '#ffffff',
        life: 7,
        gravity: 0, friction: 1,
        shape: 'circle', shrink: true,
        glow: true
    }));

    // --- Chispas internas finas ---
    for (let i = 0; i < 20; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 0.8 + Math.random() * 2;
        state.particles.push(new Particle({
            x, y,
            vx: Math.cos(a) * s,
            vy: Math.sin(a) * s,
            size: 1,
            color: '#ffffff',
            life: 18 + Math.random() * 12,
            gravity: 0.02, friction: 0.96,
            shape: 'circle', shrink: true
        }));
    }

    // --- Estrellas brillantes que caen lentamente (crackle) ---
    for (let i = 0; i < 12; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 1 + Math.random() * 1.5;
        state.particles.push(new Particle({
            x, y,
            vx: Math.cos(a) * s,
            vy: Math.sin(a) * s - 1,
            size: 2,
            color: '#ffffff',
            life: 60 + Math.random() * 40,
            gravity: 0.03, friction: 0.995,
            shape: 'circle', shrink: false,
            glow: true
        }));
    }
}

/**
 * Lanza un cohete desde la parte inferior que explota al llegar arriba.
 * El ascenso genera estela de chispas.
 */
function launchSingleFirework() {
    const startX = canvas.width * (0.15 + Math.random() * 0.7);
    const startY = canvas.height + 10;
    const targetY = canvas.height * (0.1 + Math.random() * 0.3);
    const color = FW_COLORS[Math.floor(Math.random() * FW_COLORS.length)];

    const distance = startY - targetY;
    const speed = 7 + Math.random() * 5;
    const totalFrames = Math.ceil(distance / speed);
    const drift = (Math.random() - 0.5) * 1.2;

    let cx = startX;
    let cy = startY;
    let frame = 0;

    function riseStep() {
        frame++;
        cx += drift;
        cy -= speed;

        // Cabeza del cohete (punto blanco brillante)
        state.particles.push(new Particle({
            x: cx, y: cy, vx: 0, vy: 0,
            size: 3, color: '#ffffff',
            life: 3, gravity: 0, friction: 1,
            shape: 'circle', shrink: false, glow: true
        }));

        // Estela de chispas
        for (let j = 0; j < 3; j++) {
            state.particles.push(new Particle({
                x: cx + (Math.random() - 0.5) * 4,
                y: cy + Math.random() * 4,
                vx: (Math.random() - 0.5) * 0.8,
                vy: 0.5 + Math.random() * 2,
                size: 1 + Math.random() * 2,
                color: Math.random() > 0.5 ? color : '#ffe066',
                life: 10 + Math.random() * 10,
                gravity: 0.015, friction: 0.98,
                shape: 'circle', shrink: true
            }));
        }

        if (frame < totalFrames) {
            setTimeout(riseStep, 16);
        } else {
            explodeFirework(cx, cy, color);
        }
    }

    riseStep();
}

/**
 * 🎆 Ejecuta una secuencia completa de fuegos artificiales.
 * Función pública exportable.
 *
 * @param {number} [count=8]    - Cantidad de cohetes a lanzar
 * @param {number} [interval=350] - Milisegundos entre cada lanzamiento
 */
export function playFireworks(count = 8, interval = 350) {
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            launchSingleFirework();
            // Doble lanzamiento aleatorio para más densidad
            if (Math.random() > 0.45) {
                setTimeout(launchSingleFirework, 80 + Math.random() * 120);
            }
        }, i * interval);
    }
    startLoop();
}


// ============================================================
// 5. EXPLOSIÓN PIXELADA 💥
// ============================================================

const EX_COLORS = [
    '#ffffff',  // Núcleo blanco
    '#ffffaa',  // Amarillo muy claro
    '#ffee44',  // Amarillo brillante
    '#ffc800',  // Amarillo
    '#ff9900',  // Naranja
    '#ff5500',  // Rojo-naranja
    '#ee2200',  // Rojo
    '#bb1100',  // Rojo oscuro
    '#771100',  // Carmesí oscuro
    '#441100',  // Brasa
    '#221100',  // Brasa apagada
];

/**
 * Genera una explosión individual de píxeles en un punto.
 * @param {number} cx - Centro X
 * @param {number} cy - Centro Y
 * @param {number} [power=1] - Multiplicador de intensidad (0-1)
 */
function pixelBurst(cx, cy, power = 1) {
    const p = Math.max(0.3, power);

    // --- Flash central ciego ---
    state.particles.push(new Particle({
        x: cx, y: cy, vx: 0, vy: 0,
        size: 50 * p,
        color: '#ffffff',
        life: 5, gravity: 0, friction: 1,
        shape: 'square', shrink: true, glow: true
    }));

    // --- Escombros grandes (píxeles gordos) ---
    const bigCount = Math.floor(25 * p);
    for (let i = 0; i < bigCount; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = (1 + Math.random() * 3.5) * p;
        const ci = Math.floor(Math.random() * 4); // Blancos-amarillos
        state.particles.push(new Particle({
            x: cx + (Math.random() - 0.5) * 12,
            y: cy + (Math.random() - 0.5) * 12,
            vx: Math.cos(a) * s, vy: Math.sin(a) * s,
            size: Math.round(4 + Math.random() * 8),
            color: EX_COLORS[ci],
            life: 18 + Math.random() * 18,
            gravity: 0.16, friction: 0.94,
            shape: 'square', shrink: false
        }));
    }

    // --- Escombros medianos ---
    const medCount = Math.floor(50 * p);
    for (let i = 0; i < medCount; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = (2.5 + Math.random() * 6) * p;
        const ci = 3 + Math.floor(Math.random() * 4); // Amarillos-rojos
        state.particles.push(new Particle({
            x: cx + (Math.random() - 0.5) * 8,
            y: cy + (Math.random() - 0.5) * 8,
            vx: Math.cos(a) * s, vy: Math.sin(a) * s,
            size: Math.round(2 + Math.random() * 4),
            color: EX_COLORS[ci],
            life: 28 + Math.random() * 22,
            gravity: 0.11, friction: 0.96,
            shape: 'square', shrink: false
        }));
    }

    // --- Chispas finas ---
    const sparkCount = Math.floor(80 * p);
    for (let i = 0; i < sparkCount; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = (3.5 + Math.random() * 9) * p;
        const ci = 5 + Math.floor(Math.random() * 4); // Rojos-brasas
        state.particles.push(new Particle({
            x: cx + (Math.random() - 0.5) * 6,
            y: cy + (Math.random() - 0.5) * 6,
            vx: Math.cos(a) * s, vy: Math.sin(a) * s,
            size: Math.round(1 + Math.random() * 2),
            color: EX_COLORS[ci],
            life: 22 + Math.random() * 30,
            gravity: 0.08, friction: 0.97,
            shape: 'square', shrink: false
        }));
    }

    // --- Brasas flotantes (ascienden lentamente) ---
    const emberCount = Math.floor(22 * p);
    for (let i = 0; i < emberCount; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = (0.4 + Math.random() * 2) * p;
        state.particles.push(new Particle({
            x: cx + (Math.random() - 0.5) * 30,
            y: cy + (Math.random() - 0.5) * 30,
            vx: Math.cos(a) * s,
            vy: Math.sin(a) * s - (0.5 + Math.random() * 1.5),
            size: Math.round(1 + Math.random() * 3),
            color: EX_COLORS[8 + Math.floor(Math.random() * 3)],
            life: 55 + Math.random() * 55,
            gravity: -0.025,  // Flotan hacia arriba
            friction: 0.992,
            shape: 'square', shrink: false
        }));
    }

    // --- Humo pixelado (aparece con retraso) ---
    setTimeout(() => {
        for (let i = 0; i < Math.floor(18 * p); i++) {
            const a = Math.random() * Math.PI * 2;
            const s = (0.3 + Math.random() * 1.5) * p;
            state.particles.push(new Particle({
                x: cx + (Math.random() - 0.5) * 40,
                y: cy + (Math.random() - 0.5) * 20,
                vx: Math.cos(a) * s,
                vy: Math.sin(a) * s - Math.random() * 1.2,
                size: Math.round(3 + Math.random() * 7),
                color: '#0d1530',
                life: 35 + Math.random() * 30,
                gravity: -0.035, friction: 0.993,
                shape: 'square', shrink: true
            }));
        }
    }, 120);
}

/**
 * 💥 Ejecuta una explosión pixelada contundente con screen shake.
 * Función pública exportable.
 *
 * @param {number} [x] - Coordenada X (por defecto: centro del canvas)
 * @param {number} [y] - Coordenada Y (por defecto: centro del canvas)
 */
export function playExplosion(x, y) {
    const cx = x ?? canvas.width / 2;
    const cy = y ?? canvas.height / 2;

    // --- Explosión principal ---
    state.screenShake.intensity = 22;
    pixelBurst(cx, cy, 1);

    // --- Explosión secundaria (desplazada, menor) ---
    setTimeout(() => {
        const offset = 35 + Math.random() * 45;
        const a = Math.random() * Math.PI * 2;
        state.screenShake.intensity = 12;
        pixelBurst(cx + Math.cos(a) * offset, cy + Math.sin(a) * offset, 0.6);
    }, 140);

    // --- Explosión terciaria (lejos, pequeña) ---
    setTimeout(() => {
        const offset = 55 + Math.random() * 35;
        const a = Math.random() * Math.PI * 2;
        state.screenShake.intensity = 6;
        pixelBurst(cx + Math.cos(a) * offset, cy + Math.sin(a) * offset, 0.35);
    }, 280);

    startLoop();
}


// ============================================================
// 6. NAVEGACIÓN — Dropdowns del header
// ============================================================

function initDropdowns() {
    const dropdowns = document.querySelectorAll('[data-dropdown]');

    dropdowns.forEach(dd => {
        const trigger = dd.querySelector('.nav-dropdown__trigger');
        if (!trigger) return;

        const toggle = () => {
            const isOpen = dd.hasAttribute('data-open');
            closeAllDropdowns();
            if (!isOpen) {
                dd.setAttribute('data-open', '');
                trigger.setAttribute('aria-expanded', 'true');
            }
        };

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            toggle();
        });

        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                toggle();
                // Enfocar primer item
                const firstItem = dd.querySelector('.nav-dropdown__item');
                if (firstItem) firstItem.focus();
            } else if (e.key === 'Escape') {
                closeAllDropdowns();
                trigger.focus();
            }
        });

        // Navegación con flechas dentro del menú
        const items = dd.querySelectorAll('.nav-dropdown__item');
        items.forEach((item, idx) => {
            item.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const next = items[idx + 1] || items[0];
                    next.focus();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prev = items[idx - 1] || items[items.length - 1];
                    prev.focus();
                } else if (e.key === 'Escape') {
                    closeAllDropdowns();
                    trigger.focus();
                }
            });
        });
    });

    // Cerrar al hacer click fuera
    document.addEventListener('click', closeAllDropdowns);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllDropdowns();
    });
}

function closeAllDropdowns() {
    document.querySelectorAll('[data-dropdown][data-open]').forEach(dd => {
        dd.removeAttribute('data-open');
        const t = dd.querySelector('.nav-dropdown__trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
    });
}


// ============================================================
// 7. GESTIÓN DE HERRAMIENTAS — Carga dinámica
// ============================================================

/** Metadatos de cada herramienta */
const TOOLS = {
    'cronometro':       { title: '⏲️ Cronómetro',         file: 'cronometro' },
    'pomodoro':         { title: '🍅 Pomodoro',            file: 'pomodoro' },
    'ruleta':           { title: '🎡 Ruleta',              file: 'ruleta' },
    'papa-caliente':    { title: '💣 Papa Caliente',       file: 'papaCaliente' },
    'votacion':         { title: '👍 Votación',             file: 'votacion' },
    'preguntas-equipo': { title: '❓ Preguntas por Equipo', file: 'preguntasEquipo' },
};

function initToolSelection() {
    // Evento delegado: funciona tanto para items de dropdown como para tarjetas
    document.addEventListener('click', (e) => {
        const el = e.target.closest('[data-tool]');
        if (!el) return;
        loadTool(el.getAttribute('data-tool'));
        closeAllDropdowns();
    });

    // Soporte teclado para tarjetas
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            const card = e.target.closest('.tool-card[data-tool]');
            if (card) {
                e.preventDefault();
                loadTool(card.getAttribute('data-tool'));
            }
        }
    });

    // Botón cerrar dentro del panel
    document.addEventListener('click', (e) => {
        if (e.target.closest('.tool-panel__close')) {
            closeToolPanel();
        }
    });
}

function loadTool(toolName) {
    const panel = document.getElementById('tool-panel');

    // Toggle: si es la misma herramienta, cerrar
    if (state.activeTool === toolName) {
        closeToolPanel();
        return;
    }

    state.activeTool = toolName;
    const meta = TOOLS[toolName] || { title: `🔧 ${toolName}`, file: toolName };

    // HTML placeholder (se reemplazará cuando exista el módulo real)
    panel.innerHTML = `
        <button class="tool-panel__close" aria-label="Cerrar herramienta">✕ CERRAR</button>
        <h3 class="section-title">${meta.title}</h3>
        <div class="tool-placeholder">
            <p style="
                font-size: var(--fs-xl);
                color: var(--color-text-muted);
                text-align: center;
                padding: var(--space-2xl) var(--space-md);
                line-height: 1.8;
            ">
                Cargando módulo:
                <strong style="color: var(--color-green-light);">${meta.file}.js</strong>
                <br><br>
                <span style="font-size: var(--fs-md); opacity: 0.7;">
                    Este espacio será reemplazado por la interfaz de la herramienta.
                </span>
            </p>
        </div>
    `;

    panel.classList.add('is-active');
    panel.style.position = 'relative';
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Intentar importar el módulo de forma dinámica
    dynamicImport(meta.file);
}

function closeToolPanel() {
    const panel = document.getElementById('tool-panel');
    panel.classList.remove('is-active');
    panel.innerHTML = '';
    state.activeTool = null;
}

/**
 * Importa un módulo de herramienta de forma dinámica.
 * Si el archivo no existe aún, simplemente lo ignora (esperado durante el desarrollo).
 */
async function dynamicImport(moduleName) {
    try {
        const mod = await import(`./${moduleName}.js`);
        if (typeof mod.init === 'function') {
            mod.init(document.getElementById('tool-panel'));
            console.log(`%c✅ ${moduleName}.js cargado`, 'color: #00cc55');
        }
    } catch {
        // Módulo no existe aún — comportamiento esperado
        console.log(`%c⏳ ${moduleName}.js pendiente`, 'color: #ffc800');
    }
}


// ============================================================
// 8. SONIDO — Toggle básico de UI
// ============================================================

function initSoundToggle() {
    const btn = document.getElementById('btn-sound-toggle');
    if (!btn) return;

    btn.addEventListener('click', () => {
        state.soundEnabled = !state.soundEnabled;
        btn.textContent = state.soundEnabled ? '🔊' : '🔇';
        btn.title = state.soundEnabled ? 'Sonido ON' : 'Sonido OFF';
    });
}


// ============================================================
// 9. BOTONES DE PRUEBA FX (temporales)
// ============================================================

function initFXTestButtons() {
    const btnFW = document.getElementById('btn-test-fireworks');
    const btnEX = document.getElementById('btn-test-explosion');

    if (btnFW) {
        btnFW.addEventListener('click', () => {
            console.log('🎆 Fuegos artificiales de prueba');
            playFireworks(8, 350);
        });
    }

    if (btnEX) {
        btnEX.addEventListener('click', () => {
            console.log('💥 Explosión de prueba');
            playExplosion();
        });
    }
}


// ============================================================
// 10. INICIALIZACIÓN
// ============================================================

function init() {
    console.log(
        '%c🎮 Edu Chema 2.o — Dashboard cargado',
        'color: #00cc55; font-size: 16px; font-weight: bold; font-family: monospace;'
    );
    console.log(
        '%cMódulo principal listo. Esperando herramientas...',
        'color: #8a9bc0; font-size: 12px; font-family: monospace;'
    );

    initDropdowns();
    initToolSelection();
    initSoundToggle();
    initFXTestButtons();
}

// Ejecutar al cargar el DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
