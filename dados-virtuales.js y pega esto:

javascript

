// dados-virtuales.js

// Función auxiliar para dibujar los puntos del dado
const getDieFace = (value) => {
    // Posiciones en una cuadrícula 3x3 (1 a 9)
    // 1 2 3
    // 4 5 6
    // 7 8 9
    const layouts = {
        1: [5],
        2: [3, 7],
        3: [3, 5, 7],
        4: [1, 3, 7, 9],
        5: [1, 3, 5, 7, 9],
        6: [1, 4, 3, 6, 7, 9] // Lado izquierdo (1,4,7) y derecho (3,6,9)
    };

    let html = '';
    for (let i = 1; i <= 9; i++) {
        if (layouts[value].includes(i)) {
            html += '<div class="die-dot"></div>';
        } else {
            html += '<div></div>'; // Celda vacía
        }
    }
    return html;
};

export const render = () => `
    <div class="crono-container dados-container">
        <div class="dice-config">
            <button class="btn-retro btn-small btn-preset" id="btn-1-die">1 DADO</button>
            <button class="btn-retro btn-small btn-preset active-dice-btn" id="btn-2-die">2 DADOS</button>
        </div>

        <div class="dice-tray" id="dice-tray">
            <div class="die" id="die-1">${getDieFace(Math.floor(Math.random() * 6) + 1)}</div>
            <div class="die" id="die-2">${getDieFace(Math.floor(Math.random() * 6) + 1)}</div>
        </div>

        <div class="dice-total" id="dice-total">Suma: ?</div>

        <div class="crono-controls">
            <button class="btn-retro btn-green btn-spin" id="btn-roll">🎲 ¡TIRAR DADOS!</button>
        </div>
    </div>
`;

export const init = ({ sfx, onCleanup }) => {
    const die1 = document.getElementById('die-1');
    const die2 = document.getElementById('die-2');
    const btnRoll = document.getElementById('btn-roll');
    const btn1Die = document.getElementById('btn-1-die');
    const btn2Die = document.getElementById('btn-2-die');
    const totalDisplay = document.getElementById('dice-total');

    if (!btnRoll || !die1) return;

    let numDice = 2;
    let isRolling = false;
    let rollInterval = null;

    const updateDiceVisibility = () => {
        die2.style.display = numDice === 2 ? 'grid' : 'none';
        btn1Die.classList.toggle('active-dice-btn', numDice === 1);
        btn2Die.classList.toggle('active-dice-btn', numDice === 2);
    };

    const rollDice = () => {
        if (isRolling) return;
        isRolling = true;
        btnRoll.disabled = true;

        let counter = 0;
        const rollDuration = 800; // 0.8 segundos de animación
        const rollSpeed = 80; // Cambiar cara cada 80ms

        // Añadir clase de sacudida
        die1.classList.add('die-rolling');
        if (numDice === 2) die2.classList.add('die-rolling');

        rollInterval = setInterval(() => {
            const random1 = Math.floor(Math.random() * 6) + 1;
            const random2 = Math.floor(Math.random() * 6) + 1;
            
            die1.innerHTML = getDieFace(random1);
            if (numDice === 2) die2.innerHTML = getDieFace(random2);
            
            sfx.tick(); // Sonido de cascabeleo
            counter += rollSpeed;

            if (counter >= rollDuration) {
                clearInterval(rollInterval);
                finishRoll();
            }
        }, rollSpeed);
    };

    const finishRoll = () => {
        isRolling = false;
        die1.classList.remove('die-rolling');
        die2.classList.remove('die-rolling');

        // Resultado final
        const result1 = Math.floor(Math.random() * 6) + 1;
        const result2 = Math.floor(Math.random() * 6) + 1;

        die1.innerHTML = getDieFace(result1);
        if (numDice === 2) {
            die2.innerHTML = getDieFace(result2);
            totalDisplay.textContent = `Suma: ${result1 + result2}`;
        } else {
            totalDisplay.textContent = `Resultado: ${result1}`;
        }

        sfx.success();
        btnRoll.disabled = false;
    };

    // Event Listeners
    btnRoll.addEventListener('click', rollDice);
    btn1Die.addEventListener('click', () => { numDice = 1; updateDiceVisibility(); sfx.click(); });
    btn2Die.addEventListener('click', () => { numDice = 2; updateDiceVisibility(); sfx.click(); });

    // Inicializar
    updateDiceVisibility();

    // Limpieza
    onCleanup(() => {
        clearInterval(rollInterval);
        btnRoll.removeEventListener('click', rollDice);
        btn1Die.removeEventListener('click', () => {});
        btn2Die.removeEventListener('click', () => {});
    });
};