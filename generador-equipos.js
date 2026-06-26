// generador-equipos.js

export const render = () => `
    <div class="equipos-container">
        <div class="equipos-layout">
            <div class="equipos-input-zone">
                <div class="ruleta-input-group">
                    <input type="text" id="eq-name-input" class="expo-input" placeholder="Nombre del alumno..." maxlength="20">
                    <button class="btn-retro btn-small btn-preset" id="eq-add-btn">AÑADIR</button>
                </div>
                <div class="ruleta-list-wrapper">
                    <ul class="ruleta-list" id="eq-names-list"></ul>
                </div>
            </div>

            <div class="equipos-config-zone">
                <p class="expo-label">Número de equipos:</p>
                <div class="equipos-btn-group" id="eq-team-btns">
                    <button class="btn-retro btn-small btn-preset" data-teams="2">2</button>
                    <button class="btn-retro btn-small btn-preset" data-teams="3">3</button>
                    <button class="btn-retro btn-small btn-preset active-dice-btn" data-teams="4">4</button>
                    <button class="btn-retro btn-small btn-preset" data-teams="5">5</button>
                    <button class="btn-retro btn-small btn-preset" data-teams="6">6</button>
                </div>
                
                <button class="btn-retro btn-green btn-spin" id="eq-mix-btn">🔀 ¡MEZCLAR!</button>
            </div>
        </div>

        <div class="equipos-results" id="eq-results"></div>
    </div>
`;

export const init = ({ sfx, fx, onCleanup }) => {
    const input = document.getElementById('eq-name-input');
    const addBtn = document.getElementById('eq-add-btn');
    const namesList = document.getElementById('eq-names-list');
    const teamBtnsContainer = document.getElementById('eq-team-btns');
    const mixBtn = document.getElementById('eq-mix-btn');
    const resultsDiv = document.getElementById('eq-results');

    if (!input || !mixBtn) return;

    const teamColors = ['#00aa44', '#ffc800', '#cc2222', '#1a3270', '#ff6b81', '#8a2be2'];
    let names = [];
    let numTeams = 4;
    let isShuffling = false;
    let shuffleInterval = null;

    // Renderizar la lista de nombres
    const renderNames = () => {
        namesList.innerHTML = '';
        names.forEach((name, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${name}</span> <button class="btn-retro btn-small btn-danger ruleta-delete-btn" data-index="${index}">✖</button>`;
            namesList.appendChild(li);
        });
    };

    // Añadir nombre
    const addName = () => {
        const newName = input.value.trim();
        if (newName) {
            names.push(newName);
            input.value = '';
            renderNames();
            sfx.click();
        }
    };

    // Quitar nombre
    const removeName = (e) => {
        if (e.target.classList.contains('ruleta-delete-btn')) {
            const index = parseInt(e.target.dataset.index);
            names.splice(index, 1);
            renderNames();
            sfx.click();
        }
    };

    // Seleccionar número de equipos
    const selectTeams = (e) => {
        const btn = e.target.closest('button[data-teams]');
        if (!btn) return;
        
        numTeams = parseInt(btn.dataset.teams);
        // Actualizar botón activo
        teamBtnsContainer.querySelectorAll('button').forEach(b => b.classList.remove('active-dice-btn'));
        btn.classList.add('active-dice-btn');
        sfx.click();
    };

    // Algoritmo de mezcla (Fisher-Yates)
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    // Empezar el sorteo
    const startShuffle = () => {
        if (names.length < numTeams || isShuffling) return;

        isShuffling = true;
        mixBtn.disabled = true;
        resultsDiv.innerHTML = ''; // Limpiar resultados anteriores

        let counter = 0;
        const shuffleDuration = 2000; // 2 segundos de mezcla visual

        // Efecto visual: mostrar nombres pasando rápido
        shuffleInterval = setInterval(() => {
            const randomName = names[Math.floor(Math.random() * names.length)];
            resultsDiv.innerHTML = `<div class="shuffling-name">${randomName}</div>`;
            sfx.tick();
            counter += 80;

            if (counter >= shuffleDuration) {
                clearInterval(shuffleInterval);
                generateTeams();
            }
        }, 80);
    };

    // Generar y mostrar los equipos finales
    const generateTeams = () => {
        isShuffling = false;
        mixBtn.disabled = false;

        const shuffledNames = shuffleArray([...names]);
        let teams = Array.from({ length: numTeams }, () => []);

        // Repartir nombres en los equipos
        shuffledNames.forEach((name, index) => {
            teams[index % numTeams].push(name);
        });

        // Construir HTML de resultados
        let html = '';
        teams.forEach((team, index) => {
            html += `
                <div class="team-card" style="border-color: ${teamColors[index % teamColors.length]}">
                    <h4 class="team-title" style="background-color: ${teamColors[index % teamColors.length]}">Equipo ${index + 1}</h4>
                    <ul class="team-members">
                        ${team.map(member => `<li>${member}</li>`).join('')}
                    </ul>
                </div>
            `;
        });

        resultsDiv.innerHTML = html;
        sfx.success();
        fx.createExplosion(window.innerWidth / 2, window.innerHeight / 2);
    };

    // Event Listeners
    addBtn.addEventListener('click', addName);
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') addName(); });
    namesList.addEventListener('click', removeName);
    teamBtnsContainer.addEventListener('click', selectTeams);
    mixBtn.addEventListener('click', startShuffle);

    // Limpieza
    onCleanup(() => {
        clearInterval(shuffleInterval);
        isShuffling = false;
        addBtn.removeEventListener('click', addName);
        mixBtn.removeEventListener('click', startShuffle);
    });
};