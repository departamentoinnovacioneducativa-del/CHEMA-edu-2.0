// pomodoro.js

export const render = () => `
    <div class="crono-container">
        <div class="pomo-status" id="pomo-status">🍅 TIEMPO DE TRABAJO</div>
        <div class="crono-display pomo-work" id="pomo-display">25:00</div>
        <div class="crono-controls">
            <button class="btn-retro btn-green" id="pomo-start">▶ INICIAR</button>
            <button class="btn-retro btn-yellow" id="pomo-pause" disabled>⏸ PAUSA</button>
            <button class="btn-retro btn-danger" id="pomo-reset">↺ REINICIAR</button>
        </div>
    </div>
`;

export const init = ({ sfx, onCleanup }) => {
    const display = document.getElementById('pomo-display');
    const btnStart = document.getElementById('pomo-start');
    const btnPause = document.getElementById('pomo-pause');
    const btnReset = document.getElementById('pomo-reset');
    const statusText = document.getElementById('pomo-status');

    if (!display || !btnStart) return;

    // Configuración del Pomodoro (en segundos)
    const WORK_TIME = 25 * 60; // 25 minutos
    const BREAK_TIME = 5 * 60; // 5 minutos

    let timeLeft = WORK_TIME;
    let timerInterval = null;
    let isWorkMode = true;

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const updateDisplay = () => {
        display.textContent = formatTime(timeLeft);
    };

    const switchMode = () => {
        isWorkMode = !isWorkMode;
        timeLeft = isWorkMode ? WORK_TIME : BREAK_TIME;
        
        if (isWorkMode) {
            statusText.textContent = '🍅 TIEMPO DE TRABAJO';
            display.classList.add('pomo-work');
            display.classList.remove('pomo-break');
            sfx.explosion(); // Sonido fuerte para volver a la realidad
        } else {
            statusText.textContent = '🧘 DESCANSO';
            display.classList.remove('pomo-work');
            display.classList.add('pomo-break');
            sfx.success(); // Fanfarria de que terminó el trabajo
        }
        updateDisplay();
    };

    const tick = () => {
        if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
        } else {
            clearInterval(timerInterval);
            switchMode();
            // Reiniciamos automáticamente el siguiente ciclo
            timerInterval = setInterval(tick, 1000); 
        }
    };

    const startTimer = () => {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(tick, 1000);
        btnStart.disabled = true;
        btnPause.disabled = false;
        sfx.click();
    };

    const pauseTimer = () => {
        clearInterval(timerInterval);
        timerInterval = null;
        btnStart.disabled = false;
        btnPause.disabled = true;
        sfx.click();
    };

    const resetTimer = () => {
        clearInterval(timerInterval);
        timerInterval = null;
        isWorkMode = true;
        timeLeft = WORK_TIME;
        statusText.textContent = '🍅 TIEMPO DE TRABAJO';
        display.classList.add('pomo-work');
        display.classList.remove('pomo-break');
        btnStart.disabled = false;
        btnPause.disabled = true;
        updateDisplay();
        sfx.click();
    };

    // Inicializar display
    updateDisplay();

    // Event Listeners
    btnStart.addEventListener('click', startTimer);
    btnPause.addEventListener('click', pauseTimer);
    btnReset.addEventListener('click', resetTimer);

    // Limpieza al cerrar la herramienta
    onCleanup(() => {
        clearInterval(timerInterval);
        btnStart.removeEventListener('click', startTimer);
        btnPause.removeEventListener('click', pauseTimer);
        btnReset.removeEventListener('click', resetTimer);
    });
};