/* =============================================================
   EDU CHEMA 2.o — Módulo: Papa Caliente 💣
   =============================================================
   Cuenta atrás aleatoria. Al llegar a cero, ¡BOOM!
   Integra la animación de explosión pixelada desde main.js.
   ============================================================= */

// Importamos la explosión desde el módulo principal
import { playExplosion } from './main.js';

/**
 * Inicializa la herramienta Papa Caliente dentro del contenedor dado.
 * @param {HTMLElement} container - El #tool-panel donde se inyectará la UI
 */
export function init(container) {

    // --- Estado interno del módulo ---
    const state = {
        timeLeft: 0,
        maxTime: 0,
        isRunning: false,
        isExploded: false,
        intervalId: null,
        pulseIntervalId: null
    };

    // --- Inyección del HTML ---
    container.innerHTML = `
        <button class="tool-panel__close" aria-label="Cerrar herramienta">✕ CERRAR</button>
        <div class="pc-layout">
            
            <!-- Columna izquierda: Controles -->
            <div class="pc-controls">
                <h3 class="section-title">💣 Configuración</h3>
                
                <div class="pc-setting">
                    <label for="pc-max-time">Tiempo Máximo (seg):</label>
                    <div class="pc-input-group">
                        <button class="btn-retro btn-green btn-sm" id="pc-time-down" aria-label="Reducir tiempo">-</button>
                        <input type="number" id="pc-max-time" value="15" min="5" max="60" step="1" readonly>
                        <button class="btn-retro btn-green btn-sm" id="pc-time-up" aria-label="Aumentar tiempo">+</button>
                    </div>
                </div>

                <div class="pc-actions">
                    <button id="pc-start-btn" class="btn-retro btn-green btn-block">
                        <span class="btn-retro__icon">▶️</span> INICIAR
                    </button>
                    <button id="pc-stop-btn" class="btn-retro btn-yellow btn-block" disabled>
                        <span class="btn-retro__icon">⏹️</span> DETENER
                    </button>
                </div>
            </div>

            <!-- Columna derecha: Display -->
            <div class="pc-display-wrapper">
                <div id="pc-display" class="pc-display" aria-live="assertive">
                    <span class="pc-display__time" id="pc-time-text">--</span>
                    <span class="pc-display__label">SEGUNDOS</span>
                </div>
                <p id="pc-status" class="pc-status">Ajusta el tiempo y pulsa INICIAR</p>
            </div>

        </div>

        <!-- Estilos específicos del módulo (Scoped via clase padre) -->
        <style>
            .pc-layout {
                display: flex;
                gap: var(--space-2xl);
                align-items: flex-start;
                margin-top: var(--space-lg);
            }

            .pc-controls {
                flex: 0 0 280px;
                display: flex;
                flex-direction: column;
                gap: var(--space-lg);
            }

            .pc-setting label {
                display: block;
                font-family: var(--font-pixel);
                font-size: var(--fs-xs);
                color: var(--color-green-light);
                margin-bottom: var(--space-sm);
            }

            .pc-input-group {
                display: flex;
                align-items: center;
                gap: var(--space-sm);
            }

            .pc-input-group input {
                flex: 1;
                text-align: center;
                font-family: var(--font-pixel);
                font-size: var(--fs-xl);
                color: var(--color-yellow);
                background: var(--color-bg-dark);
                border: var(--border-width) solid var(--color-green-dark);
                border-bottom-color: var(--color-green);
                border-right-color: var(--color-green);
                box-shadow: inset 2px 2px 0px rgba(0,0,0,0.5);
                padding: var(--space-sm);
                width: 60px;
                -moz-appearance: textfield;
            }
            .pc-input-group input::-webkit-outer-spin-button,
            .pc-input-group input::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }

            .btn-sm {
                padding: var(--space-xs) var(--space-sm) !important;
                font-size: 10px !important;
                min-width: 40px;
                justify-content: center;
            }

            .btn-block {
                width: 100%;
                justify-content: center;
            }

            .pc-actions {
                display: flex;
                flex-direction: column;
                gap: var(--space-sm);
            }

            .pc-display-wrapper {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: var(--color-bg-dark);
                border: var(--border-width) solid var(--color-green-dark);
                padding: var(--space-2xl);
                box-shadow: var(--shadow-raised), inset 0 0 50px rgba(0,0,0,0.5);
                position: relative;
                overflow: hidden;
            }

            /* Scanlines sobre el display */
            .pc-display-wrapper::after {
                content: '';
                position: absolute;
                inset: 0;
                background: repeating-linear-gradient(
                    0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px
                );
                pointer-events: none;
            }

            .pc-display {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: var(--space-md);
                position: relative;
                z-index: 2;
            }

            .pc-display__time {
                font-family: var(--font-pixel);
                font-size: 6rem;
                color: var(--color-green-light);
                text-shadow: 4px 4px 0 var(--color-green-dark);
                line-height: 1;
                transition: color 0.2s, text-shadow 0.2s;
            }

            .pc-display__label {
                font-family: var(--font-pixel);
                font-size: var(--fs-xs);
                color: var(--color-text-muted);
                letter-spacing: 3px;
            }

            .pc-status {
                margin-top: var(--space-lg);
                font-size: var(--fs-lg);
                color: var(--color-text-muted);
                text-align: center;
                position: relative;
                z-index: 2;
            }

            /* --- Estados del Display --- */
            
            /* Esperando */
            .pc-display.state-idle .pc-display__time {
                color: var(--color-text-muted);
                text-shadow: 3px 3px 0 rgba(0,0,0,0.5);
            }

            /* Corriendo */
            .pc-display.state-running .pc-display__time {
                color: var(--color-green-light);
                text-shadow: 4px 4px 0 var(--color-green-dark), 0 0 20px rgba(0,204,85,0.4);
                animation: pc-pulse 1s ease-in-out infinite;
            }

            @keyframes pc-pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }

            /* Peligro (< 5 seg) */
            .pc-display.state-danger .pc-display__time {
                color: var(--color-yellow);
                text-shadow: 4px 4px 0 var(--color-yellow-dark), 0 0 25px rgba(255,200,0,0.6);
                animation: pc-shake 0.15s linear infinite;
            }

            @keyframes pc-shake {
                0%   { transform: translate(0, 0) rotate(0deg); }
                25%  { transform: translate(-3px, 2px) rotate(-1deg); }
                50%  { transform: translate(3px, -2px) rotate(1deg); }
                75%  { transform: translate(-2px, -3px) rotate(-0.5deg); }
                100% { transform: translate(2px, 3px) rotate(0.5deg); }
            }

            /* Crítico (< 3 seg) */
            .pc-display.state-critical .pc-display__time {
                color: #ff3333;
                text-shadow: 4px 4px 0 #880000, 0 0 30px rgba(255,0,0,0.8);
                animation: pc-extreme 0.08s linear infinite;
            }

            @keyframes pc-extreme {
                0%   { transform: translate(0, 0) scale(1.1); }
                25%  { transform: translate(-5px, 3px) scale(0.95); }
                50%  { transform: translate(5px, -3px) scale(1.1); }
                75%  { transform: translate(-3px, -5px) scale(0.95); }
                100% { transform: translate(3px, 5px) scale(1.1); }
            }

            /* Explotado */
            .pc-display.state-boom .pc-display__time {
                color: #ff3333;
                text-shadow: 4px 4px 0 #880000;
                animation: none;
                transform: scale(1.3);
            }
            
            .pc-display.state-boom .pc-display__label {
                color: #ff3333;
            }

            /* Botón deshabilitado */
            button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                transform: none !important;
                box-shadow: none !important;
            }

            /* --- Responsive --- */
            @media (max-width: 700px) {
                .pc-layout {
                    flex-direction: column-reverse;
                }
                .pc-controls {
                    flex: none;
                    width: 100%;
                }
                .pc-display__time {
                    font-size: 4rem;
                }
            }
        </style>
    `;

    // --- Referencias al DOM ---
    const dom = {
        maxTimeInput: container.querySelector('#pc-max-time'),
        timeDown: container.querySelector('#pc-time-down'),
        timeUp: container.querySelector('#pc-time-up'),
        startBtn: container.querySelector('#pc-start-btn'),
        stopBtn: container.querySelector('#pc-stop-btn'),
        display: container.querySelector('#pc-display'),
        timeText: container.querySelector('#pc-time-text'),
        status: container.querySelector('#pc-status')
    };

    // --- Funciones de Control ---

    function updateUI() {
        dom.timeText.textContent = state.isRunning || state.isExploded ? state.timeLeft : '--';
        
        // Actualizar clases de estado del display
        dom.display.className = 'pc-display';
        if (state.isExploded) {
            dom.display.classList.add('state-boom');
        } else if (state.isRunning) {
            if (state.timeLeft <= 3) dom.display.classList.add('state-critical');
            else if (state.timeLeft <= 5) dom.display.classList.add('state-danger');
            else dom.display.classList.add('state-running');
        } else {
            dom.display.classList.add('state-idle');
        }

        // Habilitar/deshabilitar botones
        dom.startBtn.disabled = state.isRunning;
        dom.stopBtn.disabled = !state.isRunning;
        dom.timeDown.disabled = state.isRunning;
        dom.timeUp.disabled = state.isRunning;
    }

    function tick() {
        state.timeLeft--;
        updateUI();

        if (state.timeLeft <= 0) {
            explode();
        }
    }

    function startGame() {
        if (state.isRunning) return;

        // Generar tiempo aleatorio entre 3 y el máximo configurado
        state.maxTime = parseInt(dom.maxTimeInput.value, 10) || 15;
        state.timeLeft = Math.floor(Math.random() * (state.maxTime - 2)) + 3; // Mínimo 3 segundos
        state.isRunning = true;
        state.isExploded = false;

        dom.status.textContent = '¡Pásalo! ¡Pásalo!';

        // Intervalo de 1 segundo
        state.intervalId = setInterval(tick, 1000);
        updateUI();
    }

    function stopGame() {
        if (!state.isRunning) return;
        clearInterval(state.intervalId);
        state.isRunning = false;
        dom.status.textContent = 'Detenido a tiempo...';
        updateUI();
    }

    function explode() {
        clearInterval(state.intervalId);
        state.isRunning = false;
        state.isExploded = true;

        dom.timeText.textContent = 'BOOM!';
        dom.status.textContent = '💥 ¡BOOOM! ¡A quién le tocó!';
        updateUI();

        // Llamar a la explosión importada de main.js
        // Calculamos la posición central del display para que explote ahí
        const rect = dom.display.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        playExplosion(x, y);

        // Reproducir un segundo efecto un poco desplazado para más caos
        setTimeout(() => {
            playExplosion(x + (Math.random()-0.5)*100, y + (Math.random()-0.5)*60);
        }, 200);
    }

    function changeTime(delta) {
        let val = parseInt(dom.maxTimeInput.value, 10) + delta;
        val = Math.max(5, Math.min(60, val));
        dom.maxTimeInput.value = val;
    }

    // --- Event Listeners ---
    dom.startBtn.addEventListener('click', startGame);
    dom.stopBtn.addEventListener('click', stopGame);
    dom.timeDown.addEventListener('click', () => changeTime(-1));
    dom.timeUp.addEventListener('click', () => changeTime(1));

    // Atajos de teclado
    container.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return; // No interceptar si estamos en un input
        if (e.code === 'Space') {
            e.preventDefault();
            state.isRunning ? stopGame() : startGame();
        }
    });

    // --- Limpieza (Buena práctica para módulos) ---
    // Aunque en esta app no destruimos el panel, es bueno tenerlo previsto
    return {
        destroy() {
            clearInterval(state.intervalId);
        }
    };

}