/* =============================================================
   EDU CHEMA 2.o — Gestor de Audio Sintetizado (Web Audio API)
   =============================================================
   Genera efectos de sonido retro (8/16-bit) proceduralmente.
   Reutilizable en cualquier módulo (Papa Caliente, Ruleta, etc.)
   ============================================================= */

let audioCtx = null;

/** Inicializa el AudioContext (debe llamarse tras una interacción del usuario) */
function ensureContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

/**
 * Genera un "Beep" simple (onda cuadrada, muy retro).
 * @param {number} freq - Frecuencia en Hz (ej. 440 = La central)
 * @param {number} duration - Duración en segundos
 * @param {string} type - Tipo de onda ('square', 'sawtooth', 'triangle')
 * @param {number} volume - Volumen de 0 a 1
 */
function playTone(freq, duration = 0.1, type = 'square', volume = 0.15) {
    const ctx = ensureContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
}

// --- SONIDOS ESPECÍFICOS ---

/**
 * 🕐 Tick de reloj (para cronómetros y cuenta atrás).
 * @param {boolean} isDanger - Si es true, suena más agudo y grave.
 */
export function playTick(isDanger = false) {
    if (isDanger) {
        playTone(880, 0.08, 'square', 0.2);  // Agudo
        setTimeout(() => playTone(440, 0.08, 'square', 0.15), 50); // Grave rápido
    } else {
        playTone(600, 0.05, 'square', 0.1);
    }
}

/**
 * 🚨 Alarma de cuenta atrás final (bip-bip-bip rápido).
 */
export function playAlarm() {
    playTone(1000, 0.1, 'sawtooth', 0.25);
    setTimeout(() => playTone(800, 0.1, 'sawtooth', 0.2), 120);
}

/**
 * 💥 Explosión retro (Ruido blanco filtrado con decaimiento rápido).
 */
export function playExplosionSound() {
    const ctx = ensureContext();
    const bufferSize = ctx.sampleRate * 0.6; // 0.6 segundos de duración
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generar ruido blanco
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // Filtro de paso bajo que se cierra rápidamente (efecto de explosión)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);

    // Control de volumen con decaimiento
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    source.start(ctx.currentTime);
}

/**
 * 🎆 Whoosh de fuego artificial (ascendente rápido).
 */
export function playWhoosh() {
    const ctx = ensureContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.4);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    filter.Q.setValueAtTime(2, ctx.currentTime);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
}

/**
 * 🎉 Sonido de éxito/victoria (Arpegio ascendente alegre).
 */
export function playSuccess() {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // Do, Mi, Sol, Do agudo
    notes.forEach((freq, i) => {
        setTimeout(() => playTone(freq, 0.15, 'square', 0.12), i * 100);
    });
}

/**
 * ❌ Sonido de error/fallo (Bajo descendente).
 */
export function playError() {
    playTone(200, 0.15, 'sawtooth', 0.2);
    setTimeout(() => playTone(150, 0.25, 'sawtooth', 0.2), 150);
}