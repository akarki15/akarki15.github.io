export const SpriteGenerator = {
    generate() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const config = {
            tileSize: 32,
            rows: 15, // Increased rows for more assets
            cols: 8   // Increased cols
        };

        canvas.width = config.cols * config.tileSize;
        canvas.height = config.rows * config.tileSize;

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Helper to draw a rect (1px)
        const p = (x, y, color) => {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, 1, 1);
        };

        const rect = (x, y, w, h, color) => {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, w, h);
        };

        // Helper: Draw 32x32 grid from string array (or 16x16 scaled 2x)
        // We will do procedural drawing for better results

        // ==========================================
        // TERRAIN (Row 0-1)
        // ==========================================

        // 1. Grass (Detailed noise)
        // 0,0
        const drawGrass = (ox, oy) => {
            rect(ox, oy, 32, 32, '#4CAF50'); // Base
            for (let i = 0; i < 40; i++) {
                const x = Math.random() * 32;
                const y = Math.random() * 32;
                p(ox + x, oy + y, Math.random() > 0.5 ? '#66BB6A' : '#388E3C');
            }
            // Grass blades
            ctx.fillStyle = '#2E7D32';
            for (let i = 0; i < 10; i++) {
                const x = Math.floor(Math.random() * 30);
                const y = Math.floor(Math.random() * 28);
                ctx.fillRect(ox + x, oy + y, 1, 3);
                ctx.fillRect(ox + x + 1, oy + y + 1, 1, 3);
            }
        };
        drawGrass(0, 0);

        // 2. Path (Dirt with stones)
        // 32,0
        const drawPath = (ox, oy) => {
            rect(ox, oy, 32, 32, '#795548');
            for (let i = 0; i < 50; i++) {
                p(ox + Math.random() * 32, oy + Math.random() * 32, '#5D4037');
            }
            // Stones
            for (let i = 0; i < 5; i++) {
                const x = Math.random() * 28;
                const y = Math.random() * 28;
                rect(ox + x, oy + y, 3, 2, '#8D6E63');
            }
        };
        drawPath(32, 0);

        // 3. Water (Animated waves look)
        // 64,0
        const drawWater = (ox, oy) => {
            rect(ox, oy, 32, 32, '#29B6F6'); // Light Blue
            ctx.fillStyle = '#0288D1';
            for (let y = 2; y < 32; y += 4) {
                for (let x = 0; x < 32; x += 8) {
                    if ((y / 4) % 2 === 0) rect(ox + x, oy + y, 4, 1, '#0288D1');
                    else rect(ox + x + 4, oy + y, 4, 1, '#0288D1');
                }
            }
            // Sparkles
            rect(ox + 5, oy + 5, 2, 2, '#E1F5FE');
            rect(ox + 20, oy + 15, 2, 2, '#E1F5FE');
        };
        drawWater(64, 0);

        // 4. Snow
        // 96,0
        drawGrass(96, 0); // Base texture
        rect(96, 0, 32, 32, '#ECEFF1'); // Cover with white
        for (let i = 0; i < 20; i++) p(96 + Math.random() * 32, Math.random() * 32, '#CFD8DC');

        // ==========================================
        // PROPS (Row 1) (Sideways / 3/4 View)
        // ==========================================

        // Tree (0, 32)
        // Large detailed pine tree
        const drawTree = (ox, oy) => {
            // Trunk
            rect(ox + 12, oy + 24, 8, 8, '#5D4037');
            // Leaves (Triangles)
            const layers = 3;
            ctx.fillStyle = '#2E7D32';
            for (let l = 0; l < layers; l++) {
                const w = 24 - l * 4;
                const h = 10;
                const y = oy + 20 - l * 8;
                const x = ox + 16 - w / 2;

                ctx.beginPath();
                ctx.moveTo(x, y + h);
                ctx.lineTo(x + w / 2, y);
                ctx.lineTo(x + w, y + h);
                ctx.fill();

                // Shading
                ctx.fillStyle = '#1B5E20';
                ctx.fillRect(x + w / 2, y + 2, 2, h - 2);
                ctx.fillStyle = '#2E7D32';
            }
        };
        drawTree(0, 32);

        // Rock (32, 32)
        const drawRock = (ox, oy) => {
            ctx.beginPath();
            ctx.fillStyle = '#757575';
            ctx.arc(ox + 16, oy + 20, 10, 0, Math.PI * 2);
            ctx.fill();
            // Highlight
            ctx.beginPath();
            ctx.fillStyle = '#BDBDBD';
            ctx.arc(ox + 14, oy + 18, 6, 0, Math.PI * 2);
            ctx.fill();
        };
        drawRock(32, 32);

        // Bush (64, 32)
        const drawBush = (ox, oy) => {
            ctx.fillStyle = '#43A047';
            ctx.beginPath();
            ctx.arc(ox + 10, oy + 20, 8, 0, Math.PI * 2);
            ctx.arc(ox + 22, oy + 20, 8, 0, Math.PI * 2);
            ctx.arc(ox + 16, oy + 14, 8, 0, Math.PI * 2);
            ctx.fill();
            // Berries
            ctx.fillStyle = '#E53935';
            rect(ox + 10, oy + 15, 2, 2, '#E53935');
            rect(ox + 20, oy + 18, 2, 2, '#E53935');
            rect(ox + 15, oy + 22, 2, 2, '#E53935');
        };
        drawBush(64, 32);

        // Wall (96, 32)
        const drawWall = (ox, oy) => {
            rect(ox, oy, 32, 32, '#A1887F');
            // Bricks
            ctx.fillStyle = '#8D6E63';
            for (let y = 0; y < 32; y += 8) {
                rect(ox, oy + y, 32, 1, '#5D4037');
                for (let x = 0; x < 32; x += 16) {
                    rect(ox + x + (y % 16 == 0 ? 0 : 8), oy + y, 1, 8, '#5D4037');
                }
            }
        };
        drawWall(96, 32);

        // ==========================================
        // CHARACTERS (Detailed 32x32)
        // ==========================================

        // Helper to draw a detailed character
        // Status: 32px tall. Head 12px, Body 12px, Legs 8px.
        const drawChar = (ox, oy, skin, hair, shirt, pants, type = 'man') => {
            // Legs
            rect(ox + 10, oy + 22, 4, 10, pants);
            rect(ox + 18, oy + 22, 4, 10, pants);

            // Body
            rect(ox + 8, oy + 12, 16, 12, shirt);
            // Arms
            rect(ox + 4, oy + 12, 4, 10, skin); // Left arm
            rect(ox + 24, oy + 12, 4, 10, skin); // Right arm
            // Sleeves
            rect(ox + 4, oy + 12, 4, 4, shirt);
            rect(ox + 24, oy + 12, 4, 4, shirt);

            // Head
            rect(ox + 8, oy + 0, 16, 14, skin);

            // Hair
            ctx.fillStyle = hair;
            rect(ox + 8, oy, 16, 4); // Top
            rect(ox + 6, oy + 2, 2, 10); // Side L
            rect(ox + 24, oy + 2, 2, 10); // Side R
            if (type === 'woman') {
                rect(ox + 6, oy + 4, 20, 12); // Long hair
            }

            // Face
            rect(ox + 12, oy + 6, 2, 2, '#000'); // Eye L
            rect(ox + 18, oy + 6, 2, 2, '#000'); // Eye R
            rect(ox + 14, oy + 10, 4, 1, '#D99'); // Blush?
        };

        const drawCharAnim = (row, skin, hair, shirt, pants, type) => {
            for (let f = 0; f < 4; f++) {
                const ox = f * 32;
                const oy = row * 32;
                // Bobbing anim
                const bob = (f === 1 || f === 3) ? -1 : 0;
                drawChar(ox, oy + bob, skin, hair, shirt, pants, type);
            }
        };

        // Row 2-5: Player
        drawCharAnim(2, '#FFCC80', '#3E2723', '#F44336', '#1A237E', 'man'); // Down
        drawCharAnim(3, '#FFCC80', '#3E2723', '#B71C1C', '#1A237E', 'man'); // Up (Fake back)
        drawCharAnim(4, '#FFCC80', '#3E2723', '#F44336', '#1A237E', 'man'); // Left
        drawCharAnim(5, '#FFCC80', '#3E2723', '#F44336', '#1A237E', 'man'); // Right

        // NPCs
        // Row 6: Villager Woman (Pink)
        drawCharAnim(6, '#F8BBD0', '#263238', '#E91E63', '#880E4F', 'woman');
        // Row 7: Old Woman (Grey)
        drawCharAnim(7, '#D7CCC8', '#BDBDBD', '#795548', '#3E2723', 'woman');
        // Row 8: Man (Blue)
        drawCharAnim(8, '#FFCC80', '#212121', '#2196F3', '#0D47A1', 'man');

        // Pets
        // Row 9: Dog
        const drawDog = (ox, oy) => {
            rect(ox + 8, oy + 16, 16, 8, '#D7CCC8'); // Body
            rect(ox + 20, oy + 10, 8, 8, '#D7CCC8'); // Head
            rect(ox + 26, oy + 12, 4, 4, '#3E2723'); // Ears
            rect(ox + 8, oy + 24, 4, 6, '#A1887F'); // Leg L
            rect(ox + 18, oy + 24, 4, 6, '#A1887F'); // Leg R
        };
        for (let f = 0; f < 4; f++) drawDog(f * 32, 9 * 32);

        return canvas.toDataURL();
    }
};
