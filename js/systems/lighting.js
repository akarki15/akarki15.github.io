export const LightingSystem = {
    // Configuration for Day/Night Cycle
    // Colors are R, G, B, A (Overlay color)
    cycles: {
        0: { r: 5, g: 5, b: 20, a: 0.85 },   // Midnight (Dark Blue)
        5: { r: 20, g: 20, b: 40, a: 0.6 },  // Dawn (Lighter Blue)
        7: { r: 255, g: 200, b: 150, a: 0.2 }, // Sunrise (Golden)
        12: { r: 255, g: 255, b: 255, a: 0.0 }, // Noon (Clear)
        17: { r: 255, g: 150, b: 100, a: 0.3 }, // Sunset (Orange)
        19: { r: 10, g: 10, b: 30, a: 0.5 },   // Dusk (Blue/Purple)
        22: { r: 5, g: 5, b: 20, a: 0.8 }    // Night
    },

    // Light Sources (Flares)
    lights: [],

    init() {
        this.lights = [];
    },

    update(dt) {
        // Dynamic lights could be here (fireflies, torches)
        // For now, we clear and rebuild lights based on visible area every frame or just cache?
        // Let's just calculate dynamic overlay color
    },

    render(ctx) {
        const hour = window.TimeSystem ? window.TimeSystem.hour : 12;

        // 1. Calculate Overlay Color
        const color = this.getAmbientColor(hour);

        // 2. Draw Overlay (Multiply Mode for darkness, Standard for simple overlay)
        ctx.save();
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
        ctx.fillRect(0, 0, 800, 600); // Canvas size

        // 3. Render Lights (Cut out holes or Additive blend)
        // We'll use 'destination-out' to punch holes in the darkness for lights
        if (color.a > 0.1) {
            ctx.globalCompositeOperation = 'destination-out';

            // Player Light (Torch/lantern/aura)
            this.drawLight(ctx, window.Player.x + 16, window.Player.y + 16, 100);

            // World Lights (from interactables like campfires)
            // Accessed via WorldManager
            if (window.WorldManager) {
                const area = window.WorldManager.getCurrentArea();
                if (area && area.interactables) {
                    area.interactables.forEach(inter => {
                        // Check if this interactable emits light (e.g. fire, lamp)
                        // We can assume emoji 🔥 or specific ones do
                        if (['🔥', '💡', '🌟'].includes(inter.emoji)) {
                            const x = inter.x * 32 + 16;
                            const y = inter.y * 32 + 16;
                            // Calculate screen relative position if we had scrolling (we don't right now, it's 1:1 or managed by camera? Game checks Player.x/y directly so it assumes world fits or camera moves.)
                            // Wait, Game.js likely has a camera/viewport.
                            // Looking at WorldRenderer in game.js, it translates based on camera.
                            // We need to apply the same camera transform!
                            // For now assuming no camera or handle same translation.
                            // The simple game has no camera translation in provided logic (x,y map direct).
                            this.drawLight(ctx, x, y, 80);
                        }
                    });
                }
            }

            ctx.globalCompositeOperation = 'source-over';
        }

        ctx.restore();
    },

    getAmbientColor(hour) {
        // Find current and next keyframe
        const keys = Object.keys(this.cycles).map(Number).sort((a, b) => a - b);
        let start = keys[keys.length - 1];
        let end = keys[0];

        for (let i = 0; i < keys.length; i++) {
            if (hour >= keys[i]) {
                start = keys[i];
                end = keys[(i + 1) % keys.length];
            }
        }

        // Interpolate
        let t = 0;
        if (end > start) {
            t = (hour - start) / (end - start);
        } else {
            // Wrap around midnight
            const total = (24 - start) + end;
            const curr = hour >= start ? (hour - start) : (24 - start + hour);
            t = curr / total;
        }

        return this.lerpColor(this.cycles[start], this.cycles[end], t);
    },

    lerpColor(c1, c2, t) {
        return {
            r: Math.floor(c1.r + (c2.r - c1.r) * t),
            g: Math.floor(c1.g + (c2.g - c1.g) * t),
            b: Math.floor(c1.b + (c2.b - c1.b) * t),
            a: c1.a + (c2.a - c1.a) * t
        };
    },

    drawLight(ctx, x, y, radius) {
        // Create radial gradient
        const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
        g.addColorStop(0, 'rgba(0,0,0,1)'); // Fully clear
        g.addColorStop(1, 'rgba(0,0,0,0)'); // Fade to dark
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
};
