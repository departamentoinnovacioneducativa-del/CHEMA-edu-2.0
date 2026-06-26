    // --- 4. SISTEMA DE CARGA DE HERRAMIENTAS ---
    
    // Variable para limpiar intervalos al cerrar la herramienta
    let currentToolCleanup = null;

    // Registro de herramientas (Aquí iremos añadiendo las demás)
    const toolComponents = {
        cronometro: {
            render: () => `
                <div class="crono-container">
                    <div class="crono-display" id="crono-display">00:00.00</div>
                    <div class="crono-controls">
                        <button class="btn-retro btn-green" id="crono-start">▶ INICIAR</button>
                        <button class="btn-retro btn-yellow" id="crono-pause" disabled>⏸ PAUSA</button>
                        <button class="btn-retro btn-danger" id="crono-reset">↺ REINICIAR</button>
                    </div>
                </div>
            `,
            init: () => initCronometro() // Llama a la función inicializadora
        }
    };

    // Escuchar clics en las tarjetas
    document.querySelectorAll('.tool-card[data-tool]').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            initAudio();
            sfx.click();
            loadTool(card.dataset.tool);
        });
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                initAudio();
                sfx.click();
                loadTool(card.dataset.tool);
            }
        });
    });

    const loadTool = (toolId) => {
        const toolName = toolId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const tool = toolComponents[toolId]; // Busca si la herramienta existe en nuestro registro
        
        let bodyContent = '';

        if (tool) {
            bodyContent = tool.render(); // Si existe, usa su HTML
        } else {
            // Si no existe aún, muestra el placeholder
            bodyContent = `
                <p>¡Aquí se cargará la interfaz dinámica de <strong>${toolName}</strong>!</p>
                <p>Pronto podrás interactuar con ella.</p>
            `;
        }

        toolPanel.innerHTML = `
            <div class="tool-loaded">
                <div class="tool-loaded__header">
                    <h3 class="section-title">🛠️ ${toolName}</h3>
                    <button class="btn-retro btn-yellow btn-close-tool" data-action="close">CERRAR ✖</button>
                </div>
                <div class="tool-loaded__body">
                    ${bodyContent}
                </div>
            </div>
        `;

        // Añadir evento al botón de cerrar
        toolPanel.querySelector('.btn-close-tool').addEventListener('click', closeTool);

        // Si la herramienta tiene función de inicialización, la ejecutamos
        if (tool && tool.init) {
            tool.init();
        }

        // Efectos visuales y sonido
        createExplosion(window.innerWidth / 2, window.innerHeight / 3);
        sfx.success();
        
        toolPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const closeTool = () => {
        if (currentToolCleanup) {
            currentToolCleanup(); // Limpia intervalos o listeners si existen
            currentToolCleanup = null;
        }
        sfx.close();
        toolPanel.innerHTML = `
            <div class="tool-panel__empty-state">
                <span class="tool-panel__empty-icon">🕹️</span>
                <p>Selecciona una herramienta para empezar a jugar</p>
            </div>
        `;
    };