// papa-caliente.js

export const render = () => `
    <div class="crono-container papa-container">
        <div class="poma-visual" id="papa-visual">🥔</div>
        <div class="papa-timer" id="papa-timer">00:00</div>
        <p class="papa-status" id="papa-status">¡Pasa la papa!</p>
        <div class="crono-controls">
            <button class="btn-retro btn-green" id="papa-start">🔥 INICIAR</button>
            <button class="btn-retro btn-danger" id="papa-reset">↺ REINICIAR</button>
        </div>
    </div>
`;

export const init = ({ sfx, fx, onCleanup }) => {
    const visual = document.getElementById('papa-visual');
    const timerDisplay = document.getElementById('papa-timer');
    const statusText = document.getElementById('papa-status');
    const btnStart = document.getElementById('papa-start');
    const btnReset = document.getElementById('papa-reset');

    if (!visual || !btnStart) return;

    let isPlaying = false;
    let totalTime = 0;
    let timeLeft = 0;
    let timerTimeout = null;

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const updateDisplay = () => {
        timerDisplay.textContent = formatTime(timeLeft);
    };

    const startGame = () => {
        if (isPlaying) return;
        isPlaying = true;
        
        // Tiempo aleatorio entre 10 y 45 segundos
        totalTime = Math.floor(Math.random() * 35) + 10;
        timeLeft = totalTime;

        visual.textContent = '🥔';
        statusText.textContent = '¡Pasa la papa!';
        timerDisplay.classList.remove('papa-exploded');
        visual.classList.remove('papa-shake');
        
        btnStart.disabled = true;
        updateDisplay();
        tick();
    };

    const tick = () => {
        if (!isPlaying) return;

        timeLeft--;
        updateDisplay();

        if (timeLeft <= 0) {
            explode();
            return;
        }

        // Calcular velocidad del tick (más rápido cuanto menos tiempo queda)
        let percentLeft = timeLeft / totalTime;
        let nextTickTime = 800;

        if (percentLeft < 0.2) {
            nextTickTime = 80; // Rapidísimo
            visual.classList.add('papa-shake');
            timerDisplay.classList.add('papa-danger');
            timerDisplay.classList.remove('papa-warning');
        } else if (percentLeft < 0.4) {
            nextTickTime = 200;
            timerDisplay.classList.add('papa-warning');
            timerDisplay.classList.remove('papa-danger', 'papa-safe');
        } else if (percentLeft < 0.6) {
            nextTickTime = 400;
        } else {
            timerDisplay.classList.add('papa-safe');
            timerDisplay.classList.remove('papa-warning', 'papa-danger');
        }

        sfx.tick();
        timerTimeout = setTimeout(tick, nextTickTime);
    };

    const explode = () => {
        isPlaying = false;
        visual.textContent = '💥';
        statusText.textContent = '¡BOOM! ¡Te quemaste!';
        timerDisplay.textContent = '💀';
        timerDisplay.classList.remove('papa-safe', 'papa-warning', 'papa-danger');
        timerDisplay.classList.add('papa-exploded');
        
        sfx.explosion();
        fx.createExplosion(window.innerWidth / 2, window.innerHeight / 2);
        fx.createFireworks(window.innerWidth / 2, window.innerHeight / 2);

        btnStart.disabled = false;
    };

    const resetGame = () => {
        clearTimeout(timerTimeout);
        isPlaying = false;
        visual.textContent = '🥔';
        statusText.textContent = '¡Pasa la papa!';
        timerDisplay.textContent = '00:00';
        timerDisplay.classList.remove('papa-safe', 'papa-warning', 'papa-danger', 'papa-exploded');
        visual.classList.remove('papa-shake');
        btnStart.disabled = false;
        sfx.click();
    };

    // Event Listeners
    btnStart.addEventListener('click', startGame);
    btnReset.addEventListener('click', resetGame);

    // Limpieza
    onCleanup(() => {
        clearTimeout(timerTimeout);
        isPlaying = false;
        btnStart.removeEventListener('click', startGame);
        btnReset.removeEventListener('click', resetGame);
    });
};