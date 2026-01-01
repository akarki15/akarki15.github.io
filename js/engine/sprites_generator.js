export const SpriteGenerator = {
    generate() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const updatedConfig = {
            tileSize: 32,
            rows: 12,
            cols: 4
        };

        canvas.width = updatedConfig.cols * updatedConfig.tileSize;
        canvas.height = updatedConfig.rows * updatedConfig.tileSize;

        ctx.fillStyle = '#FFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const drawTile = (r, c, color, label) => {
            const x = c * 32;
            const y = r * 32;
            ctx.fillStyle = color;
            ctx.fillRect(x, y, 32, 32);
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect(x, y, 32, 32); // darken
            ctx.fillStyle = '#FFF';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(label, x + 16, y + 20);
        };

        // Row 0: Terrain
        drawTile(0, 0, '#4CAF50', 'Gras');
        drawTile(0, 1, '#795548', 'Path');
        drawTile(0, 2, '#2196F3', 'Watr');
        drawTile(0, 3, '#FFF', 'Snow');

        // Row 1: Props
        drawTile(1, 0, '#1B5E20', 'Tree');
        drawTile(1, 1, '#9E9E9E', 'Rock');
        drawTile(1, 2, '#8BC34A', 'Bush');
        drawTile(1, 3, '#607D8B', 'Wall');

        // Row 2-5: Player (Down, Up, Left, Right)
        ['Down', 'Up', 'Left', 'Right'].forEach((dir, i) => {
            for (let f = 0; f < 4; f++) {
                drawTile(2 + i, f, '#FF9800', `P${dir}${f}`);
            }
        });

        // Row 6-8: NPCs
        for (let f = 0; f < 4; f++) drawTile(6, f, '#9C27B0', `Vil${f}`);
        for (let f = 0; f < 4; f++) drawTile(7, f, '#E91E63', `Dad${f}`);
        for (let f = 0; f < 4; f++) drawTile(8, f, '#3F51B5', `Man${f}`);

        // Row 9-10: Pets
        for (let f = 0; f < 4; f++) drawTile(9, f, '#795548', `Dog${f}`); // Sheepdog
        for (let f = 0; f < 4; f++) drawTile(10, f, '#FF5722', `Cat${f}`); // Cat

        return canvas.toDataURL();
    }
};
