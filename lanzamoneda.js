/* =============================================================
   EDU CHEMA 2.o — Módulo: Lanza Moneda 🪙
   =============================================================
   Simula el lanzamiento de una moneda con animación 3D.
   Incluye contador de estadísticas para experimentos de probabilidad.
   ============================================================= */

import { playWhoosh, playSuccess } from './audioManager.js';

/**
 * Inicializa la herramienta Lanza Moneda.
 * @param {HTMLElement} container - El #tool-panel donde se inyectará la UI
 */
export function init(container) {

    // --- Estado interno ---
    let isFlipping = false;
    const stats = { cara: 0, cruz: 0 };

    // --- Inyección de HTML y CSS ---
    container.innerHTML = `
        <button class="tool-panel__close" aria-label="Cerrar herramienta">✕ CERRAR</button>
        <div class="coin-layout">
            
            <!-- Área de la Moneda -->
            <div class="coin-stage">
                <div id="the-coin" class="coin" aria-live="assertive">
                    <div class="coin__face coin__face--front">
                        <span class="coin__letter">C</span>
                        <span class="coin__word">CARA</span>
                    </div>
                    <div class="coin__face coin__face--back">
                        <span class="coin__letter">X</span>
                        <span class="coin__word">CRUZ</span>
                    </div>
                </div>
            </div>

            <!-- Resultado Textual -->
            <p id="coin-result-text" class="coin-result">Pulsa el botón para lanzar</p>

            <!-- Botón de Acción -->
            <button id="btn-flip-coin" class="btn-retro btn-yellow">
                <span class="btn-retro__icon">🪙</span> LANZAR MONEDA
            </button>

            <!-- Estadísticas de Probabilidad -->
            <div class="coin-stats-box">
                <h4 class="coin-stats-title">📊 Estadísticas (Probabilidad)</h4>
                <div class="coin-stats-grid">
                    <div class="coin-stat">
                        <span class="coin-stat__label">Cara</span>
                        <span id="stat-cara" class="coin-stat__value" style="color: var(--color-yellow);">0</span>
                    </div>
                    <div class="coin-stat">
                        <span class="coin-stat__label">Cruz</span>
                        <span id="stat-cruz" class="coin-stat__value" style="color: var(--color-green-light);">0</span>
                    </div>
                    <div class="coin-stat">
                        <span class="coin-stat__label">Total</span>
                        <span id="stat-total" class="coin-stat__value" style="color: var(--color-text);">0</span>
                    </div>
                </div>
                <button id="btn-reset-stats" class="btn-retro btn-green btn-sm" style="margin-top: var(--space-md); width: 100%; justify-content: center;">
                    REINICIAR CONTADOR
                </button>
            </div>

        </div>

        <!-- Estilos Scoped del Módulo -->
        <style>
            .coin-layout {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: var(--space-xl);
                padding: var(--space-xl) 0;
            }

            /* --- Escenario 3D --- */
            .coin-stage {
                width: 150px;
                height: 150px;
                perspective: 800px; /* Da profundidad a la rotación 3D */
            }

            /* --- La Moneda --- */
            .coin {
                width: 100%;
                height: 100%;
                position: relative;
                transform-style: preserve-3d;
                transition: transform 0.1s; /* Transición base */
            }

            /* --- Animaciones de Lanzamiento --- */
            /* Termina en 0deg (Cara) - Múltiplo par de 180 */
            @keyframes flip-to-cara {
                0%   { transform: rotateX(0deg) translateY(0); }
                15%  { transform: rotateX(540deg) translateY(-120px) scale(1.1); }
                30%  { transform: rotateX(1080deg) translateY(-180px) scale(1.2); }
                50%  { transform: rotateX(1620deg) translateY(-150px) scale(1.1); }
                70%  { transform: rotateX(2160deg) translateY(-40px); }
                85%  { transform: rotateX(2520deg) translateY(10px); }
                100% { transform: rotateX(2880deg) translateY(0); } /* 2880 / 180 = 16 (Par = Cara) */
            }

            /* Termina en 180deg (Cruz) - Múltiplo impar de 180 */
            @keyframes flip-to-cruz {
                0%   { transform: rotateX(0deg) translateY(0); }
                15%  { transform: rotateX(540deg) translateY(-120px) scale(1.1); }
                30%  { transform: rotateX(1080deg) translateY(-180px) scale(1.2); }
                50%  { transform: rotateX(1620deg) translateY(-150px) scale(1.1); }
                70%  { transform: rotateX(2160deg) translateY(-40px); }
                85%  { transform: rotateX(2520deg) translateY(10px); }
                100% { transform: rotateX(3060deg) translateY(0); } /* 3060 / 180 = 17 (Impar = Cruz) */
            }

            .coin.is-flipping-cara {
                animation: flip-to-cara 1.5s ease-out forwards;
            }

            .coin.is-flipping-cruz {
                animation: flip-to-cruz 1.5s ease-out forwards;
            }

            /* --- Caras de la Moneda --- */
            .coin__face {
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                backface-visibility: hidden; /* Oculta la cara trasera cuando gira */
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                border: 6px solid;
                box-shadow: inset 0 0 20px rgba(0,0,0,0.3);
            }

            /* Cara Frontal (Cara) */
            .coin__face--front {
                background: radial-gradient(circle at 30% 30%, #ffe066, #cc9f00);
                border-color: #aa8000;
                color: #5a4000;
            }

            /* Cara Trasera (Cruz) */
            .coin__face--back {
                background: radial-gradient(circle at 30% 30%, #c0c0c0, #808080);
                border-color: #606060;
                color: #2a2a2a;
                transform: rotateX(180deg); /* Posición inicial de la cara trasera */
            }

            .coin__letter {
                font-family: var(--font-pixel);
                font-size: var(--fs-4xl);
                line-height: 1;
                margin-bottom: var(--space-xs);
            }

            .coin__word {
                font-family: var(--font-pixel);
                font-size: var(--fs-xs);
                letter-spacing: 2px;
                opacity: 0.8;
            }

            /* --- Texto de Resultado --- */
            .coin-result {
                font-family: var(--font-pixel);
                font-size: var(--fs-md);
                color: var(--color-text-muted);
                min-height: 2em;
                text-align: center;
                transition: color var(--transition-mid);
            }

            .coin-result.is-cara { color: var(--color-yellow); text-shadow: 2px 2px 0 var(--color-yellow-dark); }
            .coin-result.is-cruz { color: var(--color-green-light); text-shadow: 2px 2px 0 var(--color-green-dark); }

            /* --- Caja de Estadísticas --- */
            .coin-stats-box {
                margin-top: var(--space-lg);
                background: var(--color-bg-dark);
                border: var(--border-width) solid var(--color-border);
                padding: var(--space-lg);
                width: 100%;
                max-width: 400px;
                box-shadow: var(--shadow-sunken);
            }

            .coin-stats-title {
                font-family: var(--font-pixel);
                font-size: var(--fs-xs);
                color: var(--color-text);
                text-align: center;
                margin-bottom: var(--space-md);
            }

            .coin-stats-grid {
                display: flex;
                justify-content: space-around;
                text-align: center;
            }

            .coin-stat {
                display: flex;
                flex-direction: column;
                gap: var(--space-xs);
            }

            .coin-stat__label {
                font-family: var(--font-pixel);
                font-size: 8px;
                color: var(--color-text-muted);
            }

            .coin-stat__value {
                font-family: var(--font-retro);
                font-size: var(--fs-3xl);
            }

            /* Responsive */
            @media (max-width: 600px) {
                .coin-stage { width: 120px; height: 120px; }
                .coin__letter { font-size: var(--fs-3xl); }
            }
        </style>
    `;

    // --- Referencias al DOM ---
    const coin = container.querySelector('#the-coin');
    const btnFlip = container.querySelector('#btn-flip-coin');
    const resultText = container.querySelector('#coin-result-text');
    const statCara = container.querySelector('#stat-cara');
    const statCruz = container.querySelector('#stat-cruz');
    const statTotal = container.querySelector('#stat-total');
    const btnReset = container.querySelector('#btn-reset-stats');

    // --- Lógica del Lanzamiento ---

    function updateStatsUI() {
        const total = stats.cara + stats.cruz;
        statCara.textContent = stats.cara;
        statCruz.textContent = stats.cruz;
        statTotal.textContent = total;
    }

    function flipCoin() {
        if (isFlipping) return;
        isFlipping = true;

        // Sonido de lanzamiento
        playWhoosh();

        // Resetear clases y forzar reflow para reiniciar la animación CSS
        coin.classList.remove('is-flipping-cara', 'is-flipping-cruz');
        void coin.offsetWidth; // El truco mágico para reiniciar animaciones CSS

        // Determinar resultado
        const isCara = Math.random() >= 0.5;

        // Aplicar animación correspondiente
        if (isCara) {
            coin.classList.add('is-flipping-cara');
            stats.cara++;
        } else {
            coin.classList.add('is-flipping-cruz');
            stats.cruz++;
        }

        // Cambiar texto a "Lanzando..."
        resultText.textContent = 'Lanzando...';
        resultText.className = 'coin-result';
        btnFlip.disabled = true;

        // Escuchar el fin de la animación
        function onAnimationEnd() {
            coin.removeEventListener('animationend', onAnimationEnd);
            
            // Actualizar resultado
            if (isCara) {
                resultText.textContent = '¡Es Cara! 👑';
                resultText.classList.add('is-cara');
            } else {
                resultText.textContent = '¡Es Cruz! 🦅';
                resultText.classList.add('is-cruz');
            }

            updateStatsUI();
            playSuccess(); // Sonido de éxito
            
            isFlipping = false;
            btnFlip.disabled = false;
        }

        coin.addEventListener('animationend', onAnimationEnd);
    }

    function resetStats() {
        stats.cara = 0;
        stats.cruz = 0;
        updateStatsUI();
        resultText.textContent = 'Contador reiniciado';
        resultText.className = 'coin-result';
        
        // Regresar la moneda a su estado frontal original suavemente
        coin.classList.remove('is-flipping-cara', 'is-flipping-cruz');
    }

    // --- Event Listeners ---
    btnFlip.addEventListener('click', flipCoin);
    btnReset.addEventListener('click', resetStats);

    // Atajo de teclado (Espacio o Enter)
    container.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            flipCoin();
        }
    });

    return {
        destroy() {
            // Limpieza si fuera necesaria
        }
    };
}