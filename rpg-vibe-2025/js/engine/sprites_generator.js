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

        // 5. Snow
        // 96,0
        drawGrass(96, 0); // Base texture
        rect(96, 0, 32, 32, '#ECEFF1'); // Cover with white
        for (let i = 0; i < 20; i++) p(96 + Math.random() * 32, Math.random() * 32, '#CFD8DC');

        // 8. Distressed Wood (256, 0)
        // We put it at End of row 0 which has 8 cols. 32*8=256. Index 8.
        // Wait, index 5 was 96.
        // Index 0: 0, 1: 32, 2: 64, 3: 0,32 (Row 1), ...
        // Let's just put it at 128, 0 (Index 4 of Row 0)
        // Index 0=grass, 1=path, 2=water, 3=tree(r1), 4=rock(r1), 5=wall(r1)...
        // Actually the Sprite Map in game.js defines indices.
        // Let's follow Sprites map. I will add Index 8 as x=128, y=0.
        const drawWoodVariant = (ox, oy) => {
            rect(ox, oy, 32, 32, '#6D4C41');
            // Planks
            for (let i = 0; i < 32; i += 4) rect(ox, oy + i, 32, 1, '#4E342E');
            // Distressed marks
            for (let k = 0; k < 10; k++) {
                p(ox + Math.random() * 30, oy + Math.random() * 30, '#3E2723');
            }
        };
        drawWoodVariant(128, 0);

        // ==========================================
        // PROPS (Row 1) (Sideways / 3/4 View)
        // ==========================================

        // Tree (0, 32)
        const drawTree = (ox, oy) => {
            // Trunk
            rect(ox + 12, oy + 22, 8, 10, '#5D4037');
            // Roots
            rect(ox + 10, oy + 28, 2, 4, '#4E342E');
            rect(ox + 20, oy + 28, 2, 4, '#4E342E');

            // Leaves (Pixel Clusters)
            const foliage = (cx, cy, color) => {
                ctx.fillStyle = color;
                // Draw a rough circle/cloud
                rect(cx - 8, cy - 8, 16, 16);
                rect(cx - 10, cy - 4, 20, 8);
                rect(cx - 4, cy - 10, 8, 20);
            };

            // Darker bottom
            foliage(ox + 16, oy + 16, '#1B5E20');
            // Lighter top
            foliage(ox + 16, oy + 12, '#2E7D32');
            // Highlight
            rect(ox + 14, oy + 6, 4, 4, '#4CAF50');
        };
        drawTree(0, 32);

        // Rock (32, 32)
        const drawRock = (ox, oy) => {
            // Mossy Rock
            ctx.fillStyle = '#757575';
            ctx.beginPath();
            ctx.arc(ox + 16, oy + 22, 10, 0, Math.PI * 2);
            ctx.fill();
            // Moss
            ctx.fillStyle = '#4CAF50';
            rect(ox + 12, oy + 18, 4, 4);
            rect(ox + 16, oy + 20, 2, 2);
        };
        drawRock(32, 32);

        // Bush (64, 32)
        const drawBush = (ox, oy) => {
            ctx.fillStyle = '#43A047';
            rect(ox + 6, oy + 14, 20, 14);
            rect(ox + 4, oy + 18, 24, 6);
            rect(ox + 8, oy + 12, 16, 18);
            // Flowers/Berries
            ctx.fillStyle = '#F48FB1';
            rect(ox + 10, oy + 16, 2, 2);
            rect(ox + 22, oy + 20, 2, 2);
            rect(ox + 8, oy + 24, 2, 2);
        };
        drawBush(64, 32);

        // Wall (96, 32)
        const drawWall = (ox, oy) => {
            rect(ox, oy, 32, 32, '#A1887F');
            ctx.fillStyle = '#5D4037';
            // Cracked bricks
            rect(ox + 2, oy + 2, 12, 6);
            rect(ox + 16, oy + 2, 14, 6);
            rect(ox + 2, oy + 10, 8, 6);
            rect(ox + 12, oy + 10, 18, 6);
            rect(ox + 2, oy + 18, 14, 6);
            rect(ox + 18, oy + 18, 12, 6);
        };
        drawWall(96, 32);

        // Flower Pot (128, 32) - Index 6
        const drawFlowerPot = (ox, oy) => {
            // Pot
            rect(ox + 10, oy + 22, 12, 10, '#E64A19'); // Terracotta
            rect(ox + 8, oy + 22, 16, 3, '#D84315'); // Rim

            // Flower Stem
            rect(ox + 15, oy + 16, 2, 6, '#4CAF50');
            // Flower Head
            rect(ox + 13, oy + 12, 6, 6, '#E91E63'); // Pink
            rect(ox + 15, oy + 14, 2, 2, '#FFEB3B'); // Center
        };
        drawFlowerPot(128, 32);

        // Lamp (160, 32) - Index 7
        const drawLamp = (ox, oy) => {
            // Post
            rect(ox + 14, oy + 12, 4, 20, '#3E2723');
            // Base
            rect(ox + 10, oy + 30, 12, 2, '#3E2723');
            // Lamp Head
            rect(ox + 10, oy + 4, 12, 12, '#FFD54F'); // Glow
            rect(ox + 12, oy + 6, 8, 8, '#FFFF8D'); // Bright Center
            // Frame
            ctx.fillStyle = '#212121';
            ctx.fillRect(ox + 9, oy + 3, 14, 2); // Top Cover
            ctx.fillRect(ox + 9, oy + 15, 14, 2); // Bottom
        };
        drawLamp(160, 32);

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
