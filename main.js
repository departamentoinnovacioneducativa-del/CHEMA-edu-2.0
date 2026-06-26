// ============================================================
// EDU CHEMA 2.0 — LÓGICA PRINCIPAL
// ============================================================

// Esperamos a que el DOM cargue completamente
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. SELECCIÓN DE ELEMENTOS DEL DOM ---
    const mainNav = document.getElementById('main-nav');
    const toolPanel = document.getElementById('tool-panel');
    const btnSoundToggle = document.getElementById('btn-sound-toggle');
    const btnTestFireworks = document.getElementById('btn-test-fireworks');
    const btnTestExplosion = document.getElementById('btn-test-explosion');
    const fxCanvas = document.getElementById('fx-canvas');
    const ctx = fxCanvas.getContext('2d');


    // --- 2. LÓGICA DE NAVEGACIÓN (DROPDOWNS) ---

    // Función para cerrar todos los menús abiertos
    const closeAllDropdowns = () => {
        document.querySelectorAll('.nav-dropdown.is-open').forEach(dd => {
            dd.classList.remove('is-open');
            dd.querySelector('.nav-dropdown__trigger').setAttribute('aria-expanded', 'false');
        });
    };

    // Delegación de eventos en el menú principal (más eficiente que poner eventos a cada botón)
    mainNav.addEventListener('click', (e) => {
        const trigger = e.target.closest('.nav-dropdown__trigger');
        const item = e.target.closest('.nav-dropdown__item');

        // Si se hace clic en el botón principal del dropdown
        if (trigger) {
            const dropdown = trigger.closest('.nav-dropdown');
            const isOpen = dropdown.classList.contains('is-open');
            
            closeAllDropdowns(); // Cierra los demás primero
            
            // Si no estaba abierto, lo abrimos
            if (!isOpen) {
                dropdown.classList.add('is-open');
                trigger.setAttribute('aria-expanded', 'true');
            }
            return; // Salimos para no ejecutar el código de abajo
        }

        // Si se hace clic en una opción del menú desplegable
        if (item) {
            closeAllDropdowns();
            const toolId = item.dataset.tool;
            if (toolId) loadTool(toolId);
        }
    });

    // Cerrar menús si hacemos clic fuera de la navegación
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#main-nav')) {
            closeAllDropdowns();
        }
    });

    // Cerrar menús con la tecla Escape (Accesibilidad)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllDropdowns();
    });


    // --- 3. SISTEMA DE CARGA DE HERRAMIENTAS ---

    // Escuchar clics en las tarjetas de acceso rápido (<a> tags)
    document.querySelectorAll('.tool-card[data-tool]').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault(); // Prevenir el salto del href="#"
            loadTool(card.dataset.tool);
        });
        // Soporte para teclado (Enter/Space)
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                loadTool(card.dataset.tool);
            }
        });
    });

    // Función principal para renderizar una herramienta
    const loadTool = (toolId) => {
        // Formatear el nombre: 'cronometro' -> 'Cronometro', 'papa-caliente' -> 'Papa Caliente'
        const toolName = toolId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        
        // Renderizar el panel con la herramienta seleccionada
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

        // Añadir evento al botón de cerrar que acabamos de inyectar
        toolPanel.querySelector('.btn-close-tool').addEventListener('click', closeTool);

        // Efecto visual de bienvenida (Explosión de pixels)
        createExplosion(window.innerWidth / 2, window.innerHeight / 3);
        
        // Desplazarse suavemente hasta el panel de la herramienta
        toolPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // Función para cerrar la herramienta y mostrar estado vacío
    const closeTool = () => {
        toolPanel.innerHTML = `
            <div class="tool-panel__empty-state">
                <span class="tool-panel__empty-icon">🕹️</span>
                <p>Selecciona una herramienta para empezar a jugar</p>
            </div>
        `;
    };


    // --- 4. SISTEMA DE SONIDO (Placeholder) ---

    let isSoundOn = true;
    btnSoundToggle.addEventListener('click', () => {
        isSoundOn = !isSoundOn;
        btnSoundToggle.textContent = isSoundOn ? '🔊' : '🔇';
        btnSoundToggle.setAttribute('aria-label', isSoundOn ? 'Sonido activado' : 'Sonido desactivado');
        // Aquí iría la lógica real de Audio API
    });


    // --- 5. CANVAS DE EFECTOS VISUALES (FX) ---

    // Ajustar tamaño del canvas al tamaño de la ventana
    const resizeCanvas = () => {
        fxCanvas.width = window.innerWidth;
        fxCanvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Array para almacenar las partículas
    let particles = [];

    // Clase Partícula (Estilo Pixel/Retro)
    class Particle {
        constructor(x, y, color, speedX, speedY, size, life) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.speedX = speedX;
            this.speedY = speedY;
            this.size = size;
            this.life = life;
            this.maxLife = life;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.speedY += 0.1; // Simulación de gravedad
            this.life--;
        }

        draw() {
            const alpha = this.life / this.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.color;
            // Dibujar cuadrados (pixel art style, sin bordes redondeados)
            ctx.fillRect(this.x, this.y, this.size, this.size);
        }
    }

    // Generador de Fuegos Artificiales
    const createFireworks = (x, y) => {
        const colors = ['#ffc800', '#ff4757', '#00aa44', '#00cc55', '#ffffff', '#ffe066'];
        for (let i = 0; i < 60; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            particles.push(new Particle(
                x, y,
                colors[Math.floor(Math.random() * colors.length)],
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                Math.random() * 4 + 2, // Tamaño en píxeles
                Math.random() * 40 + 20 // Vida útil
            ));
        }
    };

    // Generador de Explosión Pixelada
    const createExplosion = (x, y) => {
        const colors = ['#ff4757', '#ff6b81', '#ffc800'];
        for (let i = 0; i < 40; i++) {
            particles.push(new Particle(
                x, y,
                colors[Math.floor(Math.random() * colors.length)],
                (Math.random() - 0.5) * 12,
                (Math.random() - 0.5) * 12,
                Math.random() * 8 + 4, // Tamaño más grande para la explosión
                Math.random() * 20 + 10 // Vida más corta
            ));
        }
    };

    // Bucle de Animación del Canvas
    const animateFx = () => {
        ctx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
        
        // Iterar de atrás hacia adelante para poder eliminar partículas muertas sin romper el índice
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();
            
            if (particles[i].life <= 0) {
                particles.splice(i, 1);
            }
        }
        
        ctx.globalAlpha = 1; // Resetear alpha para el siguiente frame
        requestAnimationFrame(animateFx);
    };

    // Iniciar el bucle de animación
    animateFx();

    // Eventos de los botones de prueba FX
    btnTestFireworks.addEventListener('click', () => {
        createFireworks(window.innerWidth / 2, window.innerHeight / 2);
    });

    btnTestExplosion.addEventListener('click', () => {
        createExplosion(window.innerWidth / 2, window.innerHeight / 2);
    });

}); // Fin del DOMContentLoaded