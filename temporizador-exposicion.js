// temporizador-exposicion.js

export const render = () => `
    <div class="crono-container expo-container">
        
        <div class="expo-config">
            <p class="expo-label">⏱ Elige minutos:</p>
            <button class="btn-retro btn-small btn-preset" data-minutes="3">3 min</button>
            <button class="btn-retro btn-small btn-preset" data-minutes="5">5 min</button>
            <button class="btn-retro btn-small btn-preset" data-minutes="10">10 min</button>
            <input type="number" id="expo-input" class="expo-input" min="1" max="60" value="5">
        </div>

        <div class="expo-display" id="expo-display">05:00</div>

        <div class="crono-controls">
            <button class="btn-retro btn-green" id="expo-start">▶ INICIAR</button>
            <button class="btn-retro btn-yellow" id="expo-pause" disabled>⏸ PAUSA</button>
            <button class="btn-retro btn-danger" id="expo-reset">↺ REINICIAR</button>
        </div>
    </div>
`;

export const init = ({ sfx, onCleanup }) => {
    const display = document.getElementById('expo-display');
    const btnStart = document.getElementById('expo-start');
    const btnPause = document.getElementById('expo-pause');
    const btnReset = document.getElementById('expo-reset');
    const inputMin = document.getElementById('expo-input');
    const presets = document.querySelectorAll('.btn-preset');

    if (!display || !btnStart) return;

    let totalTime = 5 * 60; // Por defecto 5 minutos en segundos
    let timeLeft = totalTime;
    let timerInterval = null;
    let isRunning = false;

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const updateDisplay = () => {
        display.textContent = formatTime(timeLeft);
    };

    const setTime = (minutes) => {
        if (isRunning) return; // No se puede cambiar si ya está corriendo
        const min = parseInt(minutes);
        if (min > 0 && min <= 60) {
            inputMin.value = min;
            totalTime = min * 60;
            timeLeft = totalTime;
            display.classList.remove('expo-warning', 'expo-danger');
            updateDisplay();
            sfx.click();
        }
    };

    const startTimer = () => {
        if (timeLeft <= 0) return; // Si ya terminó, no inicia
        
        if (!isRunning && timeLeft === totalTime) {
            // Si es la primera vez que le damos a iniciar, leemos el input
            setTime(inputMin.value);
        }

        timerInterval = setInterval(() => {
            timeLeft--;
            updateDisplay();

            // Alerta amarilla: Menos de 1 minuto
            if (timeLeft <= 60 && timeLeft > 0) {
                display.classList.add('expo-warning');
                display.classList.remove('expo-danger');
                if (timeLeft % 10 === 0) sfx.click(); // Pitido cada 10 seg
            } 
            // ¡Tiempo!
            else if (timeLeft <= 0) {
                clearInterval(timerInterval);
                isRunning = false;
                display.classList.remove('expo-warning');
                display.classList.add('expo-danger');
                display.textContent = "¡TIEMPO!";
                sfx.explosion(); // Alarma fuerte
                btnStart.disabled = true;
                btnPause.disabled = true;
            }
        }, 1000);

        isRunning = true;
        btnStart.disabled = true;
        btnPause.disabled = false;
        sfx.click();
    };

    const pauseTimer = () => {
        clearInterval(timerInterval);
        isRunning = false;
        btnStart.disabled = false;
        btnPause.disabled = true;
        sfx.click();
    };

    const resetTimer = () => {
        clearInterval(timerInterval);
        isRunning = false;
        setTime(inputMin.value);
        btnStart.disabled = false;
        btnPause.disabled = true;
        sfx.click();
    };

    // Listeners
    btnStart.addEventListener('click', startTimer);
    btnPause.addEventListener('click', pauseTimer);
    btnReset.addEventListener('click', resetTimer);
    
    presets.forEach(btn => {
        btn.addEventListener('click', (e) => setTime(e.target.dataset.minutes));
    });

    inputMin.addEventListener('change', (e) => setTime(e.target.value));

    // Inicializar
    updateDisplay();

    // Limpieza
    onCleanup(() => {
        clearInterval(timerInterval);
        btnStart.removeEventListener('click', startTimer);
        btnPause.removeEventListener('click', pauseTimer);
        btnReset.removeEventListener('click', resetTimer);
        presets.forEach(btn => btn.removeEventListener('click', () => {}));
    });
};