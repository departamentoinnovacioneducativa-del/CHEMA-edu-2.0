// ruleta.js

export const render = () => `
    <div class="ruleta-container">
        <div class="ruleta-layout">
            <div class="ruleta-canvas-wrapper">
                <div class="ruleta-pointer">▼</div>
                <canvas id="ruleta-canvas" width="320" height="320"></canvas>
            </div>
            <div class="ruleta-winner" id="ruleta-winner">¡A girar!</div>
        </div>

        <div class="ruleta-controls">
            <div class="ruleta-input-group">
                <input type="text" id="ruleta-option-input" class="expo-input" placeholder="Escribe un nombre..." maxlength="20">
                <button class="btn-retro btn-small btn-preset" id="ruleta-add-btn">AÑADIR</button>
            </div>
            
            <div class="ruleta-list-wrapper">
                <ul class="ruleta-list" id="ruleta-list"></ul>
            </div>

            <button class="btn-retro btn-green btn-spin" id="ruleta-spin-btn">🎡 ¡GIRAR!</button>
        </div>
    </div>
`;

export const init = ({ sfx, onCleanup }) => {
    const canvas = document.getElementById('ruleta-canvas');
    const ctxCanvas = canvas.getContext('2d');
    const spinBtn = document.getElementById('ruleta-spin-btn');
    const addBtn = document.getElementById('ruleta-add-btn');
    const input = document.getElementById('ruleta-option-input');
    const list = document.getElementById('ruleta-list');
    const winnerDisplay = document.getElementById('ruleta-winner');

    if (!canvas || !spinBtn) return;

    // Colores retro para los segmentos
    const segmentColors = ['#00aa44', '#ffc800', '#cc2222', '#1a3270', '#ff6b81', '#00cc55', '#cc9f00', '#8a2be2'];

    // Estado inicial
    let items = ['Equipo 1', 'Equipo 2', 'Equipo 3', 'Equipo 4'];
    let currentAngle = 0;
    let spinVelocity = 0;
    let isSpinning = false;
    let animationId = null;
    let lastSegmentIndex = -1;

    // Dibujar la ruleta
    const drawWheel = () => {
        const numItems = items.length;
        if (numItems === 0) {
            ctxCanvas.clearRect(0, 0, canvas.width, canvas.height);
            ctxCanvas.fillStyle = '#1a3270';
            ctxCanvas.fillRect(0, 0, canvas.width, canvas.height);
            ctxCanvas.fillStyle = '#8a9bc0';
            ctxCanvas.font = '20px "Press Start 2P"';
            ctxCanvas.textAlign = 'center';
            ctxCanvas.fillText('Añade opciones', canvas.width/2, canvas.height/2);
            return;
        }

        const arcSize = (2 * Math.PI) / numItems;
        const radius = canvas.width / 2 - 10;

        ctxCanvas.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < numItems; i++) {
            const angle = currentAngle + i * arcSize;

            // Dibujar segmento
            ctxCanvas.beginPath();
            ctxCanvas.fillStyle = segmentColors[i % segmentColors.length];
            ctxCanvas.moveTo(canvas.width / 2, canvas.height / 2);
            ctxCanvas.arc(canvas.width / 2, canvas.height / 2, radius, angle, angle + arcSize);
            ctxCanvas.lineTo(canvas.width / 2, canvas.height / 2);
            ctxCanvas.fill();
            ctxCanvas.strokeStyle = '#060e24';
            ctxCanvas.lineWidth = 3;
            ctxCanvas.stroke();

            // Dibujar texto
            ctxCanvas.save();
            ctxCanvas.translate(canvas.width / 2, canvas.height / 2);
            ctxCanvas.rotate(angle + arcSize / 2);
            ctxCanvas.fillStyle = '#ffffff';
            ctxCanvas.font = '14px "Press Start 2P"';
            ctxCanvas.textAlign = 'right';
            ctxCanvas.fillText(items[i], radius - 20, 5);
            ctxCanvas.restore();
        }
    };

    // Lógica de animación
    const spinLoop = () => {
        if (!isSpinning) return;

        currentAngle += spinVelocity;
        spinVelocity *= 0.985; // Fricción (desaceleración)

        // Lógica para el sonido del ticker (cuando pasa de un segmento a otro)
        if (items.length > 0) {
            const arcSize = (2 * Math.PI) / items.length;
            const normalizedAngle = currentAngle % (2 * Math.PI);
            const currentSegmentIndex = Math.floor(normalizedAngle / arcSize);
            
            if (currentSegmentIndex !== lastSegmentIndex) {
                sfx.tick();
                lastSegmentIndex = currentSegmentIndex;
            }
        }

        // Detener la ruleta
        if (spinVelocity < 0.002) {
            isSpinning = false;
            spinVelocity = 0;
            determineWinner();
            return;
        }

        drawWheel();
        animationId = requestAnimationFrame(spinLoop);
    };

    const determineWinner = () => {
        if (items.length === 0) return;
        const arcSize = (2 * Math.PI) / items.length;
        // El puntero está arriba (270 grados o 1.5 * PI). Calculamos qué segmento está ahí.
        const normalizedAngle = ((currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const winningIndex = Math.floor(((2 * Math.PI) - normalizedAngle) / arcSize) % items.length;
        
        winnerDisplay.textContent = `🏆 ${items[winningIndex]}`;
        winnerDisplay.classList.add('winner-active');
        sfx.success();
        spinBtn.disabled = false;
    };

    const startSpin = () => {
        if (isSpinning || items.length === 0) return;
        
        isSpinning = true;
        winnerDisplay.textContent = '...';
        winnerDisplay.classList.remove('winner-active');
        spinVelocity = Math.random() * 0.3 + 0.3; // Velocidad inicial aleatoria
        lastSegmentIndex = -1;
        spinBtn.disabled = true;
        spinLoop();
    };

    // Gestión de la lista de nombres
    const renderList = () => {
        list.innerHTML = '';
        items.forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${item}</span> <button class="btn-retro btn-small btn-danger ruleta-delete-btn" data-index="${index}">✖</button>`;
            list.appendChild(li);
        });
        drawWheel();
    };

    const addItem = () => {
        const newItem = input.value.trim();
        if (newItem && items.length < 12) { // Máximo 12 segmentos para que se lea bien
            items.push(newItem);
            input.value = '';
            renderList();
            sfx.click();
        }
    };

    const removeItem = (e) => {
        if (e.target.classList.contains('ruleta-delete-btn')) {
            const index = parseInt(e.target.dataset.index);
            items.splice(index, 1);
            renderList();
            sfx.click();
        }
    };

    // Event Listeners
    spinBtn.addEventListener('click', startSpin);
    addBtn.addEventListener('click', addItem);
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') addItem(); });
    list.addEventListener('click', removeItem);

    // Inicializar
    renderList();

    // Limpieza
    onCleanup(() => {
        if (animationId) cancelAnimationFrame(animationId);
        isSpinning = false;
        spinBtn.removeEventListener('click', startSpin);
        addBtn.removeEventListener('click', addItem);
    });
};