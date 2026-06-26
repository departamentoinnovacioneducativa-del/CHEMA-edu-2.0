// cronometro.js

export const render = () => `
    <div class="crono-container">
        <div class="crono-display" id="crono-display">00:00.00</div>
        <div class="crono-controls">
            <button class="btn-retro btn-green" id="crono-start">▶ INICIAR</button>
            <button class="btn-retro btn-yellow" id="crono-pause" disabled>⏸ PAUSA</button>
            <button class="btn-retro btn-danger" id="crono-reset">↺ REINICIAR</button>
        </div>
    </div>
`;

export const init = ({ sfx, onCleanup }) => {
    const display = document.getElementById('crono-display');
    const btnStart = document.getElementById('crono-start');
    const btnPause = document.getElementById('crono-pause');
    const btnReset = document.getElementById('crono-reset');

    if (!display || !btnStart || !btnPause || !btnReset) return;

    let startTime = 0;
    let elapsedTime = 0;
    let timerInterval = null;

    const formatTime = (time) => {
        let minutes = Math.floor(time / 60000);
        let seconds = Math.floor((time % 60000) / 1000);
        let milliseconds = Math.floor((time % 1000) / 10);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
    };

    const startTimer = () => {
        startTime = Date.now() - elapsedTime;
        timerInterval = setInterval(() => {
            elapsedTime = Date.now() - startTime;
            display.textContent = formatTime(elapsedTime);
        }, 10);
        btnStart.disabled = true;
        btnPause.disabled = false;
        sfx.click();
    };

    const pauseTimer = () => {
        clearInterval(timerInterval);
        btnStart.disabled = false;
        btnPause.disabled = true;
        sfx.click();
    };

    const resetTimer = () => {
        clearInterval(timerInterval);
        elapsedTime = 0;
        display.textContent = '00:00.00';
        btnStart.disabled = false;
        btnPause.disabled = true;
        sfx.click();
    };

    btnStart.addEventListener('click', startTimer);
    btnPause.addEventListener('click', pauseTimer);
    btnReset.addEventListener('click', resetTimer);

    onCleanup(() => {
        clearInterval(timerInterval);
        btnStart.removeEventListener('click', startTimer);
        btnPause.removeEventListener('click', pauseTimer);
        btnReset.removeEventListener('click', resetTimer);
    });
};