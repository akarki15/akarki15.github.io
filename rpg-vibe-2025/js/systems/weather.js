export const WeatherSystem = {
    active: 'clear', // clear, rain, snow
    particles: [],
    timer: 0,

    // Config
    types: {
        rain: { count: 100, speedY: 15, speedX: -2, color: 'rgba(150, 180, 255, 0.6)', size: 2 },
        snow: { count: 80, speedY: 3, speedX: 1, color: 'rgba(255, 255, 255, 0.8)', size: 3 },
        fireflies: { count: 30, speedY: -0.5, speedX: 0.5, color: 'rgba(255, 255, 100, 0.8)', size: 4 } // For night
    },

    init() {
        this.particles = [];
        // Start generic clear
        this.setWeather('clear');
    },

    setWeather(type) {
        this.active = type;
        this.particles = [];
        const config = this.types[type];
        if (!config) return;

        for (let i = 0; i < config.count; i++) {
            this.particles.push({
                x: Math.random() * 800,
                y: Math.random() * 600,
                speedY: config.speedY * (0.8 + Math.random() * 0.4),
                speedX: config.speedX * (0.8 + Math.random() * 0.4),
                size: config.size * (0.8 + Math.random() * 0.4),
                offset: Math.random() * 100 // For waviness
            });
        }
    },

    update(dt) {
        // Auto-change weather occasionally or based on area?
        this.timer += dt;

        // Simulating some random weather changes
        if (this.timer > 30000) { // Every 30s check
            this.timer = 0;
            // Simple logic: Rain in afternoon, Fireflies at night
            const hour = window.TimeSystem?.hour || 12;
            if (hour >= 19 || hour < 5) {
                if (this.active !== 'fireflies') this.setWeather('fireflies');
            } else if (Math.random() > 0.7) {
                this.setWeather('rain');
            } else {
                this.setWeather('clear');
            }
        }

        if (this.active === 'clear') return;

        const config = this.types[this.active];
        for (let p of this.particles) {
            p.y += p.speedY;
            p.x += p.speedX;

            // Wobbly movement for snow/fireflies
            if (this.active === 'snow' || this.active === 'fireflies') {
                p.x += Math.sin(p.y * 0.05 + p.offset) * 0.5;
            }

            // Wrap around
            if (p.y > 600) p.y = -10;
            if (p.y < -10) p.y = 600;
            if (p.x > 800) p.x = -10;
            if (p.x < -10) p.x = 800;
        }
    },

    draw(ctx) {
        if (this.active === 'clear') return;

        ctx.fillStyle = this.types[this.active].color;

        for (let p of this.particles) {
            if (this.active === 'rain') {
                // Draw streaks
                ctx.fillRect(p.x, p.y, 1, p.size * 5);
            } else {
                // Draw circles
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
};
