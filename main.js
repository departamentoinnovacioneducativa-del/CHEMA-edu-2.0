// ============================================================
// EDU CHEMA 2.0 — LÓGICA PRINCIPAL CON SONIDO RETRO SINTETIZADO
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. SELECCIÓN DE ELEMENTOS DEL DOM ---
    const mainNav = document.getElementById('main-nav');
    const toolPanel = document.getElementById('tool-panel');
    const btnSoundToggle = document.getElementById('btn-sound-toggle');
    const btnTestFireworks = document.getElementById('btn-test-fireworks');
    const btnTestExplosion = document.getElementById('btn-test-explosion');
    const fxCanvas = document.getElementById('fx-canvas');
    const ctx = fxCanvas.getContext('2d');

    // --- 2. MOTOR DE SONIDO RETRO (Web Audio API) ---
    let audioCtx;
    let isSoundOn = true;

    // Inicializar el contexto de audio (Debe hacerse por interacción del usuario)
    const initAudio = () => {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.state === 'suspended' && audioCtx.resume();
        }
    };

    // Función genérica para tocar notas retro
    const playNote = (frequency, duration, type = 'square', volume = 0.1) => {
        if (!isSoundOn || !audioCtx) return;
        
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = type; // 'square', 'sine', 'sawto', 'triangle' (square es muy 8-bit)
        osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
        
        gain.gain.setValueAtTime(volume, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + duration);
    };

    // Efectos de sonido específicos
    const sfx = {
        click: () => playNote(800, 0.05, 'square', 0.08), // Pitido corto
        open: () => { // Barrido ascendente
            playNote(300, 0.1); 
            setTimeout(() => playNote(500, 0.1), 50);
        },
        close: () => { // Barrido descendente
            playNote(500, 0.1); 
            setTimeout(() => playNote(300, 0.1), 50);
        },
        success: () => { // Fanfarria de 3 notas
            playNote(523, 0.1); 
            setTimeout(() => playNote(659, 0.1), 100);
            setTimeout(() => playNote(784, 0.15), 200);
        },
        explosion: () => { // Ruido blanco rápido / Bajo grave
            playNote(80, 0.3, 'sawtooth', 0.2);
            playNote(60, 0.4, 'square', 0.15);
        },
        fireworks: () => { // Chispeo agudo
            playNote(1200, 0.05, 'sine', 0.05);
            setTimeout(() => playNote(1500, 0.05, 'sine', 0.05), 50);
            setTimeout(() => playNote(1800, 0.05, 'sine', 0.05), 100);
        }
    };

    // Botón de Sound Toggle
    btnSoundToggle.addEventListener('click', () => {
        initAudio(); // Nos aseguramos de inicializar el audio aquí
        isSoundOn = !isSoundOn;
        btnSoundToggle.textContent = isSoundOn ? '🔊' : '🔇';
        btnSoundToggle.setAttribute('aria-label', isSoundOn ? 'Sonido activado' : 'Sonido desactivado');
        if (isSoundOn) sfx.click(); // Sonido para confirmar que se activó
    });


    // --- 3. LÓGICA DE NAVEGACIÓN (DROPDOWNS) ---
    const closeAllDropdowns = () => {
        document.querySelectorAll('.nav-dropdown.is-open').forEach(dd => {
            dd.classList.remove('is-open');
            dd.querySelector('.nav-dropdown__trigger').setAttribute('aria-expanded', 'false');
        });
    };

    mainNav.addEventListener('click', (e) => {
        const trigger = e.target.closest('.nav-dropdown__trigger');
        const item = e.target.closest('.nav-dropdown__item');

        if (trigger) {
            initAudio(); // Iniciar audio en la primera interacción
            const dropdown = trigger.closest('.nav-dropdown');
            const isOpen = dropdown.classList.contains('is-open');
            
            closeAllDropdowns();
            
            if (!isOpen) {
                dropdown.classList.add('is-open');
                trigger.setAttribute('aria-expanded', 'true');
                sfx.open();
            } else {
                sfx.close();
            }
            return;
        }

        if (item) {
            initAudio();
            closeAllDropdowns();
            const toolId = item.dataset.tool;
            if (toolId) {
                sfx.click();
                loadTool(toolId);
            }
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#main-nav')) closeAllDropdowns();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllDropdowns();
    });


    // --- 4. SISTEMA DE CARGA DE HERRAMIENTAS ---
    document.querySelectorAll('.tool-card[data-tool]').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            initAudio(); // Iniciar audio en la primera interacción
            sfx.click();
            loadTool(card.dataset.tool);
        });
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                initAudio();
                sfx.click();
                loadTool(card.dataset.tool);
            }
        });
    });

    const loadTool = (toolId) => {
        const toolName = toolId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        
        toolPanel.innerHTML = `
            <div class="tool-loaded">
                <div class="tool-loaded__header">
                    <h3 class="section-title">🛠️ ${toolName}</h3>
                    <button class="btn-retro btn-yellow btn-close-tool" data-action="close">CERRAR ✖</button>
                </div>
                <div class="tool-loaded__body">
                    <p>¡Aquí se cargará la interfaz dinámica de <strong>${toolName}</strong>!</p>
                    <p>Pronto podrás interactuar con ella.</p>
                </div>
            </div>
        `;

        toolPanel.querySelector('.btn-close-tool').addEventListener('click', () => {
            sfx.close();
            closeTool();
        });

        // Efectos al cargar
        createExplosion(window.innerWidth / 2, window.innerHeight / 3);
        sfx.success(); // ¡Fanfarria de carga!
        
        toolPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const closeTool = () => {
        toolPanel.innerHTML = `
            <div class="tool-panel__empty-state">
                <span class="tool-panel__empty-icon">🕹️</span>
                <p>Selecciona una herramienta para empezar a jugar</p>
            </div>
        `;
    };


    // --- 5. CANVAS DE EFECTOS VISUALES (FX) ---
    const resizeCanvas = () => {
        fxCanvas.width = window.innerWidth;
        fxCanvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let particles = [];

    class Particle {
        constructor(x, y, color, speedX, speedY, size, life) {
            this.x = x; this.y = y; this.color = color;
            this.speedX = speedX; this.speedY = speedY;
            this.size = size; this.life = life; this.maxLife = life;
        }
        update() {
            this.x += this.speedX; this.y += this.speedY;
            this.speedY += 0.1; this.life--;
        }
        draw() {
            const alpha = this.life / this.maxLife;
            ctx.globalAlpha = alpha; ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.size, this.size);
        }
    }

    const createFireworks = (x, y) => {
        const colors = ['#ffc800', '#ff4757', '#00aa44', '#00cc55', '#ffffff', '#ffe066'];
        for (let i = 0; i < 60; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            particles.push(new Particle(x, y, colors[Math.floor(Math.random() * colors.length)], Math.cos(angle) * speed, Math.sin(angle) * speed, Math.random() * 4 + 2, Math.random() * 40 + 20));
        }
    };

    const createExplosion = (x, y) => {
        const colors = ['#ff4757', '#ff6b81', '#ffc800'];
        for (let i = 0; i < 40; i++) {
            particles.push(new Particle(x, y, colors[Math.floor(Math.random() * colors.length)], (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, Math.random() * 8 + 4, Math.random() * 20 + 10));
        }
    };

    const animateFx = () => {
        ctx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update(); particles[i].draw();
            if (particles[i].life <= 0) particles.splice(i, 1);
        }
        ctx.globalAlpha = 1;
        requestAnimationFrame(animateFx);
    };

    animateFx();

    // Botones de prueba FX (Con sonido añadido)
    btnTestFireworks.addEventListener('click', () => {
        initAudio();
        createFireworks(window.innerWidth / 2, window.innerHeight / 2);
        sfx.fireworks();
    });

    btnTestExplosion.addEventListener('click', () => {
        initAudio();
        createExplosion(window.innerWidth / 2, window.innerHeight / 2);
        sfx.explosion();
    });

});