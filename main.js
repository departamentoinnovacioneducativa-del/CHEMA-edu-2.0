// ============================================================
// EDU CHEMA 2.0 — CEREBRO PRINCIPAL (MÓDULOS EN RAÍZ)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. SELECCIÓN DE ELEMENTOS DEL DOM ---
    const mainNav = document.getElementById('main-nav');
    const toolPanel = document.getElementById('tool-panel');
    const btnSoundToggle = document.getElementById('btn-sound-toggle');
    const btnTestFireworks = document.getElementById('btn-test-fireworks');
    const btnTestExplosion = document.getElementById('btn-test-explosion');
    const fxCanvas = document.getElementById('fx-canvas');
    const ctx = fxCanvas.getContext('2d');

    // --- 2. MOTOR DE SONIDO RETRO ---
    let audioCtx;
    let isSoundOn = true;

    const initAudio = () => {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
    };

    const playNote = (frequency, duration, type = 'square', volume = 0.1) => {
        if (!isSoundOn || !audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audio