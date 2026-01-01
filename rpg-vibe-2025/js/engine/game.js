/**
 * Pahadi Tales - Complete Game Engine
 * Integrates all systems for a 2-3 hour gameplay experience
 */

// Import all systems (they self-register on window)
import { QuestManager, QuestData, QuestState } from '../systems/quest.js';
import { Inventory, ItemData, ItemCategory } from '../systems/inventory.js';
import { CraftingSystem, CraftingRecipes } from '../systems/crafting.js';
import { WorldManager, AreaData, NPCData } from '../systems/world.js';
import { SocialSystem } from '../systems/social.js';
import { SpriteGenerator } from './sprites_generator.js';
import { DialogueGenerator } from '../systems/dialogue_gen.js';
import { LightingSystem } from '../systems/lighting.js';
import { DialogueSystem } from '../systems/dialogue.js';
import { PetManager, PetRenderer } from '../systems/pet.js';
import { MiniMap } from '../systems/minimap.js';
import { WeatherSystem } from '../systems/weather.js';
import { SoundSystem } from '../systems/sound.js';

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
    // Game State
    currentScreen: 'intro-screen',
    isPaused: false,
    language: 'en',
    spritesLoaded: false,

    // Time System
    gameTime: { hour: 6, minute: 0 },
    day: 1,
    season: 'spring',
    weather: 'sunny'
};

// Sprite Definitions (Synced with SpriteGenerator)
const SPRITES = {
    TERRAIN: {
        0: { x: 0, y: 0 },   // grass
        1: { x: 32, y: 0 },  // path (outdoor dirt)
        2: { x: 64, y: 0 },  // water
        3: { x: 0, y: 32 },  // tree
        4: { x: 32, y: 32 }, // rock
        5: { x: 96, y: 32 }, // wall/building
        6: { x: 128, y: 32 }, // flower pot
        7: { x: 160, y: 32 }, // lamp
        8: { x: 128, y: 0 }, // distressed wood
        10: { x: 64, y: 32 }, // bush
        11: { x: 96, y: 0 },  // snow
        12: { x: 160, y: 0 }  // indoor wooden floor
    },
    PLAYER: {
        down: [{ x: 0, y: 64 }, { x: 32, y: 64 }, { x: 64, y: 64 }, { x: 96, y: 64 }],
        up: [{ x: 0, y: 96 }, { x: 32, y: 96 }, { x: 64, y: 96 }, { x: 96, y: 96 }],
        left: [{ x: 0, y: 128 }, { x: 32, y: 128 }, { x: 64, y: 128 }, { x: 96, y: 128 }],
        right: [{ x: 0, y: 160 }, { x: 32, y: 160 }, { x: 64, y: 160 }, { x: 96, y: 160 }]
    },
    NPC: {
        villager: [{ x: 0, y: 192 }, { x: 32, y: 192 }, { x: 64, y: 192 }, { x: 96, y: 192 }],
        old_woman: [{ x: 0, y: 224 }, { x: 32, y: 224 }, { x: 64, y: 224 }, { x: 96, y: 224 }],
        man: [{ x: 0, y: 256 }, { x: 32, y: 256 }, { x: 64, y: 256 }, { x: 96, y: 256 }]
    },
    PETS: {
        sheepdog: [{ x: 0, y: 288 }, { x: 32, y: 288 }, { x: 64, y: 288 }, { x: 96, y: 288 }],
        mountain_cat: [{ x: 0, y: 320 }, { x: 32, y: 320 }, { x: 64, y: 320 }, { x: 96, y: 320 }],
        stray_dog: [{ x: 0, y: 288 }, { x: 32, y: 288 }, { x: 64, y: 288 }, { x: 96, y: 288 }]
    },
    EFFECTS: {
        sparkle: [{ x: 0, y: 352 }, { x: 32, y: 352 }, { x: 64, y: 352 }, { x: 96, y: 352 }]
    }
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

        // Movement with collision logic
        let nextX = this.x;
        let nextY = this.y;

        if (newX >= 0 && newX <= CONFIG.CANVAS_WIDTH - this.width) nextX = newX;
        if (newY >= 0 && newY <= CONFIG.CANVAS_HEIGHT - this.height) nextY = newY;

        // Check tile collision
        const collision = WorldRenderer.checkCollision(nextX, nextY, this.width, this.height);
        if (!collision) {
            this.x = nextX;
            this.y = nextY;
        } else {
            // Sliding collision: try moving only X
            if (!WorldRenderer.checkCollision(nextX, this.y, this.width, this.height)) {
                this.x = nextX;
            }
            // Sliding collision: try moving only Y
            else if (!WorldRenderer.checkCollision(this.x, nextY, this.width, this.height)) {
                this.y = nextY;
            }
        }

        // Emergency Unstuck: If currently inside a wall (e.g. bad spawn), push towards center FAST
        if (WorldRenderer.checkCollision(this.x, this.y, this.width, this.height)) {
            const centerX = CONFIG.CANVAS_WIDTH / 2;
            const centerY = CONFIG.CANVAS_HEIGHT / 2;
            const dirX = centerX - this.x;
            const dirY = centerY - this.y;
            // Push towards center AGGRESSIVELY (3 pixels per frame = escapes in ~1 second)
            this.x += Math.sign(dirX) * 3;
            this.y += Math.sign(dirY) * 3;
        }

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
                console.log(`[DEBUG] Transitioning ${dir} to ${conn?.area}`, conn);
                if (!conn) { console.error('Connection undefined!'); return; }

                const result = WorldManager.changeArea(conn.area, conn.x * CONFIG.TILE_SIZE, conn.y * CONFIG.TILE_SIZE);
                console.log('[DEBUG] Transition Result:', result);

                if (result.success) {
                    // Clamp player position to screen bounds safely - prevent immediate re-trigger
                    this.x = Math.max(50, Math.min(result.x, CONFIG.CANVAS_WIDTH - 64));
                    this.y = Math.max(50, Math.min(result.y, CONFIG.CANVAS_HEIGHT - 64));
                    console.log(`📍 Transferred to ${conn.area} at ${this.x}, ${this.y}`);
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
        if (GameState.spritesLoaded && Game.sprites) {
            const frames = SPRITES.PLAYER[this.direction] || SPRITES.PLAYER.down;
            const sprite = frames[this.animFrame % frames.length];
            // Draw debug/fallback box first
            if (isNaN(this.x) || isNaN(this.y)) {
                console.error('[CRITICAL] Player Coordinates NaN!', this.x, this.y);
                this.x = 400; this.y = 300; // Emergency Reset
            }
            if (this.x < 0 || this.x > 800) console.warn('[WARN] Player off screen X', this.x);



            // Draw player


            ctx.drawImage(Game.sprites, sprite.x, sprite.y, 32, 32, this.x, this.y, 32, 32);
        } else {
            // Draw player sprite (simple colored rectangle for now)
            const colors = { up: '#E8A87C', down: '#E8A87C', left: '#D49A70', right: '#D49A70' };
            ctx.fillStyle = colors[this.direction];
            ctx.fillRect(this.x, this.y, this.width, this.height);

            // Head
            ctx.fillStyle = '#FFDAB9';
            ctx.fillRect(this.x + 8, this.y + 4, 16, 12);
        }
    }
};

// ============================================================
// INPUT HANDLER
// ============================================================
const Input = {
    keys: {},
    lastKeys: {},

    init() {
        console.log('🎮 Input System Disengaged... Re-engaging...');
        // Expose to window for mobile/global access
        window.Input = Input;

        window.addEventListener('keydown', (e) => {
            // console.log('Key:', e.code);
            Input.keys[e.code] = true;
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'Escape', 'KeyI', 'KeyQ', 'KeyM', 'KeyC', 'KeyE', 'KeyH'].includes(e.code)) {
                e.preventDefault();
            }
        });
        window.addEventListener('keyup', (e) => { Input.keys[e.code] = false; });
        console.log('🎮 Input System Ready');
    },

    isPressed(key) { return Input.keys[key] === true; },
    isJustPressed(key) { return Input.keys[key] === true && Input.lastKeys[key] !== true; },
    update() { Input.lastKeys = { ...Input.keys }; }
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
// ============================================================
// DIALOGUE SYSTEM (OVERHAULED)
// ============================================================
const DialogueSystem = {
    active: false,
    currentNPC: null,
    currentText: '',
    displayedText: '',
    textIndex: 0,
    choices: [],
    waitingForChoice: false,

    start(npc) {
        this.active = true;
        this.currentNPC = npc;
        npc._emoteTimer = 300; // Hop for 300ms
        SoundSystem.playSfx('talk'); // Chipmunk talk sound!
        this.choices = [];
        this.waitingForChoice = false;

        const rel = SocialSystem.getRelationship(npc.id);
        const lang = GameState.language;

        // Intro with relationship status
        const statusEmoji = rel.status === 'Partner' ? '❤️' : rel.status === 'Friend' ? '😊' : '👤';
        document.querySelector('.dialogue-speaker').textContent = `${npc.name[lang]} (${statusEmoji} ${rel.status})`;
        document.getElementById('dialogue-box').classList.remove('hidden');

        // Initial Text
        let dialogueKey = 'greeting';

        let initialText = npc.dialogues[dialogueKey]?.[lang] || "Hello!";

        // 50% chance to override with procedural text if it's just a greeting
        if (dialogueKey === 'greeting' && Math.random() > 0.5) {
            // Access TimeSystem through window if needed or assume global
            const hour = window.TimeSystem ? window.TimeSystem.hour : 12;
            initialText = DialogueGenerator.generate(npc, hour, 'clear');
        }

        this.setText(initialText);

        // Determine Player Mood based on Energy/Health (Realism!)
        let mood = 'neutral';
        if (window.Player.energy > 80) mood = 'happy';
        if (window.Player.energy < 30) mood = 'tired';

        // Generate Dynamic Choice Text
        const chatText = DialogueGenerator.generatePlayerChoice('chat', mood, rel.status);
        const giftText = DialogueGenerator.generatePlayerChoice('gift', mood, rel.status);
        const byeText = DialogueGenerator.generatePlayerChoice('bye', mood, rel.status);

        // Set choices immediately
        this.setChoices([
            { text: chatText, action: 'chat' },
            { text: giftText, action: 'gift' },
            { text: byeText, action: 'close' }
        ]);

        // Add specific options based on status
        if (['Friend', 'Good Friend', 'Best Friend', 'Partner'].includes(rel.status) && npc.dialogues.deep) {
            this.choices.splice(1, 0, { text: '✨ Deep Talk', action: 'deep_talk' });
        }

        if (SocialSystem.canDate(npc.id)) {
            this.choices.push({ text: '❤️ Confess Love', action: 'date' });
        }
    },

    setText(text) {
        this.currentText = text;
        this.displayedText = '';
        this.textIndex = 0;
        this.waitingForChoice = false;
        // Hide choices until text done? Or show immediately? 
        // Let's show text first.
        document.querySelector('.dialogue-text').textContent = '';
        document.getElementById('dialogue-choices')?.remove(); // Clear old choices
    },

    setChoices(choices) {
        this.choices = choices;
    },

    renderChoices() {
        const box = document.getElementById('dialogue-box');
        let choicesEl = document.getElementById('dialogue-choices');
        if (!choicesEl) {
            choicesEl = document.createElement('div');
            choicesEl.id = 'dialogue-choices';
            choicesEl.style.cssText = 'display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap;';
            box.appendChild(choicesEl);
        }
        choicesEl.innerHTML = '';

        this.choices.forEach((choice, index) => {
            const btn = document.createElement('button');
            btn.textContent = choice.text;
            btn.className = 'menu-btn';
            btn.onclick = () => this.handleChoice(choice.action);
            choicesEl.appendChild(btn);
        });
        this.waitingForChoice = true;
    },

    handleChoice(action) {
        const npc = this.currentNPC;
        const lang = GameState.language;

        if (action === 'close') {
            this.close();
            return;
        }

        if (action === 'chat') {
            // Check if NPC has specific topics
            if (npc.topics) {
                const topicChoices = Object.entries(npc.topics).map(([key, data]) => ({
                    text: data.q[lang],
                    action: `ask_${key}`
                }));
                topicChoices.push({ text: lang === 'hi' ? 'वापस' : 'Back', action: 'back' });
                this.setText(lang === 'hi' ? 'आप क्या जानना चाहते हैं?' : 'What would you like to ask?');
                this.setChoices(topicChoices);
                return;
            }

            // Fallback generic chat
            const msgs = [
                lang === 'hi' ? 'आज मौसम अच्छा है।' : 'Steps are light today.',
                lang === 'hi' ? 'क्या आपने वो बादल देखा?' : 'Did you see that cloud?',
                npc.dialogues.wisdom?.[lang]
            ];
            const msg = msgs[Math.floor(Math.random() * msgs.length)] || '...';
            this.setText(msg);
            SocialSystem.addXP(npc.id, 2);
            this.setChoices([{ text: '...', action: 'back' }]);
        }

        if (action === 'deep_talk') {
            this.setText(npc.dialogues.deep[lang]);
            SocialSystem.addXP(npc.id, 10);
            this.setChoices([{ text: '...', action: 'back' }]);
            return;
        }

        if (action.startsWith('ask_')) {
            const topicKey = action.replace('ask_', '');
            const topic = npc.topics[topicKey];
            if (topic) {
                this.setText(topic.a[lang]);
                SocialSystem.addXP(npc.id, 5); // More XP for deep questions
                this.setChoices([{ text: 'Wow!', action: 'chat' }, { text: 'Bye', action: 'close' }]);
            }
        }

        if (action === 'gift') {
            // Open inventory to pick gift?
            // Simple fallback for now
            if (Inventory.items.length > 0) {
                // Logic to give first item? Or open menu?
                // Let's just say "Use Inventory to Give"
                this.setText(lang === 'hi' ? 'कृपया अपनी इन्वेंटरी से एक आइटम चुनें।' : 'Please open Inventory (I) and click an item to give.');
                this.setChoices([{ text: 'OK', action: 'back' }]);
            } else {
                this.setText(lang === 'hi' ? 'आपके पास कुछ नहीं है!' : 'You have nothing to give!');
                this.setChoices([{ text: 'OK', action: 'back' }]);
            }
        }

        if (action === 'date') {
            if (SocialSystem.startDating(npc.id)) {
                this.setText("Oh! I... I feel the same way! ❤️");
                NotificationSystem.show(`You are now dating ${npc.name[lang]}!`, 'success');
            } else {
                this.setText("I think we should just be friends...");
            }
            this.setChoices([{ text: '❤️', action: 'back' }]);
        }

        if (action === 'back') {
            this.start(npc); // Restart menu
        }
    },

    update(deltaTime) {
        if (!this.active) return;

        if (this.textIndex < this.currentText.length) {
            this.displayedText += this.currentText[this.textIndex];
            this.textIndex++;
            document.querySelector('.dialogue-text').textContent = this.displayedText;
        } else if (!this.waitingForChoice && this.choices.length > 0) {
            this.renderChoices();
        }

        // Input handling for skipping text
        if (Input.isJustPressed('Space') || Input.isJustPressed('Enter')) {
            if (this.textIndex < this.currentText.length) {
                this.displayedText = this.currentText;
                this.textIndex = this.currentText.length;
                document.querySelector('.dialogue-text').textContent = this.displayedText;
            }
        }
        if (Input.isJustPressed('Escape')) this.close();
    },

    close() {
        this.active = false;
        this.currentNPC = null;
        document.getElementById('dialogue-box').classList.add('hidden');
        document.getElementById('dialogue-choices')?.remove();
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

        // Context Menu logic could be here, but for now simple toggle
        if (item?.category === 'food') {
            if (Inventory.useItem(itemId)) {
                NotificationSystem.show(`Used ${item.emoji} ${item.name[GameState.language]}`, 'success');
                this.openMenu('inventory'); // Refresh
            }
        } else if (item?.category === 'furniture') {
            // Place mode
            this.closeMenu();
            Game.startPlacement(itemId);
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

        // Active Quest Tracker
        const trackerEl = document.getElementById('quest-tracker-hud');
        if (!trackerEl) {
            const div = document.createElement('div');
            div.id = 'quest-tracker-hud';
            div.style.cssText = 'position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.6); padding: 10px; border-radius: 8px; color: #FFF; font-family: Outfit, sans-serif; pointer-events: none; border: 1px solid #E8A87C; max-width: 250px;';
            document.getElementById('game-screen').appendChild(div);
        } else {
            const activeQuest = QuestManager.getActiveQuests().find(q => q.definition.type === 'main') || QuestManager.getActiveQuests()[0];
            if (activeQuest) {
                const step = activeQuest.objectives.find(o => o.current < o.count);
                trackerEl.innerHTML = `
                    <div style="color: #FFD700; font-size: 12px; font-weight: bold; margin-bottom: 4px;">🎯 OBJECTIVE</div>
                    <div style="font-size: 14px;">${activeQuest.definition.title[GameState.language]}</div>
                    <div style="font-size: 12px; color: #CCC; margin-top: 2px;">• ${step ? step.desc[GameState.language] : 'Complete!'}</div>
                `;
                trackerEl.classList.remove('hidden');
            } else {
                trackerEl.classList.add('hidden');
            }
        }
    },

    // Shopping System
    shopInventory: {
        'spice_stall': [
            { item: 'cardamom', price: 15, stock: 10 },
            { item: 'cinnamon', price: 12, stock: 8 },
            { item: 'turmeric', price: 8, stock: 15 },
            { item: 'ginger', price: 6, stock: 12 },
            { item: 'saffron', price: 60, stock: 3 }
        ],
        'wool_stall': [
            { item: 'fine_wool', price: 18, stock: 8 },
            { item: 'goat_hair', price: 10, stock: 12 },
            { item: 'warm_shawl', price: 90, stock: 2 }
        ],
        'tool_stall': [
            { item: 'fishing_rod', price: 50, stock: 3 },
            { item: 'foraging_basket', price: 35, stock: 5 },
            { item: 'climbing_gear', price: 120, stock: 2 }
        ],
        'general': [
            { item: 'tea_leaves', price: 5, stock: 20 },
            { item: 'milk', price: 8, stock: 15 },
            { item: 'flour', price: 5, stock: 20 },
            { item: 'rice', price: 6, stock: 15 },
            { item: 'lentils', price: 6, stock: 15 },
            { item: 'honey', price: 20, stock: 8 }
        ]
    },

    renderShop(container, shopType = 'general') {
        const lang = GameState.language;
        const shop = this.shopInventory[shopType] || this.shopInventory.general;
        const shopNames = {
            'spice_stall': { en: 'Spice Shop', hi: 'मसाला दुकान' },
            'wool_stall': { en: 'Wool Shop', hi: 'ऊन दुकान' },
            'tool_stall': { en: 'Tool Shop', hi: 'औज़ार दुकान' },
            'general': { en: 'General Store', hi: 'किराना दुकान' }
        };

        container.innerHTML = `
            <div class="menu-panel shop-panel">
                <div class="menu-header">
                    <h2>🏪 ${shopNames[shopType][lang]}</h2>
                    <div class="coins">🪙 ${Inventory.coins}</div>
                    <button class="close-btn" onclick="UIManager.closeMenu()">✕</button>
                </div>
                <div class="shop-items">
                    ${shop.map(s => {
            const item = ItemData[s.item];
            const canAfford = Inventory.coins >= s.price;
            return `
                            <div class="shop-item ${canAfford ? '' : 'too-expensive'}" onclick="${canAfford ? `UIManager.buyItem('${shopType}', '${s.item}')` : ''}">
                                <span class="item-info">${item?.emoji || '?'} ${item?.name[lang] || s.item}</span>
                                <span class="price">🪙 ${s.price}</span>
                                <span class="stock">(${s.stock})</span>
                            </div>
                        `;
        }).join('')}
                </div>
                <div class="shop-hint">${lang === 'hi' ? 'खरीदने के लिए क्लिक करें' : 'Click to buy'}</div>
            </div>
        `;
    },

    buyItem(shopType, itemId) {
        const shop = this.shopInventory[shopType];
        const shopItem = shop?.find(s => s.item === itemId);
        if (!shopItem || shopItem.stock <= 0) return;

        if (Inventory.removeCoins(shopItem.price)) {
            Inventory.addItem(itemId, 1);
            shopItem.stock--;
            const item = ItemData[itemId];
            NotificationSystem.show(`Bought ${item?.emoji || ''} ${item?.name[GameState.language]}!`, 'success');
            this.renderShop(document.getElementById('menu-overlay'), shopType);
        }
    },

    openShop(shopType) {
        this.closeMenu();
        this.currentMenu = 'shop';
        const overlay = document.getElementById('menu-overlay') || this.createMenuOverlay();
        overlay.innerHTML = '';
        overlay.classList.remove('hidden');
        this.renderShop(overlay, shopType);
    },

    // Fishing Mini-Game
    startFishing() {
        if (!Inventory.hasItem('fishing_rod')) {
            NotificationSystem.show(GameState.language === 'hi' ? '🎣 मछली पकड़ने की छड़ चाहिए!' : '🎣 Need a fishing rod!', 'warning');
            return;
        }

        const lang = GameState.language;
        this.closeMenu();
        this.currentMenu = 'fishing';
        const overlay = document.getElementById('menu-overlay') || this.createMenuOverlay();

        overlay.innerHTML = `
            <div class="menu-panel fishing-panel">
                <div class="menu-header">
                    <h2>🎣 ${lang === 'hi' ? 'मछली पकड़ना' : 'Fishing'}</h2>
                    <button class="close-btn" onclick="UIManager.closeMenu()">✕</button>
                </div>
                <div class="fishing-game">
                    <p>${lang === 'hi' ? 'स्पेस दबाएं जब मछली दिखे!' : 'Press SPACE when you see a fish!'}</p>
                    <div class="fishing-area" id="fishing-area">
                        <div class="water-line">〰️〰️〰️〰️〰️〰️</div>
                        <div class="fish-indicator" id="fish-indicator">🐟</div>
                    </div>
                    <button class="menu-btn primary" onclick="UIManager.castLine()">
                        ${lang === 'hi' ? 'डाल दो!' : 'Cast Line!'}
                    </button>
                </div>
            </div>
        `;
        overlay.classList.remove('hidden');
    },

    castLine() {
        const indicator = document.getElementById('fish-indicator');
        if (!indicator) return;

        indicator.style.opacity = '0';

        // Random time for fish to appear (1-4 seconds)
        const fishTime = 1000 + Math.random() * 3000;

        setTimeout(() => {
            if (this.currentMenu !== 'fishing') return;
            indicator.style.opacity = '1';

            // Fish window (1.5 seconds to catch)
            this.fishCatchable = true;
            setTimeout(() => {
                this.fishCatchable = false;
                indicator.style.opacity = '0';
            }, 1500);
        }, fishTime);
    },

    catchFish() {
        if (this.fishCatchable) {
            this.fishCatchable = false;
            Inventory.addItem('fish', 1);
            NotificationSystem.show(GameState.language === 'hi' ? '🐟 मछली पकड़ी!' : '🐟 Caught a fish!', 'success');
            Player.addXP(10);
        } else {
            NotificationSystem.show(GameState.language === 'hi' ? 'छूट गई!' : 'Missed!', 'warning');
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
        0: '#4A7C59', // grass (Vibrant Green)
        1: '#C4A77D', // path
        2: '#4A90A4', // water
        3: '#2D5A27', // tree
        4: '#808080', // rock
        5: '#D4B896', // building
        6: '#FF69B4', // flower (Added)
        10: '#6B8E23', // forage
        11: '#FFFFFF'  // snow
    },

    cachedTiles: null,
    lastAreaId: null,

    isWalkable(tile) {
        // 0:Grass, 1:Path, 6:Flower, 8:Wood, 12:Indoor Floor, 11:Snow are walkable
        // 2:Water, 3:Tree, 4:Rock, 5:Building, 10:Bush are obstacles
        return [0, 1, 6, 7, 8, 9, 11, 12].includes(tile);
    },

    checkCollision(x, y, w, h) {
        if (!this.cachedTiles) return false;

        // Define a slightly smaller hit box for the player (feet)
        const hitX = x + 4;
        const hitY = y + 16;
        const hitW = w - 8;
        const hitH = h - 16;

        // 1. Check Terrain Tiles
        const points = [
            { x: hitX, y: hitY },
            { x: hitX + hitW, y: hitY },
            { x: hitX, y: hitY + hitH },
            { x: hitX + hitW, y: hitY + hitH }
        ];

        for (const p of points) {
            const tx = Math.floor(p.x / CONFIG.TILE_SIZE);
            const ty = Math.floor(p.y / CONFIG.TILE_SIZE);

            if (ty >= 0 && ty < this.cachedTiles.length && tx >= 0 && tx < this.cachedTiles[0].length) {
                const tile = this.cachedTiles[ty][tx];
                if (!this.isWalkable(tile)) return true;
            }
        }

        // 2. Interactables are now NON-SOLID to allow free movement
        // Player can walk over/through them - they are for interaction only, not collision
        // This fixes the "trapped" issue where interactables blocked all paths
        const area = WorldManager.getCurrentArea();

        // 3. Check Placed Furniture
        if (area) {
            const furnitureList = WorldManager.placedFurniture[area.id];
            if (furnitureList) {
                for (const f of furnitureList) {
                    const fx = f.x * CONFIG.TILE_SIZE;
                    const fy = f.y * CONFIG.TILE_SIZE;

                    if (hitX < fx + 32 && hitX + hitW > fx &&
                        hitY < fy + 32 && hitY + hitH > fy) {
                        return true;
                    }
                }
            }
        }

        return false;
    },

    generateAreaTiles(area) {
        // Use a simple seeded random or just Math.random() since we will cache it
        // Ideally we would use a seed based on x,y to make it deterministic across visits, 
        // but for now caching per visit is sufficient to stop the "moving background" bug.
        const tiles = [];
        for (let y = 0; y < Math.ceil(CONFIG.CANVAS_HEIGHT / CONFIG.TILE_SIZE); y++) {
            tiles[y] = [];
            for (let x = 0; x < Math.ceil(CONFIG.CANVAS_WIDTH / CONFIG.TILE_SIZE); x++) {
                // Default to grass
                let tile = 0;

                // Area-specific features
                if (area.id === 'tea_house') {
                    // Indoor wooden floor (tile 12)
                    tile = 12;
                    // Walls only at edges
                    if (y === 0 || y === Math.ceil(CONFIG.CANVAS_HEIGHT / CONFIG.TILE_SIZE) - 1 ||
                        x === 0 || x === Math.ceil(CONFIG.CANVAS_WIDTH / CONFIG.TILE_SIZE) - 1) {
                        tile = 5; // Wall
                    }
                    // Doorway at bottom center (wider)
                    if (y === Math.ceil(CONFIG.CANVAS_HEIGHT / CONFIG.TILE_SIZE) - 1 && x >= 10 && x <= 14) {
                        tile = 12; // Floor at doorway
                    }
                }

                if (area.id === 'village_square') {
                    if (x >= 10 && x <= 14) tile = 1;
                    if (tile === 0 && Math.random() > 0.95) tile = 6; // Flowers
                }

                if (area.id === 'riverside' && y > 12) tile = 2;
                if (area.id === 'pine_forest') {
                    if (Math.random() > 0.85) tile = 3; // Trees
                    else if (Math.random() > 0.95) tile = 6; // Flowers
                }
                if (area.id === 'temple_hill' && y < 5 && x > 8 && x < 16) tile = 5;
                if (area.id === 'hot_springs' && x > 8 && x < 14 && y > 6 && y < 14) tile = 2;
                if (area.id === 'mountain_peak' && Math.random() > 0.8) tile = 11;
                if (area.id === 'high_meadow' && y < 3) tile = 11;
                if (area.id === 'high_meadow' && tile === 0 && Math.random() > 0.9) tile = 6;

                tiles[y][x] = tile;
            }
        }
        return tiles;
    },

    draw(ctx) {
        const area = WorldManager.getCurrentArea();
        if (!area) return;

        // check cache
        if (this.lastAreaId !== area.id || !this.cachedTiles) {
            this.cachedTiles = this.generateAreaTiles(area);
            this.lastAreaId = area.id;
        }
        const tiles = this.cachedTiles;

        // Draw tiles
        for (let y = 0; y < tiles.length; y++) {
            for (let x = 0; x < tiles[y].length; x++) {
                const tile = tiles[y][x];
                const tx = x * CONFIG.TILE_SIZE;
                const ty = y * CONFIG.TILE_SIZE;

                if (GameState.spritesLoaded && Game.sprites) {
                    // Draw ground first for transparent objects
                    if ([3, 4, 10].includes(tile)) {
                        const ground = SPRITES.TERRAIN[0]; // grass
                        ctx.drawImage(Game.sprites, ground.x, ground.y, 32, 32, tx, ty, 32, 32);
                    }

                    // specialized drawing
                    const sprite = SPRITES.TERRAIN[tile] || SPRITES.TERRAIN[0];
                    if (tile === 3) { // Pine tree (tall)
                        // Draw at y-32 to use full height if sprite supported it, but sprite is currently packed.
                        // Based on generated image, tree might be just 32 wide but tall.
                        // Let's stick to standard 32x32 for safety unless we verify 32x64.
                        // Generative model prompt said "can take up 32x64", let's assume it fits in 32x64 cell if configured.
                        // But I will stick to 32x32 src for now to avoid glitches.
                        ctx.drawImage(Game.sprites, sprite.x, sprite.y, 32, 32, tx, ty, 32, 32);
                    } else if (tile === 6) { // Flowers
                        // Small colorful dots if no sprite
                        ctx.fillStyle = ['#FF69B4', '#FFD700', '#FF4500'][Math.floor(x % 3)];
                        ctx.beginPath();
                        ctx.arc(tx + 16, ty + 16, 4, 0, Math.PI * 2);
                        ctx.fill();
                    } else {
                        ctx.drawImage(Game.sprites, sprite.x, sprite.y, 32, 32, tx, ty, 32, 32);
                    }
                } else {
                    // Fallback to colors
                    ctx.fillStyle = this.tileColors[tile] || '#333';
                    ctx.fillRect(tx, ty, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                    // Add some texture
                    if (tile === 0 && Math.random() > 0.9) {
                        ctx.fillStyle = '#5C9A6A';
                        ctx.fillRect(tx + 8, ty + 8, 4, 4);
                    }
                }
            }
        }

        // Draw foraging spots
        if (area.forageSpots) {
            for (let i = 0; i < area.forageSpots.length; i++) {
                const spot = area.forageSpots[i];
                const canForage = WorldManager.canForage(i);

                if (GameState.spritesLoaded) {
                    if (canForage) {
                        const bush = SPRITES.TERRAIN[10];
                        ctx.shadowBlur = 5;
                        ctx.shadowColor = 'yellow';
                        ctx.drawImage(Game.sprites, bush.x, bush.y, 32, 32, spot.x * 32, spot.y * 32, 32, 32);
                        ctx.shadowBlur = 0;
                    }
                    // If harvested, maybe don't draw or draw empty bush?
                } else {
                    ctx.fillStyle = canForage ? '#FFD700' : '#888';
                    ctx.beginPath();
                    ctx.arc(spot.x * CONFIG.TILE_SIZE + 16, spot.y * CONFIG.TILE_SIZE + 16, 10, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        // Draw interactables
        if (area.interactables) {
            for (const inter of area.interactables) {
                const tx = inter.x * CONFIG.TILE_SIZE;
                const ty = inter.y * CONFIG.TILE_SIZE;

                // Interactables as props
                const emojiMap = {
                    '🌲': SPRITES.TERRAIN[3], // Tree
                    '🌳': SPRITES.TERRAIN[3], // Banyan -> Tree
                    '🪣': SPRITES.TERRAIN[5], // Well -> Wall/Stone
                    '📋': SPRITES.TERRAIN[5], // Notice -> Wall
                    '🛕': SPRITES.TERRAIN[5], // Temple -> Wall
                    '📦': SPRITES.TERRAIN[4], // Chest -> Rock
                    '🔥': SPRITES.TERRAIN[4], // Stove -> Rock
                    '🎣': SPRITES.TERRAIN[2], // Fishing -> Water
                    '🛏️': SPRITES.TERRAIN[5], // Bed -> Building
                    '🕸️': SPRITES.TERRAIN[10], // Dirt -> Bush/Mess
                    '🌫️': SPRITES.TERRAIN[10],
                    '🍂': SPRITES.TERRAIN[10],
                    '🪴': SPRITES.TERRAIN[6], // Flower Pot -> Flower
                    '🏮': SPRITES.TERRAIN[7], // Lamp -> Lamp Sprite
                    '🪑': SPRITES.TERRAIN[4], // Chair -> Rock (placeholder)
                    '🖼️': SPRITES.TERRAIN[5], // Photo -> Wall
                };

                let propSprite = emojiMap[inter.emoji];

                // Fallback to sparkle/crate if unknown AND no sprite found
                if (!propSprite) {
                    if (SPRITES.EFFECTS) {
                        // Animate sparkle
                        const frame = Math.floor(Date.now() / 200) % 4;
                        propSprite = SPRITES.EFFECTS.sparkle[frame];
                    } else {
                        // Pixel Crate Fallback if even sparkles are missing
                        ctx.fillStyle = '#8D6E63'; // Wood
                        ctx.fillRect(tx + 4, ty + 8, 24, 24);
                        ctx.fillStyle = '#FFF';
                        ctx.fillText('?', tx + 12, ty + 26);
                        continue; // Skip drawImage
                    }
                }

                if (inter.isDirt) {
                    // Draw dirt as pixel art (scattered pixels)
                    if (GameState.spritesLoaded) {
                        ctx.fillStyle = '#3E2723'; // Dark dirt
                        // Draw a little pixel pattern
                        ctx.fillRect(tx + 8, ty + 8, 8, 8);
                        ctx.fillRect(tx + 20, ty + 6, 6, 6);
                        ctx.fillRect(tx + 14, ty + 14, 10, 10); // Center pile
                        ctx.fillRect(tx + 6, ty + 20, 6, 6);
                        ctx.fillRect(tx + 22, ty + 18, 6, 6);

                        // dust motes
                        ctx.fillStyle = '#795548';
                        ctx.fillRect(tx + 12, ty + 12, 2, 2);
                        ctx.fillRect(tx + 18, ty + 20, 2, 2);
                    }
                } else if (inter.type === 'pickup') {
                    // Item pickup (e.g., Broom)
                    const item = ItemData[inter.item];
                    ctx.font = '24px Arial';
                    ctx.fillText(inter.emoji || '🎁', tx + 4, ty + 24);

                    // Floating indicator for quest items
                    const floatY = Math.sin(Date.now() / 200) * 5;
                    ctx.font = '16px Arial';
                    ctx.fillStyle = '#FFFF00';
                    ctx.fillText('▼', tx + 10, ty - 5 + floatY);

                    // Glow
                    ctx.shadowColor = '#FFFF00';
                    ctx.shadowBlur = 10;
                    ctx.strokeRect(tx, ty, 32, 32);
                    ctx.shadowBlur = 0;
                } else if (propSprite && GameState.spritesLoaded) {
                    ctx.drawImage(Game.sprites, propSprite.x, propSprite.y, 32, 32, tx, ty, 32, 32);
                }
            } // End loop
        } // End if (interactables)


        // Draw Placed Furniture
        const furnitureList = WorldManager.placedFurniture[area.id];
        if (furnitureList) {
            for (const f of furnitureList) {
                // Logic to get sprite from Item (we assume items have sprites or emojis)
                const item = ItemData[f.itemId];
                if (item) {
                    // Simple emoji render for now as items don't have dedicated sprite mapping yet
                    ctx.font = '24px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(item.emoji, f.x * CONFIG.TILE_SIZE + 16, f.y * CONFIG.TILE_SIZE + 24);
                    ctx.textAlign = 'left';
                }
            }
        }

        // Draw Placement Preview
        if (Game.placementMode) {
            const { x, y, itemId, valid } = Game.placementMode;
            const item = ItemData[itemId];
            ctx.globalAlpha = 0.6;
            ctx.fillStyle = valid ? '#4CAF50' : '#F44336';
            ctx.fillRect(x, y, 32, 32);
            if (item) {
                ctx.font = '24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(item.emoji, x + 16, y + 24);
                ctx.textAlign = 'left';
            }
            ctx.globalAlpha = 1.0;
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

            // Draw NPC
            if (GameState.spritesLoaded && Game.sprites) {
                // Basic mapping based on potential ID keywords
                let frames = SPRITES.NPC.villager;
                if (npc.id.includes('shop')) frames = SPRITES.NPC.villager;
                if (npc.id.includes('priest')) frames = SPRITES.NPC.man;
                if (npc.id.includes('dadi')) frames = SPRITES.NPC.old_woman;
                if (npc.id.includes('fisherman')) frames = SPRITES.NPC.man;

                // Animate NPC
                if (!npc._animTimer) npc._animTimer = 0;
                npc._animTimer += 16; // Approx 60fps
                if (npc._animTimer > 200) {
                    npc._animFrame = ((npc._animFrame || 0) + 1) % 4;
                    npc._animTimer = 0;
                }

                // Emote Animation (Hop)
                let yOffset = 0;
                if (npc._emoteTimer > 0) {
                    npc._emoteTimer -= 16;
                    // Simple sine wave hop
                    yOffset = Math.sin(npc._emoteTimer * 0.02) * 5;
                }

                // Use animation frame
                const sprite = frames[(npc._animFrame || 0) % 4];
                ctx.drawImage(Game.sprites, sprite.x, sprite.y, 32, 32, x, y - yOffset, 32, 32);
            } else {
                // Draw NPC body
                ctx.fillStyle = '#C38D9E';
                ctx.fillRect(x, y, 32, 32);

                // Head
                ctx.fillStyle = '#DEB887';
                ctx.fillRect(x + 8, y + 4, 16, 12);
            }
            // Remove emoji overlay
            // ctx.font = '20px Arial';
            // ctx.fillText(npc.emoji || '👤', x + 6, y - 5);

            // Name
            ctx.fillStyle = '#FFF';
            ctx.font = '12px Outfit';
            ctx.textAlign = 'center';
            ctx.fillText(npc.name[GameState.language], x + 16, y + 45);
            ctx.textAlign = 'left';
        }
    },

    getNearbyNPC() {
        // ... implementation existing in file ...
        const npcs = WorldManager.getNPCsInCurrentArea();

        for (const npc of npcs) {
            if (npc._x === undefined) continue;
            const dx = window.Player.x - npc._x;
            const dy = window.Player.y - npc._y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 50) return npc;
        }
        return null;
    }
};

// ============================================================
// PET RENDERER
// ============================================================
const PetRenderer = {
    draw(ctx) {
        if (!PetManager.activePet) return;

        const pet = PetManager.activePet;
        const player = window.Player;

        // Simple pet follow logic
        const targetX = player.x - (player.direction === 'right' ? 32 : -32);
        const targetY = player.y;

        if (typeof pet.x === 'undefined') {
            pet.x = targetX;
            pet.y = targetY;
            pet.direction = 'right';
            pet.animFrame = 0;
            pet.animTimer = 0;
        }

        const dx = targetX - pet.x;
        const dy = targetY - pet.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 5) {
            pet.x += dx * 0.05;
            pet.y += dy * 0.05;

            if (Math.abs(dx) > Math.abs(dy)) {
                pet.direction = dx > 0 ? 'right' : 'left';
            } else {
                pet.direction = dy > 0 ? 'down' : 'up';
            }

            pet.animTimer += 16;
            if (pet.animTimer > 150) {
                pet.animFrame = (pet.animFrame + 1) % 4;
                pet.animTimer = 0;
            }
        } else {
            pet.animFrame = 0;
        }

        if (GameState.spritesLoaded && Game.sprites) {
            const frames = SPRITES.PETS[pet.id] || SPRITES.PETS.sheepdog;
            const sprite = frames[pet.animFrame % frames.length];

            ctx.save();
            ctx.drawImage(Game.sprites, sprite.x, sprite.y, 32, 32, pet.x, pet.y, 32, 32);
            ctx.restore();
        } else {
            // ctx.font = '24px Arial';
            // ctx.fillText(PetData[pet.id]?.emoji || '🐕', pet.x, pet.y + 24);
            ctx.fillStyle = '#795548';
            ctx.fillRect(pet.x, pet.y + 10, 32, 20);
        }
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

        // Load Sprites
        this.sprites = new Image();
        this.sprites.src = SpriteGenerator.generate();
        this.sprites.onload = () => {
            GameState.spritesLoaded = true;
            console.log('✅ Sprites loaded from generator!');
        };
        this.sprites.onerror = (e) => {
            console.warn('❌ Failed to load sprites, fallback active', e);
        };

        // Initialize all systems
        Input.init();
        WorldManager.init();
        Inventory.init();
        QuestManager.init();
        CraftingSystem.init();
        PetManager.init();
        UIManager.init();
        MiniMap.init();
        LightingSystem.init();
        WeatherSystem.init();
        SoundSystem.init();

        // Music needs user interaction to start context usually
        window.addEventListener('keydown', () => {
            SoundSystem.resume();
            SoundSystem.startMusic();
        }, { once: true });

        // Check for existing save to enable Continue button
        if (localStorage.getItem('pahadiTales_save')) {
            const continueBtn = document.getElementById('btn-continue');
            if (continueBtn) {
                continueBtn.disabled = false;
                continueBtn.onclick = () => this.loadGame();
                console.log('📂 Save file found, enabling Continue button.');
            }
        }


        // Give player a starter pet!
        PetManager.adoptPet('sheepdog');

        this.setupUI();
        this.setLanguage('en');
        this.addMenuOverlayStyles();

        console.log('🏔️ Pahadi Tales loaded with all systems!');

        // Expose systems globally for debugging and cross-module access
        window.Game = this;
        window.SoundSystem = SoundSystem;


        // Initial Guidance
        setTimeout(() => {
            if (GameState.day === 1 && WorldManager.currentArea === 'tea_house') {
                NotificationSystem.show("🏠 Walk SOUTH (down) to exit through the door!", 'info', 6000);
            }
        }, 1500);

        setTimeout(() => {
            NotificationSystem.show("🪵 Tip: Find firewood in Pine Forest (go WEST from village)!", 'info', 6000);
        }, 8000);
    },

    addMenuOverlayStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .menu-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 50; animation: fadeIn 0.3s ease; }
            .menu-overlay.hidden { display: none; }
            .menu-panel { background: linear-gradient(135deg, #2D2D44 0%, #1A1A2E 100%); border: 2px solid #E8A87C; border-radius: 16px; padding: 20px; min-width: 400px; max-width: 600px; max-height: 80vh; overflow-y: auto; animation: slideUp 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28); }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
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
        document.getElementById('lang-en')?.addEventListener('click', () => {
            console.log('Language set to EN');
            this.setLanguage('en');
        });
        document.getElementById('lang-hi')?.addEventListener('click', () => {
            console.log('Language set to HI');
            this.setLanguage('hi');
        });
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
            if (btn) {
                btn.disabled = false;
                // Remove any existing listeners first to prevent duplicates (though typically setupUI runs once)
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                newBtn.addEventListener('click', () => this.loadGame());
            }
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

    // Visual Polish: Fade Transition
    async fadeTransition(callback) {
        const overlay = document.getElementById('transition-overlay');
        if (!overlay) return callback();

        overlay.style.opacity = '1';
        await new Promise(r => setTimeout(r, 500));

        callback();

        await new Promise(r => setTimeout(r, 100));
        overlay.style.opacity = '0';
    },

    async startNewGame() {
        // Clear tile cache for fresh start
        WorldRenderer.cachedTiles = null;
        WorldRenderer.lastAreaId = null;

        // Reset player to center of screen (safe spawn)
        Player.x = 400;
        Player.y = 300;
        Player.energy = Player.maxEnergy;
        Player.health = Player.maxHealth;

        // Reset world state
        WorldManager.currentArea = 'tea_house';
        WorldManager.visitedAreas = ['tea_house', 'village_square'];

        // Clear any stale save that might override positions
        // (Player can manually save later)

        this.showScreen('intro-screen');
        await this.playIntro();

        this.fadeTransition(() => {
            this.showScreen('game-screen');
            this.startGameLoop();
        });

        // Show controls help only on truly first play
        if (!sessionStorage.getItem('pahadi_controls_shown')) {
            this.showControlsHelp();
            sessionStorage.setItem('pahadi_controls_shown', 'true');
        }

        setTimeout(() => {
            NotificationSystem.show('QUEST: Go WEST to Pine Forest for a surprise! 🐕', 'success', 8000);
        }, 2000);
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

    skipIntro() {
        // Clear tile cache for fresh start
        WorldRenderer.cachedTiles = null;
        WorldRenderer.lastAreaId = null;

        // Reset player to center of screen (safe spawn)
        Player.x = 400;
        Player.y = 300;

        // Reset world state
        WorldManager.currentArea = 'tea_house';

        this.showScreen('game-screen');
        this.startGameLoop();
    },

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
        if (GameState.isPaused) {
            // Do nothing
        } else if (Game.placementMode) {
            Game.updatePlacement();
        } else if (DialogueSystem.active) {
            DialogueSystem.update(dt);
        } else {
            Player.update(dt);

            // Interaction check
            if (Input.isJustPressed('Space') || Input.isJustPressed('KeyE')) {
                const nearNPC = NPCRenderer.getNearbyNPC();
                if (nearNPC) {
                    this.handleNPCInteraction(nearNPC);
                } else {
                    // Check for interactables (including dirt/furniture)
                    if (!this.tryInteract()) {
                        this.tryForage();
                    }
                }
            }
        }

        TimeSystem.update(dt);
        WeatherSystem.update(dt);
        PetManager.update(dt);
        NotificationSystem.update();
    },

    tryInteract() {
        const area = WorldManager.getCurrentArea();
        if (!area?.interactables) return false;

        for (let i = 0; i < area.interactables.length; i++) {
            const inter = area.interactables[i];
            const dx = Player.x - (inter.x * CONFIG.TILE_SIZE + 16);
            const dy = Player.y - (inter.y * CONFIG.TILE_SIZE + 16);
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 40) {
                if (inter.type === 'pickup') {
                    // Pickup item
                    if (Inventory.addItem(inter.item, 1)) {
                        area.interactables.splice(i, 1);
                        NotificationSystem.show(`Picked up ${inter.emoji} ${ItemData[inter.item].name[GameState.language]}`, 'success');
                        SoundSystem.playSfx('collect');
                        return true;
                    } else {
                        NotificationSystem.show('Inventory full!', 'warning');
                        return true;
                    }
                }
                if (inter.type === 'clean') {
                    // Check for Broom
                    if (!Inventory.hasItem('broom')) {
                        NotificationSystem.show(GameState.language === 'hi' ? 'मुझे झाड़ू चाहिए।' : 'I need a broom to clean this.', 'warning');
                        return true;
                    }

                    // Remove dirt
                    area.interactables.splice(i, 1);
                    NotificationSystem.show(GameState.language === 'hi' ? 'साफ़ किया!' : 'Cleaned!', 'success');
                    SoundSystem.playSfx('collect'); // Or a sweep sound if available
                    // Update Quest
                    QuestManager.updateObjective('interact', 'dhaba_dirt', 1);
                    return true;
                }
                if (inter.type === 'inspect') {
                    NotificationSystem.show(inter.desc[GameState.language], 'info');
                    return true;
                }
                if (inter.type === 'read') {
                    NotificationSystem.show(inter.desc[GameState.language], 'info', 5000);
                    return true;
                }
            }
        }
        return false;
    },

    tryForage() {
        const area = WorldManager.getCurrentArea();
        if (!area?.forageSpots) return;

        for (let i = 0; i < area.forageSpots.length; i++) {
            const spot = area.forageSpots[i];
            const dx = Player.x - (spot.x * CONFIG.TILE_SIZE + 16); // Center of tile
            const dy = Player.y - (spot.y * CONFIG.TILE_SIZE + 16);
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 40 && WorldManager.canForage(i)) {
                const result = WorldManager.forage(i);
                if (result) {
                    const { itemId, quantity } = result;
                    const item = ItemData[itemId];
                    NotificationSystem.show(`Found ${quantity}x ${item?.emoji || '?'} ${item?.name[GameState.language] || itemId}!`, 'success');
                    // Quest update
                    QuestManager.updateObjective('collect', itemId, quantity);
                    QuestManager.updateObjective('collect', 'any_forage', quantity);
                }
                return;
            }
        }
    },

    handleNPCInteraction(npc) {
        // Check for 'give' quests
        const activeQuests = QuestManager.getActiveQuests();
        for (const quest of activeQuests) {
            const giveObj = quest.objectives.find(o => o.type === 'give' && o.target === npc.id && o.current < o.count);
            if (giveObj) {
                if (Inventory.hasItem(giveObj.item, 1)) {
                    Inventory.removeItem(giveObj.item, 1);
                    QuestManager.updateObjective('give', npc.id, 1); // This handles completion logic
                    NotificationSystem.show(`Gave ${ItemData[giveObj.item]?.name[GameState.language]} to ${npc.name[GameState.language]}`, 'success');

                    // Special dialogue for giving item?
                    if (npc.id === 'stray_dog' && giveObj.item === 'milk') {
                        DialogueSystem.start({ ...npc, dialogues: { greeting: NPCData['stray_dog'].dialogues.happy } });
                        return;
                    }
                } else {
                    NotificationSystem.show(`Need ${ItemData[giveObj.item]?.name[GameState.language]} to give!`, 'warning');
                }
            }
        }

        // Standard Dialogue
        DialogueSystem.start(npc);
    },

    // Furniture Placement
    placementMode: null, // { itemId, valid }

    startPlacement(itemId) {
        this.placementMode = { itemId, valid: false, x: 0, y: 0 };
        NotificationSystem.show(GameState.language === 'hi' ? 'रखने के लिए क्लिक करें' : 'Click/Space to Place', 'info');
    },

    updatePlacement() {
        if (!this.placementMode) return;

        // Snapping logic
        const gridX = Math.floor(Player.x / CONFIG.TILE_SIZE + (Player.direction === 'right' ? 1 : Player.direction === 'left' ? -1 : 0));
        const gridY = Math.floor(Player.y / CONFIG.TILE_SIZE + (Player.direction === 'down' ? 1 : Player.direction === 'up' ? -1 : 0));

        this.placementMode.x = gridX * CONFIG.TILE_SIZE;
        this.placementMode.y = gridY * CONFIG.TILE_SIZE;

        // Validate
        this.placementMode.valid = !WorldRenderer.checkCollision(this.placementMode.x, this.placementMode.y, 32, 32);

        if (Input.isJustPressed('Space') || Input.isJustPressed('KeyE')) {
            if (this.placementMode.valid) {
                WorldManager.placeFurniture(this.placementMode.itemId, gridX, gridY);
                Inventory.removeItem(this.placementMode.itemId, 1);
                this.placementMode = null;
                NotificationSystem.show('Placed!', 'success');
            } else {
                NotificationSystem.show('Cannot place here!', 'warning');
            }
        }

        if (Input.isJustPressed('Escape')) {
            this.placementMode = null;
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

        PetRenderer.draw(this.ctx);
        // Draw HUD
        UIManager.drawHUD(this.ctx);
        MiniMap.draw();

        // Draw Transitions
        TransitionSystem.draw(this.ctx);

        // Weather (Rain/Snow)
        WeatherSystem.draw(this.ctx);

        // New Lighting System (Day/Night + Flares)
        LightingSystem.render(this.ctx);


        // Vivid Atmosphere Overlay (Vignette)
        const gradient = this.ctx.createRadialGradient(
            CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2, 200,
            CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2, 500
        );
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.3)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

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
        try {
            // Validate data before saving
            const data = {
                version: 1, // Save format version
                player: { x: Player.x, y: Player.y, energy: Player.energy, health: Player.health, xp: Player.xp, level: Player.level },
                gameState: { gameTime: GameState.gameTime, day: GameState.day, language: GameState.language },
                inventory: Inventory.getSaveData(),
                quests: QuestManager.getSaveData(),
                crafting: CraftingSystem.getSaveData(),
                pets: PetManager.getSaveData(),
                world: WorldManager.getSaveData(),
                social: SocialSystem.getSaveData(), // New
                timestamp: Date.now()
            };

            // Convert to string and check size (rough check)
            const json = JSON.stringify(data);
            if (json.length > 4000000) {
                console.warn('Save file is large:', json.length);
            }

            localStorage.setItem('pahadiTales_save', json);
            NotificationSystem.show('💾 Game Saved!', 'success');

            // Enable continue button immediately
            const continueBtn = document.getElementById('btn-continue');
            if (continueBtn) {
                continueBtn.disabled = false;
                // Ensure listener works
                continueBtn.onclick = () => this.loadGame();
            }
        } catch (e) {
            console.error('Save failed:', e);
            if (e.name === 'QuotaExceededError') {
                NotificationSystem.show('❌ Save failed: Storage full!', 'warning');
            } else {
                NotificationSystem.show('❌ Save failed!', 'warning');
            }
        }
    },

    loadGame() {
        try {
            const json = localStorage.getItem('pahadiTales_save');
            if (!json) {
                NotificationSystem.show('❌ No save found!', 'warning');
                return;
            }

            const data = JSON.parse(json);

            // Validation
            if (!data.player || !data.gameState) {
                throw new Error('Invalid save data');
            }

            if (data) {
                if (data.player) Object.assign(Player, data.player);
                if (data.gameState) Object.assign(GameState, data.gameState);
                if (data.inventory) Inventory.loadSaveData(data.inventory);
                if (data.quests) QuestManager.loadSaveData(data.quests);
                if (data.crafting && CraftingSystem.loadSaveData) CraftingSystem.loadSaveData(data.crafting);
                if (data.pets) PetManager.loadSaveData(data.pets);
                if (data.world) WorldManager.loadSaveData(data.world);
                if (data.social && SocialSystem.loadSaveData) SocialSystem.loadSaveData(data.social);

                this.setLanguage(GameState.language);
                this.showScreen('game-screen');
                this.startGameLoop();
                NotificationSystem.show('📂 Save Loaded!', 'success');
                console.log('✅ Game loaded successfully');
            }
        } catch (e) {
            console.error('Load failed:', e);
            NotificationSystem.show('❌ Load failed: Corrupt data', 'warning');
            // Optional: offer to clear save?
        }
    }
};

// Mobile Controls Logic
const MobileControls = {
    init() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.matchMedia("(max-width: 768px)").matches) || ('ontouchstart' in window);
        if (isMobile) this.createControls();
    },

    createControls() {
        console.log('📱 Creating mobile controls');
        const style = document.createElement('style');
        style.textContent = `
            .d-pad { position: fixed; bottom: 30px; left: 30px; display: grid; grid-template-columns: 60px 60px 60px; grid-template-rows: 60px 60px 60px; gap: 5px; z-index: 1000; touch-action: none; user-select: none; }
            .d-btn { background: rgba(255, 255, 255, 0.15); border: 2px solid rgba(255, 255, 255, 0.4); border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 24px; color: white; -webkit-tap-highlight-color: transparent; }
            .d-btn:active { background: rgba(255, 255, 255, 0.4); transform: scale(0.95); }
            .d-up { grid-column: 2; grid-row: 1; }
            .d-left { grid-column: 1; grid-row: 2; }
            .d-right { grid-column: 3; grid-row: 2; }
            .d-down { grid-column: 2; grid-row: 3; }
            
            .action-btns { position: fixed; bottom: 40px; right: 30px; display: flex; gap: 20px; z-index: 1000; touch-action: none; user-select: none; }
            .ac-btn { width: 70px; height: 70px; border-radius: 50%; border: 3px solid white; color: white; font-size: 24px; display: flex; justify-content: center; align-items: center; font-weight: bold; box-shadow: 0 4px 10px rgba(0,0,0,0.3); -webkit-tap-highlight-color: transparent; }
            .btn-a { background: #4CAF50; }
            .btn-b { background: #FF9800; }
            .ac-btn:active { transform: scale(0.95); filter: brightness(1.2); }
        `;
        document.head.appendChild(style);

        const dpad = document.createElement('div');
        dpad.className = 'd-pad';
        dpad.innerHTML = `
            <div class="d-btn d-up" data-key="ArrowUp">⬆️</div>
            <div class="d-btn d-left" data-key="ArrowLeft">⬅️</div>
            <div class="d-btn d-right" data-key="ArrowRight">➡️</div>
            <div class="d-btn d-down" data-key="ArrowDown">⬇️</div>
        `;
        document.body.appendChild(dpad);

        const actions = document.createElement('div');
        actions.className = 'action-btns';
        actions.innerHTML = `
            <div class="ac-btn btn-b" data-key="KeyI">🎒</div>
            <div class="ac-btn btn-a" data-key="Space">✋</div>
        `;
        document.body.appendChild(actions);

        // Bind Events
        const handleTouch = (e, key, state) => {
            e.preventDefault();
            if (window.Input) window.Input.keys[key] = state;
        };

        document.querySelectorAll('.d-btn, .ac-btn').forEach(btn => {
            const key = btn.dataset.key;
            btn.addEventListener('touchstart', (e) => handleTouch(e, key, true), { passive: false });
            btn.addEventListener('touchend', (e) => handleTouch(e, key, false), { passive: false });
            btn.addEventListener('mousedown', (e) => handleTouch(e, key, true));
            btn.addEventListener('mouseup', (e) => handleTouch(e, key, false));
        });
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    Game.init();
    MobileControls.init();

    // Expose for debugging
    window.WorldRenderer = WorldRenderer;
});
