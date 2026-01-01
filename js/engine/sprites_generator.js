export const SpriteGenerator = {
    generate() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const config = {
            tileSize: 32,
            rows: 12,
            cols: 4
        };

        canvas.width = config.cols * config.tileSize;
        canvas.height = config.rows * config.tileSize;

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Helper to draw a rect
        const r = (x, y, w, h, color) => {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, w, h);
        };

        // Helper to draw a pixel pattern (8x8 grid scaled to 32x32 = 4px per "pixel")
        const drawSprite8x8 = (ctx, startX, startY, palette, pattern) => {
            const pixelSize = 4;
            pattern.forEach((row, y) => {
                row.split('').forEach((char, x) => {
                    if (char !== ' ' && palette[char]) {
                        r(startX + x * pixelSize, startY + y * pixelSize, pixelSize, pixelSize, palette[char]);
                    }
                });
            });
        };

        // --- Row 0: Terrain ---
        // Grass
        const grassPalette = { g: '#4CAF50', d: '#388E3C', l: '#81C784' };
        drawSprite8x8(ctx, 0, 0, grassPalette, [
            'gggggggg',
            'ggdggggg',
            'gggglggg',
            'gdggggdg',
            'gggggggg',
            'gglggggg',
            'gggggdgg',
            'gggggggg'
        ]);

        // Path (Dirt)
        const pathPalette = { b: '#795548', d: '#5D4037', l: '#A1887F' };
        drawSprite8x8(ctx, 32, 0, pathPalette, [
            'bbbbbbbb',
            'bdbbbdbt',
            'blbbbbbb',
            'bbbbdbbb',
            'bbbblbbb',
            'dbbbbbdb',
            'bbbbbbbb',
            'bdbbbbbb'
        ]);

        // Water
        const waterPalette = { b: '#2196F3', d: '#1976D2', l: '#64B5F6' };
        drawSprite8x8(ctx, 64, 0, waterPalette, [
            'bbbbbbbb',
            'bbdlbbbb',
            'bbbbbbdb',
            'lbbbbbbb',
            'bbbbdlbb',
            'dbbbbbbb',
            'bbblbbbb',
            'bbbbbbbb'
        ]);

        // Snow
        drawSprite8x8(ctx, 96, 0, { w: '#FFFFFF', b: '#E0F7FA' }, [
            'wwwwwwww',
            'wbwwwwww',
            'wwwwbwww',
            'wwwwwbww',
            'bwwwwwww',
            'wwwwwwbw',
            'wwbwwwww',
            'wwwwwwww'
        ]);

        // --- Row 1: Props ---
        // Tree
        const treePalette = { g: '#1B5E20', b: '#3E2723', l: '#2E7D32' };
        drawSprite8x8(ctx, 0, 32, treePalette, [
            '   g    ',
            '  glg   ',
            ' glglg  ',
            'glglglg ',
            'ggggggg ',
            '  bbb   ',
            '  bbb   ',
            '  bbb   '
        ]);

        // Rock
        const rockPalette = { g: '#9E9E9E', d: '#616161', l: '#CFD8DC' };
        drawSprite8x8(ctx, 32, 32, rockPalette, [
            '  gggg  ',
            ' glggdg ',
            'glggggdg',
            'gggggggg',
            'dggggggd',
            ' gggggg ',
            '  dddd  ',
            '        '
        ]);

        // Bush (Berries)
        const bushPalette = { g: '#4CAF50', r: '#F44336' };
        drawSprite8x8(ctx, 64, 32, bushPalette, [
            '  ggg   ',
            ' ggggg  ',
            'gggrggg ',
            'ggggggr ',
            'grggggg ',
            ' ggggg  ',
            '  ggg   ',
            '        '
        ]);

        // Wall/Stone
        drawSprite8x8(ctx, 96, 32, rockPalette, [
            'gggggggg',
            'dggggggd',
            'gggggggg',
            'gdggggdg',
            'gggggggg',
            'dggggggd',
            'gggggggg',
            'gdggggdg'
        ]);


        // --- CHARACTERS ---
        // Generic Character Animation Generator
        const drawFigure = (ctx, x, y, skin, clothes, pants, hair, frame) => {
            const ps = 2; // Pixel scale for character (16x16 grid -> 32x32)
            const offX = x;
            const offY = y;

            const r = (dx, dy, w, h, c) => {
                ctx.fillStyle = c;
                ctx.fillRect(offX + dx * ps, offY + dy * ps, w * ps, h * ps);
            };

            // Head (Centered)
            r(6, 2, 4, 4, skin);

            // Hair
            r(6, 1, 4, 1, hair);
            r(5, 2, 1, 2, hair);
            r(10, 2, 1, 2, hair);

            // Body
            r(5, 6, 6, 5, clothes);

            // Arms
            if (frame === 0) { // Idle
                r(4, 6, 1, 4, skin);
                r(11, 6, 1, 4, skin);
            } else if (frame === 1) { // Walk 1
                r(4, 5, 1, 4, skin);
                r(11, 7, 1, 4, skin);
            } else if (frame === 2) { // Idle
                r(4, 6, 1, 4, skin);
                r(11, 6, 1, 4, skin);
            } else { // Walk 2
                r(4, 7, 1, 4, skin);
                r(11, 5, 1, 4, skin);
            }

            // Legs
            if (frame === 0 || frame === 2) {
                r(6, 11, 1, 4, pants);
                r(9, 11, 1, 4, pants);
            } else if (frame === 1) {
                r(6, 10, 1, 3, pants);
                r(9, 12, 1, 3, pants);
            } else {
                r(6, 12, 1, 3, pants);
                r(9, 10, 1, 3, pants);
            }
        };

        const drawCharRow = (row, skin, clothes, pants, hair) => {
            for (let f = 0; f < 4; f++) {
                drawFigure(ctx, f * 32, row * 32, skin, clothes, pants, hair, f);
            }
        };

        // Row 2-5: Player (Using same anim for all directions for simplicity, but colored differently if needed)
        // Down
        drawCharRow(2, '#FFCC80', '#F44336', '#3F51B5', '#3E2723');
        // Up
        drawCharRow(3, '#FFCC80', '#D32F2F', '#3F51B5', '#3E2723');
        // Left
        drawCharRow(4, '#FFCC80', '#F44336', '#3F51B5', '#3E2723');
        // Right
        drawCharRow(5, '#FFCC80', '#F44336', '#3F51B5', '#3E2723');

        // Row 6: Villager (Woman)
        drawCharRow(6, '#D7CCC8', '#E91E63', '#C2185B', '#212121');
        // Row 7: Old Man / Dadi
        drawCharRow(7, '#BCAAA4', '#F5F5F5', '#E0E0E0', '#BDBDBD');
        // Row 8: Man
        drawCharRow(8, '#8D6E63', '#2196F3', '#1565C0', '#000000');


        // --- PETS ---
        // Dog
        const drawDog = (row) => {
            const c = { f: '#D7CCC8', s: '#795548', b: '#3E2723' };
            for (let f = 0; f < 4; f++) {
                const ox = f * 32;
                const oy = row * 32;
                const ps = 2;
                const r = (dx, dy, w, h, col) => { ctx.fillStyle = col; ctx.fillRect(ox + dx * ps, oy + dy * ps, w * ps, h * ps); };

                // Body
                r(4, 8, 8, 4, c.f);
                // Head
                r(10, 5, 4, 4, c.f);
                // Ears
                r(10, 5, 1, 2, c.b);
                r(13, 5, 1, 2, c.b);

                // Legs anim
                if (f % 2 === 0) {
                    r(4, 12, 1, 3, c.s); r(10, 12, 1, 3, c.s);
                } else {
                    r(5, 11, 1, 3, c.s); r(9, 11, 1, 3, c.s);
                }
                // Tail
                if (f === 0 || f === 2) r(3, 8, 1, 2, c.b);
                else r(3, 7, 1, 2, c.b);
            }
        };
        drawDog(9);

        // Cat
        const drawCat = (row) => {
            const c = { f: '#FFCCBC', s: '#FF5722' };
            for (let f = 0; f < 4; f++) {
                const ox = f * 32;
                const oy = row * 32;
                const ps = 2;
                const r = (dx, dy, w, h, col) => { ctx.fillStyle = col; ctx.fillRect(ox + dx * ps, oy + dy * ps, w * ps, h * ps); };

                // Body
                r(5, 9, 6, 3, c.f);
                // Head
                r(9, 6, 3, 3, c.f);
                // Ears
                r(9, 5, 1, 1, c.s);
                r(11, 5, 1, 1, c.s);

                // Legs
                if (f % 2 === 0) {
                    r(5, 12, 1, 2, c.f); r(9, 12, 1, 2, c.f);
                } else {
                    r(6, 11, 1, 2, c.s); r(8, 11, 1, 2, c.s);
                }
                // Tail
                if (f === 0 || f === 2) r(4, 8, 1, 3, c.s);
                else r(4, 7, 1, 3, c.s);
            }
        };
        drawCat(10);

        return canvas.toDataURL();
    }
};
