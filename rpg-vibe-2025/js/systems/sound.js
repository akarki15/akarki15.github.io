/**
 * Pahadi Tales - Immersive Sound System
 * Procedural music with Indian/Himalayan themes
 */

export const SoundSystem = {
    ctx: null,
    masterGain: null,
    musicGain: null,
    sfxGain: null,
    enabled: false,

    // Music State
    isPlaying: false,
    currentTheme: 'cozy',
    melodyInterval: null,
    droneOsc: null,
    ambienceNodes: [],

    // Config
    volume: { music: 0.25, sfx: 0.4 },

    // Musical Scales (Indian Ragas)
    scales: {
        // Raga Yaman (evening, peaceful) - Sa Re Ga Ma Pa Dha Ni
        yaman: [261.63, 293.66, 329.63, 369.99, 392.00, 440.00, 493.88, 523.25],
        // Raga Bhairav (morning, devotional)
        bhairav: [261.63, 277.18, 329.63, 349.23, 392.00, 415.30, 493.88, 523.25],
        // Raga Bhoopali (sweet, simple) - pentatonic
        bhoopali: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25],
        // Forest mystery scale (minor pentatonic)
        forest: [261.63, 311.13, 349.23, 392.00, 466.16, 523.25],
        // Temple bells
        temple: [523.25, 659.25, 783.99, 880.00, 1046.50]
    },

    // Melodies for different areas
    themes: {
        cozy: {
            scale: 'bhoopali',
            tempo: 100,
            noteProb: 0.6,
            restProb: 0.3,
            drone: 130.81, // C3
            hasAmbience: false
        },
        village: {
            scale: 'yaman',
            tempo: 110,
            noteProb: 0.7,
            restProb: 0.2,
            drone: 146.83, // D3
            hasAmbience: true,
            ambienceType: 'birds'
        },
        forest: {
            scale: 'forest',
            tempo: 80,
            noteProb: 0.5,
            restProb: 0.4,
            drone: 98.00, // G2
            hasAmbience: true,
            ambienceType: 'wind'
        },
        temple: {
            scale: 'bhairav',
            tempo: 70,
            noteProb: 0.4,
            restProb: 0.5,
            drone: 130.81, // C3
            hasAmbience: true,
            ambienceType: 'bells'
        }
    },

    init() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();

            // Master Bus
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 1.0;
            this.masterGain.connect(this.ctx.destination);

            // Music Bus with compression for warmth
            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = this.volume.music;

            // Add a subtle low-pass filter for warmth
            this.musicFilter = this.ctx.createBiquadFilter();
            this.musicFilter.type = 'lowpass';
            this.musicFilter.frequency.value = 3000;
            this.musicFilter.Q.value = 0.7;

            this.musicGain.connect(this.musicFilter);
            this.musicFilter.connect(this.masterGain);

            // SFX Bus
            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = this.volume.sfx;
            this.sfxGain.connect(this.masterGain);

            this.enabled = true;
            console.log('🎵 Pahadi Sound System Initialized (Indian Raga Mode)');
        } catch (e) {
            console.warn('Sound System failed to init:', e);
        }
    },

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    // ========================================================
    // MAIN MUSIC SYSTEM
    // ========================================================

    startMusic(themeName = 'cozy') {
        if (!this.enabled) return;
        this.resume();

        if (this.isPlaying) this.stopMusic();

        this.currentTheme = themeName;
        this.isPlaying = true;

        const theme = this.themes[themeName] || this.themes.cozy;

        // Start the drone (tanpura-like)
        this.startDrone(theme.drone);

        // Start melody
        this.startMelody(theme);

        // Start ambience if applicable
        if (theme.hasAmbience) {
            this.startAmbience(theme.ambienceType);
        }
    },

    stopMusic() {
        this.isPlaying = false;

        // Stop drone
        if (this.droneOsc) {
            try { this.droneOsc.stop(); } catch (e) { }
            this.droneOsc = null;
        }

        // Stop melody
        if (this.melodyInterval) {
            clearInterval(this.melodyInterval);
            this.melodyInterval = null;
        }

        // Stop ambience
        this.stopAmbience();
    },

    // Tanpura-style drone
    startDrone(freq) {
        if (!this.ctx) return;

        const droneGain = this.ctx.createGain();
        droneGain.gain.value = 0.08;
        droneGain.connect(this.musicGain);

        // Multiple detuned oscillators for rich drone
        const oscs = [];
        const detunes = [0, 5, -5, 12]; // Slight detuning + octave

        detunes.forEach(detune => {
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            osc.detune.value = detune;

            const oscGain = this.ctx.createGain();
            oscGain.gain.value = detune === 12 ? 0.3 : 0.5;

            osc.connect(oscGain);
            oscGain.connect(droneGain);
            osc.start();
            oscs.push(osc);
        });

        // Add a subtle pulsing (throbbing effect)
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.3; // Slow pulse
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 0.02;
        lfo.connect(lfoGain);
        lfoGain.connect(droneGain.gain);
        lfo.start();

        this.droneOsc = { stop: () => { oscs.forEach(o => o.stop()); lfo.stop(); } };
    },

    startMelody(theme) {
        const scale = this.scales[theme.scale] || this.scales.bhoopali;
        const beatTime = 60000 / theme.tempo;

        let lastNote = scale[0];

        this.melodyInterval = setInterval(() => {
            if (!this.isPlaying) return;

            const rand = Math.random();

            if (rand < theme.restProb) {
                // Rest - do nothing
                return;
            }

            if (rand < theme.restProb + theme.noteProb) {
                // Play a note - prefer stepwise motion for melodic feel
                const currentIndex = scale.indexOf(lastNote);
                let newIndex;

                if (Math.random() < 0.7) {
                    // Step up or down
                    const step = Math.random() < 0.5 ? 1 : -1;
                    newIndex = Math.max(0, Math.min(scale.length - 1, currentIndex + step));
                } else {
                    // Jump
                    newIndex = Math.floor(Math.random() * scale.length);
                }

                const note = scale[newIndex];
                lastNote = note;

                // Vary the duration
                const duration = Math.random() < 0.3 ? beatTime * 2 : beatTime;

                this.playMelodyNote(note, duration / 1000);
            }
        }, beatTime / 2);
    },

    playMelodyNote(freq, duration) {
        if (!this.ctx || !this.isPlaying) return;

        const t = this.ctx.currentTime;

        // Main note (sitar-like with overtones)
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Main tone
        osc1.type = 'triangle';
        osc1.frequency.value = freq;

        // Overtone for brightness
        osc2.type = 'sine';
        osc2.frequency.value = freq * 2.02; // Slightly detuned octave

        const osc2Gain = this.ctx.createGain();
        osc2Gain.gain.value = 0.15;

        osc1.connect(gain);
        osc2.connect(osc2Gain);
        osc2Gain.connect(gain);
        gain.connect(this.musicGain);

        // Plucky envelope (sitar-like attack)
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.35, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.15, t + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, t + duration);

        // Pitch bend (subtle meend/glide)
        osc1.frequency.setValueAtTime(freq * 0.97, t);
        osc1.frequency.linearRampToValueAtTime(freq, t + 0.05);

        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + duration + 0.1);
        osc2.stop(t + duration + 0.1);
    },

    // ========================================================
    // AMBIENCE SYSTEM
    // ========================================================

    startAmbience(type) {
        if (!this.ctx) return;

        switch (type) {
            case 'birds':
                this.startBirdAmbience();
                break;
            case 'wind':
                this.startWindAmbience();
                break;
            case 'bells':
                this.startBellAmbience();
                break;
        }
    },

    stopAmbience() {
        this.ambienceNodes.forEach(node => {
            try { node.stop(); } catch (e) { }
        });
        this.ambienceNodes = [];
    },

    startBirdAmbience() {
        const chirpInterval = setInterval(() => {
            if (!this.isPlaying) {
                clearInterval(chirpInterval);
                return;
            }
            if (Math.random() < 0.3) this.playBirdChirp();
        }, 2000 + Math.random() * 3000);

        this.ambienceNodes.push({ stop: () => clearInterval(chirpInterval) });
    },

    playBirdChirp() {
        const t = this.ctx.currentTime;
        const baseFreq = 1500 + Math.random() * 500;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, t);
        osc.frequency.linearRampToValueAtTime(baseFreq * 1.3, t + 0.05);
        osc.frequency.linearRampToValueAtTime(baseFreq * 0.9, t + 0.15);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.08, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(t);
        osc.stop(t + 0.25);
    },

    startWindAmbience() {
        // White noise filtered for wind
        const bufferSize = 2 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;

        const gain = this.ctx.createGain();
        gain.gain.value = 0.05;

        // Slow modulation for wind gusts
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.1;
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 0.03;
        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        lfo.start();
        noise.start();

        this.ambienceNodes.push(noise, lfo);
    },

    startBellAmbience() {
        const bellInterval = setInterval(() => {
            if (!this.isPlaying) {
                clearInterval(bellInterval);
                return;
            }
            if (Math.random() < 0.2) this.playTempleBell();
        }, 4000 + Math.random() * 4000);

        this.ambienceNodes.push({ stop: () => clearInterval(bellInterval) });
    },

    playTempleBell() {
        const t = this.ctx.currentTime;
        const freqs = [800, 1200, 1600, 2000]; // Bell harmonics

        freqs.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            const amp = 0.1 / (i + 1);
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(amp, t + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 3);

            osc.connect(gain);
            gain.connect(this.musicGain);
            osc.start(t);
            osc.stop(t + 3);
        });
    },

    // ========================================================
    // THEME SWITCHING (based on area)
    // ========================================================

    setTheme(areaId) {
        let theme = 'cozy';

        if (areaId === 'village_square' || areaId === 'wool_market') {
            theme = 'village';
        } else if (areaId === 'pine_forest' || areaId === 'deep_forest' || areaId === 'ancient_ruins') {
            theme = 'forest';
        } else if (areaId === 'temple_hill' || areaId === 'mountain_peak') {
            theme = 'temple';
        } else if (areaId === 'tea_house') {
            theme = 'cozy';
        }

        if (theme !== this.currentTheme) {
            this.startMusic(theme);
        }
    },

    // ========================================================
    // SOUND EFFECTS
    // ========================================================

    playSfx(type) {
        if (!this.enabled) return;
        this.resume();

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);

        switch (type) {
            case 'step':
                // Soft footstep
                osc.type = 'sine';
                osc.frequency.setValueAtTime(150, t);
                osc.frequency.exponentialRampToValueAtTime(80, t + 0.06);
                gain.gain.setValueAtTime(0.12, t);
                gain.gain.linearRampToValueAtTime(0, t + 0.06);
                osc.start(t);
                osc.stop(t + 0.06);
                break;

            case 'talk':
                // Chipmunk chirp with variation
                const talkFreq = 700 + Math.random() * 400;
                osc.type = 'sine';
                osc.frequency.setValueAtTime(talkFreq, t);
                osc.frequency.linearRampToValueAtTime(talkFreq * 1.4, t + 0.08);
                osc.frequency.linearRampToValueAtTime(talkFreq * 0.9, t + 0.12);
                gain.gain.setValueAtTime(0.18, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
                osc.start(t);
                osc.stop(t + 0.15);
                break;

            case 'ui':
            case 'click':
                // Pleasant menu click
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(660, t);
                gain.gain.setValueAtTime(0.12, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
                osc.start(t);
                osc.stop(t + 0.1);
                break;

            case 'collect':
                // Satisfying collection chime (arpeggio)
                const collectFreqs = [523, 659, 784, 1047];
                collectFreqs.forEach((freq, i) => {
                    const o = this.ctx.createOscillator();
                    const g = this.ctx.createGain();
                    o.type = 'sine';
                    o.frequency.value = freq;
                    g.gain.setValueAtTime(0, t + i * 0.05);
                    g.gain.linearRampToValueAtTime(0.2, t + i * 0.05 + 0.02);
                    g.gain.exponentialRampToValueAtTime(0.01, t + i * 0.05 + 0.4);
                    o.connect(g);
                    g.connect(this.sfxGain);
                    o.start(t + i * 0.05);
                    o.stop(t + i * 0.05 + 0.5);
                });
                break;

            case 'success':
                // Quest complete fanfare
                const successFreqs = [523, 659, 784, 1047, 1319];
                successFreqs.forEach((freq, i) => {
                    const o = this.ctx.createOscillator();
                    const g = this.ctx.createGain();
                    o.type = 'triangle';
                    o.frequency.value = freq;
                    g.gain.setValueAtTime(0, t + i * 0.1);
                    g.gain.linearRampToValueAtTime(0.25, t + i * 0.1 + 0.03);
                    g.gain.exponentialRampToValueAtTime(0.01, t + i * 0.1 + 0.6);
                    o.connect(g);
                    g.connect(this.sfxGain);
                    o.start(t + i * 0.1);
                    o.stop(t + i * 0.1 + 0.7);
                });
                break;

            case 'error':
            case 'denied':
                // Low buzz
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, t);
                osc.frequency.linearRampToValueAtTime(100, t + 0.2);
                gain.gain.setValueAtTime(0.15, t);
                gain.gain.linearRampToValueAtTime(0, t + 0.2);
                osc.start(t);
                osc.stop(t + 0.2);
                break;

            case 'door':
            case 'transition':
                // Whoosh
                osc.type = 'sine';
                osc.frequency.setValueAtTime(200, t);
                osc.frequency.exponentialRampToValueAtTime(800, t + 0.2);
                osc.frequency.exponentialRampToValueAtTime(100, t + 0.4);
                gain.gain.setValueAtTime(0.15, t);
                gain.gain.linearRampToValueAtTime(0.08, t + 0.2);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
                osc.start(t);
                osc.stop(t + 0.45);
                break;
        }
    },

    setVolume(type, val) {
        if (type === 'music' && this.musicGain) this.musicGain.gain.value = val;
        if (type === 'sfx' && this.sfxGain) this.sfxGain.gain.value = val;
        this.volume[type] = val;
    }
};
