// metronomo-visual.js

export const render = () => `
    <div class="crono-container metro-container">
        
        <div class="metro-bpm-controls">
            <button class="btn-retro btn-small btn-preset" id="metro-minus">➖ 10</button>
            <div class="metro-bpm-display">
                <span id="metro-bpm-value">120</span>
                <span class="metro-bpm-label">BPM</span>
            </div>
            <button class="btn-retro btn-small btn-preset" id="metro-plus">➕ 10</button>
        </div>

        <div class="metro-visual" id="metro-visual">
            <div class="metro-heart" id="metro-heart"></div>
        </div>

        <div class="crono-controls">
            <button class="btn-retro btn-green" id="metro-start">▶ INICIAR</button>
            <button class="btn-retro btn-danger" id="metro-stop" disabled>⏹ PARAR</button>
        </div>
    </div>
`;

export const init = ({ sfx, onCleanup }) => {
    const btnStart = document.getElementById('metro-start');
    const btnStop = document.getElementById('metro-stop');
    const btnMinus = document.getElementById('metro-minus');
    const btnPlus = document.getElementById('metro-plus');
    const bpmValue = document.getElementById('metro-bpm-value');
    const heart = document.getElementById('metro-heart');

    if (!btnStart || !heart) return;

    let bpm = 120;
    let isPlaying = false;
    let timerInterval = null;

    const updateBpmDisplay = () => {
        bpmValue.textContent = bpm;
    };

    const tick = () => {
        sfx.tick(); // Sonido corto
        // Efecto visual: añadir clase y quitarla rápido
        heart.classList.add('metro-beat');
        setTimeout(() => heart.classList.remove('metro-beat'), 100);
    };

    const startMetronome = () => {
        if (isPlaying) return;
        isPlaying = true;
        
        tick(); // Primer tick inmediato
        // Calcular milisegundos entre beats: 60000ms / bpm
        timerInterval = setInterval(tick, 60000 / bpm);

        btnStart.disabled = true;
        btnStop.disabled = false;
    };

    const stopMetronome = () => {
        isPlaying = false;
        clearInterval(timerInterval);
        timerInterval = null;
        
        btnStart.disabled = false;
        btnStop.disabled = true;
        sfx.click();
    };

    const changeBpm = (amount) => {
        const newBpm = bpm + amount;
        if (newBpm >= 40 && newBpm <= 220) {
            bpm = newBpm;
            updateBpmDisplay();
            sfx.click();
            
            // Si está sonando, reiniciamos el intervalo con el nuevo BPM
            if (isPlaying) {
                clearInterval(timerInterval);
                timerInterval = setInterval(tick, 60000 / bpm);
            }
        }
    };

    // Event Listeners
    btnStart.addEventListener('click', startMetronome);
    btnStop.addEventListener('click', stopMetronome);
    btnMinus.addEventListener('click', () => changeBpm(-10));
    btnPlus.addEventListener('click', () => changeBpm(10));

    // Inicializar
    updateBpmDisplay();

    // Limpieza
    onCleanup(() => {
        clearInterval(timerInterval);
        btnStart.removeEventListener('click', startMetronome);
        btnStop.removeEventListener('click', stopMetronome);
        btnMinus.removeEventListener('click', () => changeBpm(-10));
        btnPlus.removeEventListener('click', () => changeBpm(10));
    });
};