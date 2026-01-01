/**
 * Pahadi Tales - MiniMap System
 * Renders a small translucent map with player position and quest markers
 */
import { AreaData, WorldManager } from './world.js';
import { QuestManager } from './quest.js';

export const MiniMap = {
    canvas: null,
    ctx: null,
    width: 150,
    height: 150,
    areaScale: 4, // Scale down factor

    init() {
        this.canvas = document.getElementById('minimap-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
    },

    draw() {
        if (!this.ctx || !window.Player || !window.WorldManager) return;

        // Clear
        this.ctx.clearRect(0, 0, this.width, this.height);

        const currentAreaId = WorldManager.currentArea;
        const area = AreaData[currentAreaId];
        if (!area) return;

        // Calculate dynamic scale to fit area
        const mapW = area.width * 32;
        const mapH = area.height * 32;
        const scaleX = this.width / mapW;
        const scaleY = this.height / mapH;
        const scale = Math.min(scaleX, scaleY) * 0.9;

        const offsetX = (this.width - mapW * scale) / 2;
        const offsetY = (this.height - mapH * scale) / 2;

        // Draw Map Background (Rounded Rect for cleaner look)
        this.ctx.fillStyle = 'rgba(20, 20, 30, 0.6)'; // Darker, cleaner bg
        this.ctx.beginPath();
        this.ctx.roundRect(offsetX, offsetY, mapW * scale, mapH * scale, 8);
        this.ctx.fill();
        this.ctx.strokeStyle = '#4CAF50'; // Slight border color
        this.ctx.stroke();

        // Draw Player Arrow
        const px = offsetX + Player.x * scale;
        const py = offsetY + Player.y * scale;

        this.ctx.save();
        this.ctx.translate(px, py);
        // Rotate arrow based on player direction
        let angle = 0;
        if (Player.direction === 'left') angle = Math.PI;
        else if (Player.direction === 'up') angle = -Math.PI / 2;
        else if (Player.direction === 'down') angle = Math.PI / 2;

        this.ctx.rotate(angle);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(-4, -3);
        this.ctx.lineTo(5, 0);
        this.ctx.lineTo(-4, 3);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();

        // Draw Quest Objectives
        this.drawQuestMarkers(currentAreaId, offsetX, offsetY, scale);
    },

    drawQuestMarkers(areaId, offX, offY, scale) {
        if (!QuestManager) return;

        const activeQuests = QuestManager.getActiveQuests();
        for (const quest of activeQuests) {
            for (const obj of quest.objectives) {
                if (obj.current >= obj.count) continue;

                const area = AreaData[areaId];

                // Interactables
                const interactable = area.interactables?.find(i =>
                    (obj.type === 'interact' && (i.id === obj.target || (i.type === 'clean' && obj.target === 'dhaba_dirt'))) ||
                    (obj.type === 'collect' && i.item === obj.target)
                );

                if (interactable) {
                    this.drawIcon(offX + interactable.x * 32 * scale, offY + interactable.y * 32 * scale, '❗', '#FFD700');
                    continue;
                }

                // Forage
                if (obj.type === 'collect') {
                    const spotIndex = area.forageSpots?.findIndex(s => s.items.includes(obj.target));
                    if (spotIndex !== undefined && spotIndex !== -1 && WorldManager.canForage(spotIndex)) {
                        const spot = area.forageSpots[spotIndex];
                        this.drawIcon(offX + spot.x * 32 * scale, offY + spot.y * 32 * scale, '🌿', '#4CAF50');
                        continue;
                    }
                }

                // 3. Is target in ANOTHER area? (Simple logic: Check area connections)
                // This requires knowing WHICH area the target is in. 
                // Hardcoding common quest targets for now or searching AreaData?
                // Searching AreaData is better but expensive every frame.
                // Let's rely on 'location' hints or skip for now to keep it simple and efficient.
                // Or simplified: If broom quest and NOT in tea_house -> Point to tea_house connection?

                // Simplified "Compass" logic for cross-area could go here.
            }
        }
    },

    drawIcon(x, y, char, color) {
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(char, x, y);
    }
};

// Auto-register if global
if (typeof window !== 'undefined') {
    window.MiniMap = MiniMap;
}
