export const SoundSystem = {
    ctx: null,
    masterGain: null,
    musicGain: null,
    sfxGain: null,
    enabled: false,

    // Music State
    isPlaying: false,
    nextNoteTime: 0,
    currentNoteIndex: 0,
    tempo: 120,
    melody: [], // Generated

    // Config
    volume: { music: 0.3, sfx: 0.4 },

    init() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();

            // Master Bus
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 1.0;
            this.masterGain.connect(this.ctx.destination);

            // Music Bus
            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = this.volume.music;
            this.musicGain.connect(this.masterGain);

            // SFX Bus
            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = this.volume.sfx;
            this.sfxGain.connect(this.masterGain);

            this.enabled = true;
            this.generateCozyMelody();
            console.log('🎵 Sound System Initialized (Web Audio)');
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
    // PROCEDURAL MUSIC (Cozy Chipmunk Vibe)
    // ========================================================

    generateCozyMelody() {
        // C Major Pentatonic: C, D, E, G, A (High octave for cuteness)
        // Frequencies for C5 octave
        const scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];

        this.melody = [];
        for (let i = 0; i < 16; i++) {
            if (Math.random() > 0.3) {
                const note = scale[Math.floor(Math.random() * scale.length)];
                this.melody.push({ note, dur: 0.5 }); // 8th notes
            } else {
                this.melody.push({ note: null, dur: 0.5 }); // Rest
            }
        }
    },

    startMusic() {
        if (!this.enabled || this.isPlaying) return;
        this.isPlaying = true;
        this.nextNoteTime = this.ctx.currentTime;
        this.scheduler();
    },

    stopMusic() {
        this.isPlaying = false;
    },

    scheduler() {
        if (!this.isPlaying) return;

        // Schedule ahead
        while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
            this.playNote(this.melody[this.currentNoteIndex]);
            this.nextNoteTime += (60 / this.tempo) * 0.5; // Eighth note duration
            this.currentNoteIndex = (this.currentNoteIndex + 1) % this.melody.length;
        }

        // Loop
        requestAnimationFrame(() => this.scheduler());
    },

    playNote(noteObj) {
        if (!noteObj || !noteObj.note) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.musicGain);

        // "Cozy" sound: Sine or Triangle with soft envelope
        osc.type = 'triangle';
        osc.frequency.value = noteObj.note;

        // Envelope (Plucky marimba style)
        const t = this.nextNoteTime;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.5, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

        osc.start(t);
        osc.stop(t + 0.5);
    },

    // ========================================================
    // SOUND EFFECTS
    // ========================================================

    playSfx(type) {
        if (!this.enabled) return;
        this.resume(); // Ensure context is running on user interaction

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);

        switch (type) {
            case 'step':
                // Soft click/noise
                osc.type = 'sine';
                osc.frequency.setValueAtTime(150, t);
                osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);
                gain.gain.setValueAtTime(0.1, t);
                gain.gain.linearRampToValueAtTime(0, t + 0.05);
                osc.start(t);
                osc.stop(t + 0.05);
                break;

            case 'talk':
                // Chipmunk chirp! High pitch, fast frequency modulation
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800 + Math.random() * 200, t);
                osc.frequency.linearRampToValueAtTime(1200, t + 0.1);
                gain.gain.setValueAtTime(0.2, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
                osc.start(t);
                osc.stop(t + 0.1);
                break;

            case 'ui':
                // Menu blip
                osc.type = 'square';
                osc.frequency.setValueAtTime(440, t);
                gain.gain.setValueAtTime(0.1, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
                osc.start(t);
                osc.stop(t + 0.1);
                break;

            case 'collect':
                // High chime
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1200, t);
                osc.frequency.exponentialRampToValueAtTime(1800, t + 0.1);
                gain.gain.setValueAtTime(0, t);
                gain.gain.linearRampToValueAtTime(0.3, t + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
                osc.start(t);
                osc.stop(t + 0.5);
                break;

            case 'jump':
            case 'hop':
                // Slide up
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(300, t);
                osc.frequency.linearRampToValueAtTime(600, t + 0.2);
                gain.gain.setValueAtTime(0.2, t);
                gain.gain.linearRampToValueAtTime(0, t + 0.2);
                osc.start(t);
                osc.stop(t + 0.2);
                break;
        }
    },

    setVolume(type, val) {
        if (type === 'music' && this.musicGain) this.musicGain.gain.value = val;
        if (type === 'sfx' && this.sfxGain) this.sfxGain.gain.value = val;
        this.volume[type] = val;
    }
};
