/**
 * Pahadi Tales - Complete Game Engine
 * Integrates all systems for a 2-3 hour gameplay experience
 */

// Import all systems (they self-register on window)
import { QuestManager, QuestData, QuestState } from './systems/quest.js';
import { Inventory, ItemData, ItemCategory } from './systems/inventory.js';
import { CraftingSystem, CraftingRecipes } from './systems/crafting.js';
import { PetManager, PetData } from './systems/pets.js';
import { WorldManager, AreaData, NPCData } from './systems/world.js';

// ============================================================
// GAME CONFIGURATION
// ============================================================
const CONFIG = {
    TILE_SIZE: 32,
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    TARGET_FPS: 60,
    PLAYER_SPEED: 3,
    DEBUG_MODE: false
};

// ============================================================
// GAME STATE
// ============================================================
window.GameState = {
    currentScreen: 'main-menu',
    language: 'en',
    isPaused: false,
    gameTime: { hour: 6, minute: 0 },
    day: 1,
    season: 'spring',
    weather: 'sunny'
};

// ============================================================
// PLAYER SYSTEM
// ============================================================
window.Player = {
    x: 400,
    y: 300,
    width: 32,
    height: 32,
    speed: CONFIG.PLAYER_SPEED,
    direction: 'down',
    isMoving: false,
    animFrame: 0,
    animTimer: 0,
    energy: 100,
    maxEnergy: 100,
    health: 100,
    maxHealth: 100,
    xp: 0,
    level: 1,

    update(deltaTime) {
        if (DialogueSystem.active || UIManager.isMenuOpen()) return;

        let dx = 0, dy = 0;

        if (Input.isPressed('ArrowUp') || Input.isPressed('KeyW')) { dy = -this.speed; this.direction = 'up'; }
        if (Input.isPressed('ArrowDown') || Input.isPressed('KeyS')) { dy = this.speed; this.direction = 'down'; }
        if (Input.isPressed('ArrowLeft') || Input.isPressed('KeyA')) { dx = -this.speed; this.direction = 'left'; }
        if (Input.isPressed('ArrowRight') || Input.isPressed('KeyD')) { dx = this.speed; this.direction = 'right'; }

        if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }

        this.isMoving = dx !== 0 || dy !== 0;

        // Movement with collision
        const newX = this.x + dx;
        const newY = this.y + dy;

        if (newX >= 0 && newX <= CONFIG.CANVAS_WIDTH - this.width) this.x = newX;
        if (newY >= 0 && newY <= CONFIG.CANVAS_HEIGHT - this.height) this.y = newY;

        // Check area transitions
        this.checkAreaTransition();

        // Animation
        if (this.isMoving) {
            this.animTimer += deltaTime;
            if (this.animTimer >= 150) { this.animFrame = (this.animFrame + 1) % 4; this.animTimer = 0; }
        } else {
            this.animFrame = 0;
        }
    },

    checkAreaTransition() {
        const area = WorldManager.getCurrentArea();
        if (!area?.connections) return;

        for (const [dir, conn] of Object.entries(area.connections)) {
            let shouldTransition = false;
            if (dir === 'north' && this.y < 5) shouldTransition = true;
            if (dir === 'south' && this.y > CONFIG.CANVAS_HEIGHT - 40) shouldTransition = true;
            if (dir === 'east' && this.x > CONFIG.CANVAS_WIDTH - 40) shouldTransition = true;
            if (dir === 'west' && this.x < 5) shouldTransition = true;

            if (shouldTransition) {
                const result = WorldManager.changeArea(conn.area, conn.x * CONFIG.TILE_SIZE, conn.y * CONFIG.TILE_SIZE);
                if (result.success) {
                    this.x = result.x;
                    this.y = result.y;
                    NotificationSystem.show(`📍 ${AreaData[conn.area].name[GameState.language]}`);
                } else if (result.reason === 'missing_item') {
                    NotificationSystem.show(`🔒 Need ${ItemData[result.item]?.name[GameState.language] || result.item}`, 'warning');
                    // Push back
                    if (dir === 'north') this.y = 10;
                    if (dir === 'south') this.y = CONFIG.CANVAS_HEIGHT - 50;
                    if (dir === 'east') this.x = CONFIG.CANVAS_WIDTH - 50;
                    if (dir === 'west') this.x = 10;
                }
            }
        }
    },

    addXP(amount) {
        this.xp += amount;
        const xpNeeded = this.level * 100;
        if (this.xp >= xpNeeded) {
            this.xp -= xpNeeded;
            this.level++;
            this.maxEnergy += 10;
            this.maxHealth += 5;
            NotificationSystem.show(`⬆️ Level ${this.level}!`, 'success');
        }
    },

    restoreEnergy(amount) { this.energy = Math.min(this.maxEnergy, this.energy + amount); },
    restoreHealth(amount) { this.health = Math.min(this.maxHealth, this.health + amount); },
    useEnergy(amount) { if (this.energy >= amount) { this.energy -= amount; return true; } return false; },

    draw(ctx) {
        // Draw player sprite (simple colored rectangle for now)
        const colors = { up: '#E8A87C', down: '#E8A87C', left: '#D49A70', right: '#D49A70' };
        ctx.fillStyle = colors[this.direction];
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Head
        ctx.fillStyle = '#FFDAB9';
        ctx.fillRect(this.x + 8, this.y + 4, 16, 12);

        // Direction indicator
        ctx.fillStyle = '#2C1810';
        const eyeOffset = { up: { x: 0, y: -2 }, down: { x: 0, y: 2 }, left: { x: -3, y: 0 }, right: { x: 3, y: 0 } };
        ctx.fillRect(this.x + 12 + eyeOffset[this.direction].x, this.y + 8 + eyeOffset[this.direction].y, 2, 2);
        ctx.fillRect(this.x + 18 + eyeOffset[this.direction].x, this.y + 8 + eyeOffset[this.direction].y, 2, 2);
    }
};

// ============================================================
// INPUT HANDLER
// ============================================================
const Input = {
    keys: {},
    lastKeys: {},

    init() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'Escape', 'KeyI', 'KeyQ', 'KeyM', 'KeyC', 'KeyE', 'KeyH'].includes(e.code)) {
                e.preventDefault();
            }
        });
        window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });
    },

    isPressed(key) { return this.keys[key] === true; },
    isJustPressed(key) { return this.keys[key] === true && this.lastKeys[key] !== true; },
    update() { this.lastKeys = { ...this.keys }; }
};

// ============================================================
// NOTIFICATION SYSTEM
// ============================================================
const NotificationSystem = {
    notifications: [],

    show(message, type = 'info', duration = 3000) {
        this.notifications.push({ message, type, startTime: Date.now(), duration });
    },

    update() {
        this.notifications = this.notifications.filter(n => Date.now() - n.startTime < n.duration);
    },

    draw(ctx) {
        let y = 80;
        for (const notif of this.notifications.slice(0, 5)) {
            const alpha = 1 - (Date.now() - notif.startTime) / notif.duration;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = notif.type === 'success' ? '#4CAF50' : notif.type === 'warning' ? '#FF9800' : '#333';
            ctx.fillRect(CONFIG.CANVAS_WIDTH / 2 - 150, y, 300, 30);
            ctx.fillStyle = '#FFF';
            ctx.font = '14px Outfit';
            ctx.textAlign = 'center';
            ctx.fillText(notif.message, CONFIG.CANVAS_WIDTH / 2, y + 20);
            ctx.globalAlpha = 1;
            y += 35;
        }
    }
};

// ============================================================
// DIALOGUE SYSTEM
// ============================================================
const DialogueSystem = {
    active: false,
    currentNPC: null,
    currentText: '',
    displayedText: '',
    textIndex: 0,
    dialogueQueue: [],

    start(npc) {
        this.active = true;
        this.currentNPC = npc;
        const dialogues = npc.dialogues || {};

        // Check for quest dialogue first
        const activeQuests = QuestManager.getActiveQuests();
        let dialogueKey = 'greeting';

        for (const quest of activeQuests) {
            if (quest.definition?.giver === npc.id) {
                dialogueKey = 'quest';
                break;
            }
        }

        this.currentText = dialogues[dialogueKey]?.[GameState.language] || dialogues.greeting?.[GameState.language] || 'Hello!';
        this.displayedText = '';
        this.textIndex = 0;

        document.getElementById('dialogue-box').classList.remove('hidden');
        document.querySelector('.dialogue-speaker').textContent = npc.name[GameState.language];
    },

    update(deltaTime) {
        if (!this.active) return;

        if (this.textIndex < this.currentText.length) {
            this.displayedText += this.currentText[this.textIndex];
            this.textIndex++;
            document.querySelector('.dialogue-text').textContent = this.displayedText;
        }

        if (Input.isJustPressed('Space') || Input.isJustPressed('Enter') || Input.isJustPressed('KeyE')) {
            if (this.textIndex < this.currentText.length) {
                this.displayedText = this.currentText;
                this.textIndex = this.currentText.length;
                document.querySelector('.dialogue-text').textContent = this.displayedText;
            } else {
                this.close();
            }
        }
        if (Input.isJustPressed('Escape')) this.close();
    },

    close() {
        this.active = false;
        this.currentNPC = null;
        document.getElementById('dialogue-box').classList.add('hidden');

        // Update quest objectives
        if (this.currentNPC) {
            QuestManager.updateObjective('dialogue', this.currentNPC.id, 1);
        }
    }
};

// ============================================================
// UI MANAGER
// ============================================================
const UIManager = {
    currentMenu: null,

    init() {
        this.setupHUD();
    },

    setupHUD() {
        document.getElementById('btn-inventory')?.addEventListener('click', () => this.toggleMenu('inventory'));
        document.getElementById('btn-quests')?.addEventListener('click', () => this.toggleMenu('quests'));
        document.getElementById('btn-map')?.addEventListener('click', () => this.toggleMenu('map'));
    },

    toggleMenu(menuType) {
        if (this.currentMenu === menuType) {
            this.closeMenu();
        } else {
            this.openMenu(menuType);
        }
    },

    openMenu(menuType) {
        this.closeMenu();
        this.currentMenu = menuType;

        const overlay = document.getElementById('menu-overlay') || this.createMenuOverlay();
        overlay.innerHTML = '';
        overlay.classList.remove('hidden');

        switch (menuType) {
            case 'inventory': this.renderInventory(overlay); break;
            case 'quests': this.renderQuests(overlay); break;
            case 'map': this.renderMap(overlay); break;
            case 'crafting': this.renderCrafting(overlay); break;
        }
    },

    closeMenu() {
        this.currentMenu = null;
        const overlay = document.getElementById('menu-overlay');
        if (overlay) overlay.classList.add('hidden');
    },

    isMenuOpen() { return this.currentMenu !== null; },

    createMenuOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'menu-overlay';
        overlay.className = 'menu-overlay';
        overlay.innerHTML = '';
        document.getElementById('game-screen').appendChild(overlay);
        return overlay;
    },

    renderInventory(container) {
        const lang = GameState.language;
        const items = Inventory.getAllItems();

        container.innerHTML = `
            <div class="menu-panel">
                <div class="menu-header">
                    <h2>🎒 ${lang === 'hi' ? 'सामान' : 'Inventory'}</h2>
                    <div class="coins">🪙 ${Inventory.coins}</div>
                    <button class="close-btn" onclick="UIManager.closeMenu()">✕</button>
                </div>
                <div class="inventory-grid">
                    ${items.length === 0 ? `<p class="empty">${lang === 'hi' ? 'खाली' : 'Empty'}</p>` :
                items.map(item => `
                        <div class="inv-item" onclick="UIManager.handleItemClick('${item.id}')" title="${item.name[lang]}">
                            <span class="emoji">${item.emoji}</span>
                            <span class="qty">${item.quantity}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="menu-tabs">
                    <button onclick="UIManager.openMenu('crafting')">🔥 ${lang === 'hi' ? 'बनाएं' : 'Craft'}</button>
                </div>
            </div>
        `;
    },

    renderQuests(container) {
        const lang = GameState.language;
        const quests = QuestManager.getActiveQuests();

        container.innerHTML = `
            <div class="menu-panel quest-panel">
                <div class="menu-header">
                    <h2>📜 ${lang === 'hi' ? 'कार्य' : 'Quests'}</h2>
                    <button class="close-btn" onclick="UIManager.closeMenu()">✕</button>
                </div>
                <div class="quest-list">
                    ${quests.length === 0 ? `<p class="empty">${lang === 'hi' ? 'कोई कार्य नहीं' : 'No active quests'}</p>` :
                quests.map(q => `
                        <div class="quest-item ${q.definition.type}">
                            <h3>${q.definition.type === 'main' ? '⭐' : '📌'} ${q.definition.title[lang]}</h3>
                            <p>${q.definition.description[lang]}</p>
                            <div class="objectives">
                                ${q.objectives.map(obj => `
                                    <div class="obj ${obj.current >= obj.count ? 'done' : ''}">
                                        ${obj.current >= obj.count ? '✅' : '⬜'} ${obj.desc[lang]} (${obj.current}/${obj.count})
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    renderMap(container) {
        const lang = GameState.language;
        const currentArea = WorldManager.getCurrentArea();
        const visited = WorldManager.visitedAreas;

        container.innerHTML = `
            <div class="menu-panel map-panel">
                <div class="menu-header">
                    <h2>🗺️ ${lang === 'hi' ? 'नक्शा' : 'Map'}</h2>
                    <button class="close-btn" onclick="UIManager.closeMenu()">✕</button>
                </div>
                <div class="current-location">
                    📍 ${currentArea.name[lang]}
                </div>
                <div class="map-grid">
                    ${Object.values(AreaData).map(area => `
                        <div class="map-area ${visited.includes(area.id) ? 'visited' : 'unknown'} ${area.id === WorldManager.currentArea ? 'current' : ''}">
                            ${visited.includes(area.id) ? area.name[lang] : '???'}
                        </div>
                    `).join('')}
                </div>
                <p class="map-hint">${lang === 'hi' ? 'क्षेत्र खोजे: ' : 'Areas Discovered: '}${visited.length}/${Object.keys(AreaData).length}</p>
            </div>
        `;
    },

    renderCrafting(container) {
        const lang = GameState.language;
        const recipes = CraftingSystem.getAvailableRecipes();

        container.innerHTML = `
            <div class="menu-panel craft-panel">
                <div class="menu-header">
                    <h2>🔥 ${lang === 'hi' ? 'बनाएं' : 'Crafting'}</h2>
                    <button class="close-btn" onclick="UIManager.closeMenu()">✕</button>
                </div>
                <div class="recipe-list">
                    ${recipes.map(r => `
                        <div class="recipe ${r.canCraft ? 'available' : 'unavailable'}" onclick="${r.canCraft ? `UIManager.craft('${r.id}')` : ''}">
                            <span class="result">${ItemData[r.result]?.emoji || '?'} ${r.name[lang]}</span>
                            <span class="ingredients">${r.ingredients.map(i => `${ItemData[i.item]?.emoji || ''}${i.qty}`).join(' ')}</span>
                            <span class="craftable">${r.canCraft ? '✓' : '✗'}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    handleItemClick(itemId) {
        const item = ItemData[itemId];
        if (item?.category === 'food') {
            if (Inventory.useItem(itemId)) {
                NotificationSystem.show(`Used ${item.emoji} ${item.name[GameState.language]}`, 'success');
                this.openMenu('inventory'); // Refresh
            }
        }
    },

    craft(recipeId) {
        if (CraftingSystem.craft(recipeId)) {
            const recipe = CraftingRecipes[recipeId];
            NotificationSystem.show(`Crafted ${ItemData[recipe.result]?.emoji || ''} ${recipe.name[GameState.language]}!`, 'success');
            this.openMenu('crafting'); // Refresh
        }
    },

    updateHUD() {
        const dayEl = document.getElementById('day-count');
        if (dayEl) dayEl.textContent = GameState.day;

        const timeEl = document.getElementById('game-time');
        if (timeEl) {
            const h = Math.floor(GameState.gameTime.hour);
            const m = Math.floor(GameState.gameTime.minute);
            const ampm = h >= 12 ? 'PM' : 'AM';
            timeEl.textContent = `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`;
        }

        const weatherEl = document.getElementById('weather-icon');
        if (weatherEl) {
            const icons = { sunny: '☀️', cloudy: '⛅', rainy: '🌧️', snowy: '❄️' };
            weatherEl.textContent = icons[GameState.weather] || '☀️';
        }
    }
};

// Make UIManager global
window.UIManager = UIManager;

// ============================================================
// WORLD RENDERER
// ============================================================
const WorldRenderer = {
    tileColors: {
        0: '#4A7C59', // grass
        1: '#C4A77D', // path
        2: '#4A90A4', // water
        3: '#2D5A27', // tree
        4: '#808080', // rock
        5: '#D4B896', // building
        10: '#6B8E23', // forage
        11: '#FFFFFF'  // snow
    },

    generateAreaTiles(area) {
        const tiles = [];
        for (let y = 0; y < Math.ceil(CONFIG.CANVAS_HEIGHT / CONFIG.TILE_SIZE); y++) {
            tiles[y] = [];
            for (let x = 0; x < Math.ceil(CONFIG.CANVAS_WIDTH / CONFIG.TILE_SIZE); x++) {
                // Default to grass
                let tile = 0;

                // Path in center
                if (x >= 10 && x <= 14) tile = 1;

                // Area-specific features
                if (area.id === 'riverside' && y > 12) tile = 2;
                if (area.id === 'pine_forest' && Math.random() > 0.7) tile = 3;
                if (area.id === 'temple_hill' && y < 5 && x > 8 && x < 16) tile = 5;
                if (area.id === 'hot_springs' && x > 8 && x < 14 && y > 6 && y < 14) tile = 2;
                if (area.id === 'mountain_peak' && Math.random() > 0.8) tile = 11;
                if (area.id === 'high_meadow' && y < 3) tile = 11;

                tiles[y][x] = tile;
            }
        }
        return tiles;
    },

    draw(ctx) {
        const area = WorldManager.getCurrentArea();
        if (!area) return;

        // Generate tiles for current area (cache this in real implementation)
        const tiles = this.generateAreaTiles(area);

        // Draw base tiles
        for (let y = 0; y < tiles.length; y++) {
            for (let x = 0; x < tiles[y].length; x++) {
                const tile = tiles[y][x];
                ctx.fillStyle = this.tileColors[tile] || '#333';
                ctx.fillRect(x * CONFIG.TILE_SIZE, y * CONFIG.TILE_SIZE, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);

                // Add some texture
                if (tile === 0 && Math.random() > 0.9) {
                    ctx.fillStyle = '#5C9A6A';
                    ctx.fillRect(x * CONFIG.TILE_SIZE + 8, y * CONFIG.TILE_SIZE + 8, 4, 4);
                }
            }
        }

        // Draw foraging spots
        if (area.forageSpots) {
            for (let i = 0; i < area.forageSpots.length; i++) {
                const spot = area.forageSpots[i];
                const canForage = WorldManager.canForage(i);

                ctx.fillStyle = canForage ? '#FFD700' : '#888';
                ctx.beginPath();
                ctx.arc(spot.x * CONFIG.TILE_SIZE + 16, spot.y * CONFIG.TILE_SIZE + 16, 10, 0, Math.PI * 2);
                ctx.fill();

                if (canForage) {
                    ctx.fillStyle = '#000';
                    ctx.font = '16px Arial';
                    ctx.fillText('🌿', spot.x * CONFIG.TILE_SIZE + 8, spot.y * CONFIG.TILE_SIZE + 22);
                }
            }
        }

        // Draw interactables
        if (area.interactables) {
            for (const inter of area.interactables) {
                ctx.font = '24px Arial';
                ctx.fillText(inter.emoji, inter.x * CONFIG.TILE_SIZE, inter.y * CONFIG.TILE_SIZE + 24);
            }
        }
    }
};

// ============================================================
// NPC RENDERER
// ============================================================
const NPCRenderer = {
    draw(ctx) {
        const npcs = WorldManager.getNPCsInCurrentArea();
        const area = WorldManager.getCurrentArea();

        for (let i = 0; i < npcs.length; i++) {
            const npc = npcs[i];
            // Position NPCs in area
            const x = 100 + (i * 150) % (CONFIG.CANVAS_WIDTH - 100);
            const y = 150 + Math.floor(i / 4) * 150;

            // Store position for interaction
            npc._x = x;
            npc._y = y;

            // Draw NPC body
            ctx.fillStyle = '#C38D9E';
            ctx.fillRect(x, y, 32, 32);

            // Head
            ctx.fillStyle = '#DEB887';
            ctx.fillRect(x + 8, y + 4, 16, 12);

            // Emoji indicator
            ctx.font = '20px Arial';
            ctx.fillText(npc.emoji || '👤', x + 6, y - 5);

            // Name
            ctx.fillStyle = '#FFF';
            ctx.font = '12px Outfit';
            ctx.textAlign = 'center';
            ctx.fillText(npc.name[GameState.language], x + 16, y + 45);
            ctx.textAlign = 'left';
        }
    },

    getNearbyNPC() {
        const npcs = WorldManager.getNPCsInCurrentArea();

        for (const npc of npcs) {
            if (npc._x === undefined) continue;
            const dx = Player.x - npc._x;
            const dy = Player.y - npc._y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 50) return npc;
        }
        return null;
    }
};

// ============================================================
// TIME SYSTEM
// ============================================================
const TimeSystem = {
    minutesPerSecond: 0.5, // Slower for more gameplay time

    update(deltaTime) {
        const seconds = deltaTime / 1000;
        GameState.gameTime.minute += seconds * this.minutesPerSecond;

        if (GameState.gameTime.minute >= 60) {
            GameState.gameTime.minute = 0;
            GameState.gameTime.hour++;

            if (GameState.gameTime.hour >= 24) {
                GameState.gameTime.hour = 6;
                GameState.day++;
                NotificationSystem.show(`🌅 Day ${GameState.day}`, 'info');

                // Daily quest reset
                // Energy restore on new day
                Player.energy = Player.maxEnergy;
            }
        }

        UIManager.updateHUD();
    },

    getTimeOfDay() {
        const h = GameState.gameTime.hour;
        if (h >= 5 && h < 8) return 'dawn';
        if (h >= 8 && h < 17) return 'day';
        if (h >= 17 && h < 20) return 'dusk';
        return 'night';
    }
};

// ============================================================
// MAIN GAME
// ============================================================
const Game = {
    canvas: null,
    ctx: null,
    lastTime: 0,

    init() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;
        this.ctx.imageSmoothingEnabled = false;

        // Initialize all systems
        Input.init();
        WorldManager.init();
        Inventory.init();
        QuestManager.init();
        CraftingSystem.init();
        PetManager.init();
        UIManager.init();

        // Give player a starter pet!
        PetManager.adoptPet('sheepdog');

        this.setupUI();
        this.setLanguage('en');
        this.addMenuOverlayStyles();

        console.log('🏔️ Pahadi Tales loaded with all systems!');
    },

    addMenuOverlayStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .menu-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 50; }
            .menu-overlay.hidden { display: none; }
            .menu-panel { background: linear-gradient(135deg, #2D2D44 0%, #1A1A2E 100%); border: 2px solid #E8A87C; border-radius: 16px; padding: 20px; min-width: 400px; max-width: 600px; max-height: 80vh; overflow-y: auto; }
            .menu-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E8A87C44; padding-bottom: 10px; margin-bottom: 15px; }
            .menu-header h2 { color: #E8A87C; margin: 0; }
            .close-btn { background: none; border: none; color: #FFF; font-size: 24px; cursor: pointer; }
            .close-btn:hover { color: #E8A87C; }
            .coins { color: #FFD700; font-weight: bold; }
            .inventory-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; }
            .inv-item { background: #3D3D5C; border: 1px solid #E8A87C44; border-radius: 8px; padding: 10px; text-align: center; cursor: pointer; position: relative; }
            .inv-item:hover { background: #4D4D6C; border-color: #E8A87C; }
            .inv-item .emoji { font-size: 24px; }
            .inv-item .qty { position: absolute; bottom: 2px; right: 5px; font-size: 12px; color: #FFF; }
            .quest-list { display: flex; flex-direction: column; gap: 15px; }
            .quest-item { background: #3D3D5C; border-radius: 8px; padding: 12px; }
            .quest-item.main { border-left: 3px solid #FFD700; }
            .quest-item.side { border-left: 3px solid #85CDCA; }
            .quest-item h3 { color: #E8A87C; margin: 0 0 8px 0; font-size: 14px; }
            .quest-item p { color: #C4BAA2; margin: 0 0 10px 0; font-size: 13px; }
            .objectives { font-size: 12px; color: #AAA; }
            .obj.done { color: #4CAF50; }
            .recipe-list { display: flex; flex-direction: column; gap: 8px; }
            .recipe { display: flex; justify-content: space-between; align-items: center; background: #3D3D5C; padding: 10px; border-radius: 8px; }
            .recipe.available { cursor: pointer; }
            .recipe.available:hover { background: #4D4D6C; }
            .recipe.unavailable { opacity: 0.5; }
            .recipe .result { color: #E8A87C; }
            .recipe .ingredients { color: #888; font-size: 12px; }
            .recipe .craftable { font-size: 18px; }
            .map-panel .current-location { text-align: center; color: #E8A87C; font-size: 18px; margin-bottom: 15px; }
            .map-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; }
            .map-area { background: #3D3D5C; padding: 8px; border-radius: 4px; text-align: center; font-size: 11px; color: #888; }
            .map-area.visited { color: #FFF; }
            .map-area.current { background: #E8A87C44; border: 1px solid #E8A87C; color: #E8A87C; }
            .map-area.unknown { color: #555; }
            .map-hint { text-align: center; color: #888; margin-top: 15px; font-size: 12px; }
            .menu-tabs { display: flex; gap: 10px; margin-top: 15px; padding-top: 10px; border-top: 1px solid #E8A87C44; }
            .menu-tabs button { flex: 1; background: #3D3D5C; border: 1px solid #E8A87C44; color: #FFF; padding: 8px; border-radius: 8px; cursor: pointer; }
            .menu-tabs button:hover { background: #4D4D6C; border-color: #E8A87C; }
            .empty { color: #888; text-align: center; grid-column: 1 / -1; }
        `;
        document.head.appendChild(style);
    },

    setupUI() {
        document.getElementById('btn-new-game')?.addEventListener('click', () => this.startNewGame());
        document.getElementById('btn-settings')?.addEventListener('click', () => this.showScreen('settings-screen'));
        document.getElementById('btn-back-settings')?.addEventListener('click', () => this.showScreen('main-menu'));
        document.getElementById('lang-en')?.addEventListener('click', () => this.setLanguage('en'));
        document.getElementById('lang-hi')?.addEventListener('click', () => this.setLanguage('hi'));
        document.getElementById('btn-pause')?.addEventListener('click', () => this.togglePause());
        document.getElementById('btn-resume')?.addEventListener('click', () => this.togglePause());
        document.getElementById('btn-main-menu')?.addEventListener('click', () => this.returnToMenu());
        document.getElementById('btn-save')?.addEventListener('click', () => this.saveGame());
        document.getElementById('btn-skip-intro')?.addEventListener('click', () => this.skipIntro());

        // Controls help
        document.getElementById('btn-help')?.addEventListener('click', () => this.toggleControlsHelp());
        document.getElementById('btn-close-controls')?.addEventListener('click', () => this.hideControlsHelp());

        window.addEventListener('keydown', (e) => {
            if (GameState.currentScreen !== 'game-screen') return;

            // Handle controls overlay first
            if (e.code === 'KeyH') {
                this.toggleControlsHelp();
                return;
            }

            // If controls overlay is visible, close it on any other key
            const controlsOverlay = document.getElementById('controls-help');
            if (controlsOverlay && !controlsOverlay.classList.contains('hidden')) {
                if (e.code === 'Escape' || e.code === 'Space' || e.code === 'Enter') {
                    this.hideControlsHelp();
                    return;
                }
            }

            if (e.code === 'Escape') {
                if (UIManager.isMenuOpen()) UIManager.closeMenu();
                else this.togglePause();
            }
            if (e.code === 'KeyI') UIManager.toggleMenu('inventory');
            if (e.code === 'KeyQ') UIManager.toggleMenu('quests');
            if (e.code === 'KeyM') UIManager.toggleMenu('map');
            if (e.code === 'KeyC') UIManager.toggleMenu('crafting');
        });

        if (localStorage.getItem('pahadiTales_save')) {
            const btn = document.getElementById('btn-continue');
            if (btn) { btn.disabled = false; btn.addEventListener('click', () => this.loadGame()); }
        }
    },

    setLanguage(lang) {
        GameState.language = lang;
        document.body.classList.remove('lang-en', 'lang-hi');
        document.body.classList.add(`lang-${lang}`);
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(`lang-${lang}`)?.classList.add('active');
    },

    showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(id)?.classList.add('active');
        GameState.currentScreen = id;
    },

    async startNewGame() {
        this.showScreen('intro-screen');
        await this.playIntro();
        this.showScreen('game-screen');
        this.startGameLoop();
        // Show controls help on first play
        this.showControlsHelp();
    },

    async playIntro() {
        const introEl = document.querySelector('.intro-text');
        const lines = [
            GameState.language === 'hi' ? 'पहाड़ी तूफान तीन दिनों से गरज रहा था...' : 'The mountain storm had raged for three days...',
            GameState.language === 'hi' ? 'आप बादलों में छिपे एक गाँव में पहुँच गए।' : 'You found a village hidden in the clouds.',
            GameState.language === 'hi' ? '"आओ बच्चे। पहाड़ों ने तुम्हें भेजा है।"' : '"Come, child. The mountains brought you here."',
            GameState.language === 'hi' ? 'यह ढाबा अब तुम्हारा है...' : 'This tea house is now yours...',
            GameState.language === 'hi' ? 'चंद्रपुरी में आपका स्वागत है!' : 'Welcome to Chandrapuri!'
        ];

        for (const line of lines) {
            if (introEl) introEl.textContent = line;
            await new Promise(r => setTimeout(r, 2000));
        }
    },

    skipIntro() { this.showScreen('game-screen'); this.startGameLoop(); },

    startGameLoop() { this.lastTime = performance.now(); requestAnimationFrame(this.gameLoop.bind(this)); },

    gameLoop(time) {
        if (GameState.currentScreen !== 'game-screen') return;

        const dt = time - this.lastTime;
        this.lastTime = time;

        if (!GameState.isPaused && !UIManager.isMenuOpen()) {
            this.update(dt);
        }

        this.render();
        Input.update();

        requestAnimationFrame(this.gameLoop.bind(this));
    },

    update(dt) {
        if (DialogueSystem.active) {
            DialogueSystem.update(dt);
        } else {
            Player.update(dt);

            // Interaction check
            if (Input.isJustPressed('Space') || Input.isJustPressed('KeyE')) {
                const nearNPC = NPCRenderer.getNearbyNPC();
                if (nearNPC) {
                    DialogueSystem.start(nearNPC);
                } else {
                    // Check for foraging
                    this.tryForage();
                }
            }
        }

        TimeSystem.update(dt);
        PetManager.update(dt);
        NotificationSystem.update();
    },

    tryForage() {
        const area = WorldManager.getCurrentArea();
        if (!area?.forageSpots) return;

        for (let i = 0; i < area.forageSpots.length; i++) {
            const spot = area.forageSpots[i];
            const dx = Player.x - spot.x * CONFIG.TILE_SIZE;
            const dy = Player.y - spot.y * CONFIG.TILE_SIZE;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 50 && WorldManager.canForage(i)) {
                const itemId = WorldManager.forage(i);
                if (itemId) {
                    const item = ItemData[itemId];
                    NotificationSystem.show(`Found ${item?.emoji || '?'} ${item?.name[GameState.language] || itemId}!`, 'success');
                }
                return;
            }
        }
    },

    render() {
        this.ctx.fillStyle = '#1A1A2E';
        this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

        // Time tint
        const tints = { dawn: 'rgba(255,200,150,0.1)', day: null, dusk: 'rgba(255,150,100,0.15)', night: 'rgba(30,30,80,0.3)' };

        WorldRenderer.draw(this.ctx);
        NPCRenderer.draw(this.ctx);
        Player.draw(this.ctx);

        // Active pet
        if (PetManager.activePet) {
            const pet = PetData[PetManager.activePet.id];
            this.ctx.font = '20px Arial';
            this.ctx.fillText(pet?.emoji || '🐕', Player.x + 35, Player.y + 20);
        }

        const tint = tints[TimeSystem.getTimeOfDay()];
        if (tint) { this.ctx.fillStyle = tint; this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT); }

        NotificationSystem.draw(this.ctx);

        // Interaction hint
        const nearNPC = NPCRenderer.getNearbyNPC();
        if (nearNPC) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
            this.ctx.fillRect(CONFIG.CANVAS_WIDTH / 2 - 80, CONFIG.CANVAS_HEIGHT - 50, 160, 30);
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = '14px Outfit';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`Press E to talk to ${nearNPC.name[GameState.language]}`, CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT - 30);
            this.ctx.textAlign = 'left';
        }

        // Energy/Health bars
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(10, CONFIG.CANVAS_HEIGHT - 30, 104, 12);
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(12, CONFIG.CANVAS_HEIGHT - 28, (Player.energy / Player.maxEnergy) * 100, 8);
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '10px Arial';
        this.ctx.fillText(`⚡${Math.floor(Player.energy)}`, 14, CONFIG.CANVAS_HEIGHT - 20);
    },

    togglePause() {
        GameState.isPaused = !GameState.isPaused;
        document.getElementById('pause-menu')?.classList.toggle('hidden', !GameState.isPaused);
    },

    showControlsHelp() {
        const overlay = document.getElementById('controls-help');
        if (overlay) overlay.classList.remove('hidden');
    },

    hideControlsHelp() {
        const overlay = document.getElementById('controls-help');
        if (overlay) overlay.classList.add('hidden');
    },

    toggleControlsHelp() {
        const overlay = document.getElementById('controls-help');
        if (overlay) overlay.classList.toggle('hidden');
    },

    returnToMenu() {
        GameState.isPaused = false;
        document.getElementById('pause-menu')?.classList.add('hidden');
        this.hideControlsHelp();
        this.showScreen('main-menu');
    },

    saveGame() {
        const data = {
            player: { x: Player.x, y: Player.y, energy: Player.energy, health: Player.health, xp: Player.xp, level: Player.level },
            gameState: { gameTime: GameState.gameTime, day: GameState.day, language: GameState.language },
            inventory: Inventory.getSaveData(),
            quests: QuestManager.getSaveData(),
            crafting: CraftingSystem.getSaveData(),
            pets: PetManager.getSaveData(),
            world: WorldManager.getSaveData(),
            timestamp: Date.now()
        };
        localStorage.setItem('pahadiTales_save', JSON.stringify(data));
        NotificationSystem.show('💾 Game Saved!', 'success');
        document.getElementById('btn-continue').disabled = false;
    },

    loadGame() {
        try {
            const data = JSON.parse(localStorage.getItem('pahadiTales_save'));
            if (data) {
                Object.assign(Player, data.player);
                Object.assign(GameState, data.gameState);
                Inventory.loadSaveData(data.inventory);
                QuestManager.loadSaveData(data.quests);
                CraftingSystem.loadSaveData(data.crafting);
                PetManager.loadSaveData(data.pets);
                WorldManager.loadSaveData(data.world);
                this.setLanguage(GameState.language);
                this.showScreen('game-screen');
                this.startGameLoop();
            }
        } catch (e) { console.error('Load failed:', e); }
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => Game.init());
