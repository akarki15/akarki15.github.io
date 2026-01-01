/**
 * Pahadi Tales - World Map System
 * Multiple connected areas with foraging, NPCs, and interactables
 */

export const TileType = {
    GRASS: 0, PATH: 1, WATER: 2, TREE: 3, ROCK: 4, BUILDING: 5,
    FLOWER: 6, BRIDGE: 7, FENCE: 8, DOOR: 9, FORAGE: 10, SNOW: 11
};

export const AreaData = {
    'village_square': {
        id: 'village_square',
        name: { en: 'Village Square', hi: 'गाँव का चौक' },
        width: 30, height: 22,
        music: 'village_theme',
        ambience: ['birds', 'wind'],
        connections: {
            north: { area: 'temple_hill', x: 15, y: 20 },
            south: { area: 'riverside', x: 15, y: 2 },
            east: { area: 'tea_house', x: 2, y: 10 },
            west: { area: 'pine_forest', x: 27, y: 10 }
        },
        npcs: ['dadi_kamala', 'raju', 'village_child'],
        forageSpots: [
            { x: 5, y: 5, items: ['berries', 'mushroom'], respawnHours: 12 },
            { x: 22, y: 8, items: ['tulsi', 'ginger'], respawnHours: 24 }
        ],
        interactables: [
            { id: 'notice_board', x: 14, y: 4, type: 'info', emoji: '📋' },
            { id: 'banyan_tree', x: 15, y: 10, type: 'landmark', emoji: '🌳' },
            { id: 'village_well', x: 20, y: 12, type: 'water', emoji: '🪣' }
        ]
    },
    'tea_house': {
        id: 'tea_house',
        name: { en: 'Moon Tea House', hi: 'चंद्र चाय घर' },
        width: 20, height: 15,
        music: 'cozy_theme',
        isIndoor: true,
        connections: {
            west: { area: 'village_square', x: 27, y: 10 }
        },
        npcs: ['traveler'],
        interactables: [
            { id: 'cooking_stove', x: 5, y: 5, type: 'craft', emoji: '🔥' },
            { id: 'storage_chest', x: 8, y: 3, type: 'storage', emoji: '📦' },
            { id: 'bed', x: 15, y: 3, type: 'rest', emoji: '🛏️' },
            { id: 'counter', x: 10, y: 8, type: 'serve', emoji: '☕' }
        ]
    },
    'temple_hill': {
        id: 'temple_hill',
        name: { en: 'Temple of Shiva', hi: 'शिव मंदिर' },
        width: 25, height: 20,
        music: 'temple_theme',
        ambience: ['bells', 'chanting'],
        connections: {
            south: { area: 'village_square', x: 15, y: 2 },
            north: { area: 'high_meadow', x: 12, y: 18 }
        },
        npcs: ['pandit_shankara', 'mysterious_sadhu'],
        interactables: [
            { id: 'main_shrine', x: 12, y: 5, type: 'pray', emoji: '🛕' },
            { id: 'meditation_spot', x: 18, y: 10, type: 'meditate', emoji: '🧘' },
            { id: 'temple_bell', x: 10, y: 8, type: 'interact', emoji: '🔔' },
            { id: 'temple_inscription', x: 8, y: 6, type: 'clue', emoji: '📜' }
        ],
        forageSpots: [
            { x: 20, y: 15, items: ['tulsi', 'flower'], respawnHours: 24 }
        ]
    },
    'riverside': {
        id: 'riverside',
        name: { en: 'Riverside Ghats', hi: 'नदी घाट' },
        width: 35, height: 18,
        music: 'water_theme',
        ambience: ['water', 'birds'],
        connections: {
            north: { area: 'village_square', x: 15, y: 20 },
            east: { area: 'hot_springs', x: 2, y: 8 }
        },
        npcs: ['meera', 'fisherman'],
        interactables: [
            { id: 'fishing_spot', x: 10, y: 14, type: 'fish', emoji: '🎣' },
            { id: 'washing_ghat', x: 20, y: 14, type: 'wash', emoji: '🧺' }
        ],
        forageSpots: [
            { x: 5, y: 6, items: ['berries', 'mushroom'], respawnHours: 8 },
            { x: 28, y: 5, items: ['nettle', 'ginger'], respawnHours: 12 }
        ]
    },
    'pine_forest': {
        id: 'pine_forest',
        name: { en: 'Pine Forest', hi: 'देवदार वन' },
        width: 35, height: 25,
        music: 'forest_theme',
        ambience: ['wind', 'birds', 'leaves'],
        connections: {
            east: { area: 'village_square', x: 2, y: 10 },
            west: { area: 'ancient_ruins', x: 32, y: 12 },
            north: { area: 'deep_forest', x: 17, y: 23 }
        },
        npcs: ['vaidya_arjun', 'woodcutter'],
        forageSpots: [
            { x: 8, y: 8, items: ['mushroom', 'berries'], respawnHours: 6 },
            { x: 15, y: 15, items: ['pine_resin', 'firewood'], respawnHours: 12 },
            { x: 25, y: 10, items: ['tulsi', 'nettle'], respawnHours: 8 },
            { x: 30, y: 20, items: ['honey', 'walnut'], respawnHours: 24 }
        ],
        interactables: [
            { id: 'hollow_tree', x: 20, y: 8, type: 'secret', emoji: '🌲' },
            { id: 'old_stump', x: 12, y: 18, type: 'rest', emoji: '🪵' }
        ]
    },
    'deep_forest': {
        id: 'deep_forest',
        name: { en: 'Deep Forest', hi: 'घना जंगल' },
        width: 30, height: 25,
        music: 'mystery_theme',
        ambience: ['owls', 'wind'],
        isDark: true,
        connections: {
            south: { area: 'pine_forest', x: 15, y: 2 }
        },
        npcs: [],
        forageSpots: [
            { x: 10, y: 10, items: ['brahma_kamal', 'mushroom'], respawnHours: 48 },
            { x: 20, y: 15, items: ['honey', 'berries'], respawnHours: 12 }
        ],
        interactables: [
            { id: 'lost_goat', x: 15, y: 12, type: 'quest', emoji: '🐐' },
            { id: 'hidden_shrine', x: 25, y: 20, type: 'secret', emoji: '🗿' }
        ]
    },
    'hot_springs': {
        id: 'hot_springs',
        name: { en: 'Hot Springs', hi: 'गर्म पानी के कुंड' },
        width: 22, height: 18,
        music: 'relaxing_theme',
        ambience: ['steam', 'water'],
        connections: {
            west: { area: 'riverside', x: 33, y: 8 }
        },
        npcs: ['sunita'],
        interactables: [
            { id: 'main_spring', x: 11, y: 10, type: 'bathe', emoji: '♨️' },
            { id: 'changing_hut', x: 5, y: 5, type: 'change', emoji: '🏚️' }
        ],
        forageSpots: [
            { x: 18, y: 8, items: ['tulsi', 'flower'], respawnHours: 12 }
        ]
    },
    'high_meadow': {
        id: 'high_meadow',
        name: { en: 'High Meadow', hi: 'ऊँचा चरागाह' },
        width: 30, height: 22,
        music: 'mountain_theme',
        ambience: ['wind', 'eagles'],
        requiresItem: 'climbing_gear',
        connections: {
            south: { area: 'temple_hill', x: 12, y: 2 },
            north: { area: 'mountain_peak', x: 15, y: 20 }
        },
        npcs: ['bhim', 'shepherd'],
        forageSpots: [
            { x: 8, y: 8, items: ['brahma_kamal'], respawnHours: 72 },
            { x: 20, y: 12, items: ['fine_wool', 'goat_hair'], respawnHours: 24 },
            { x: 25, y: 18, items: ['saffron'], respawnHours: 48 }
        ],
        interactables: [
            { id: 'goat_pen', x: 15, y: 10, type: 'herd', emoji: '🐐' },
            { id: 'viewpoint', x: 5, y: 5, type: 'view', emoji: '🏔️' }
        ]
    },
    'mountain_peak': {
        id: 'mountain_peak',
        name: { en: 'Mountain Peak', hi: 'पर्वत शिखर' },
        width: 20, height: 18,
        music: 'epic_theme',
        ambience: ['wind'],
        hasSnoW: true,
        requiresItem: 'warm_shawl',
        connections: {
            south: { area: 'high_meadow', x: 15, y: 2 }
        },
        npcs: [],
        interactables: [
            { id: 'prayer_flags', x: 10, y: 5, type: 'pray', emoji: '🎏' },
            { id: 'secret_cave_entrance', x: 15, y: 10, type: 'cave', emoji: '🕳️' }
        ]
    },
    'ancient_ruins': {
        id: 'ancient_ruins',
        name: { en: 'Ancient Ruins', hi: 'प्राचीन खंडहर' },
        width: 25, height: 20,
        music: 'mystery_theme',
        ambience: ['wind', 'echoes'],
        connections: {
            east: { area: 'pine_forest', x: 2, y: 12 }
        },
        npcs: [],
        forageSpots: [
            { x: 10, y: 15, items: ['old_coin', 'stone'], respawnHours: 24 }
        ],
        interactables: [
            { id: 'ruined_temple', x: 12, y: 8, type: 'explore', emoji: '🏛️' },
            { id: 'artifact_spot', x: 18, y: 12, type: 'dig', emoji: '⛏️' },
            { id: 'ancient_chest', x: 8, y: 5, type: 'treasure', emoji: '📦' }
        ]
    },
    'wool_market': {
        id: 'wool_market',
        name: { en: 'Wool Market', hi: 'ऊन बाज़ार' },
        width: 25, height: 18,
        music: 'market_theme',
        ambience: ['crowd', 'bells'],
        connections: {
            south: { area: 'village_square', x: 15, y: 2 }
        },
        npcs: ['merchant', 'sunita'],
        interactables: [
            { id: 'wool_stall', x: 8, y: 8, type: 'shop', emoji: '🧶' },
            { id: 'spice_stall', x: 15, y: 8, type: 'shop', emoji: '🫙' },
            { id: 'tool_stall', x: 22, y: 8, type: 'shop', emoji: '🔧' }
        ]
    }
};

// Expanded NPC data
export const NPCData = {
    'dadi_kamala': {
        id: 'dadi_kamala', name: { en: 'Dadi Kamala', hi: 'दादी कमला' },
        role: { en: 'Village Elder', hi: 'गाँव की बुज़ुर्ग' },
        emoji: '👵', schedule: { '6-20': 'village_square', '20-6': 'home' },
        dialogues: {
            greeting: { en: 'Good morning, child. The mountains smile today.', hi: 'सुप्रभात, बच्चे। आज पहाड़ मुस्कुरा रहे हैं।' },
            wisdom: { en: 'Remember, mountains are climbed slowly.', hi: 'याद रखो - पहाड़ धीरे-धीरे चढ़ते हैं।' },
            quest: { en: 'The tea house needs your care. Make it shine again!', hi: 'चाय घर को तुम्हारी देखभाल चाहिए।' },
            thanks: { en: 'You have done well, child.', hi: 'तुमने अच्छा किया, बच्चे।' }
        },
        gifts: { loved: ['saffron', 'kheer'], liked: ['masala_chai', 'honey'] }
    },
    'raju': {
        id: 'raju', name: { en: 'Raju', hi: 'राजू' },
        role: { en: 'Musician', hi: 'संगीतकार' },
        emoji: '🎵', schedule: { '8-12': 'village_square', '12-18': 'riverside', '18-22': 'village_square' },
        dialogues: {
            greeting: { en: 'Ah! Music fills the air today!', hi: 'आह! आज हवाओं में संगीत है!' },
            wisdom: { en: 'What music expresses, words never can!', hi: 'संगीत में जो बात है, वो शब्दों में कहाँ!' },
            quest: { en: 'My sarangi strings are broken. Can you help?', hi: 'मेरी सारंगी के तार टूट गए। मदद करोगे?' },
            happy: { en: 'Let me play you a tune!', hi: 'चलो एक धुन सुनाता हूँ!' }
        },
        gifts: { loved: ['flute', 'honey'], liked: ['berries', 'apple'] }
    },
    'meera': {
        id: 'meera', name: { en: 'Meera', hi: 'मीरा' },
        role: { en: 'Cook', hi: 'रसोइया' },
        emoji: '👩‍🍳', schedule: { '5-11': 'riverside', '11-20': 'village_square' },
        dialogues: {
            greeting: { en: 'The chai is always fresh here!', hi: 'यहाँ चाय हमेशा ताज़ी है!' },
            wisdom: { en: 'Food fills not just the stomach, but the heart too.', hi: 'खाना सिर्फ पेट नहीं, दिल भी भरता है।' },
            quest: { en: 'I need rare spices for the festival! Help me?', hi: 'त्योहार के लिए दुर्लभ मसाले चाहिए!' },
            cooking: { en: 'Come, let me teach you a recipe!', hi: 'आओ, एक विधि सिखाती हूँ!' }
        },
        gifts: { loved: ['saffron', 'cardamom'], liked: ['ginger', 'turmeric'] }
    },
    'pandit_shankara': {
        id: 'pandit_shankara', name: { en: 'Pandit Shankara', hi: 'पंडित शंकर' },
        role: { en: 'Temple Priest', hi: 'मंदिर के पुजारी' },
        emoji: '🙏', schedule: { '5-21': 'temple_hill' },
        dialogues: {
            greeting: { en: 'May peace be upon you.', hi: 'शांति बनी रहे।' },
            wisdom: { en: 'When mind is calm, the world is calm.', hi: 'मन शांत, तो संसार शांत।' },
            quest: { en: 'Strange things happen at the temple...', hi: 'मंदिर में अजीब चीज़ें हो रही हैं...' },
            blessing: { en: 'May the mountains protect you.', hi: 'पहाड़ तुम्हारी रक्षा करें।' }
        },
        gifts: { loved: ['tulsi', 'brahma_kamal'], liked: ['honey', 'flower'] }
    },
    'vaidya_arjun': {
        id: 'vaidya_arjun', name: { en: 'Vaidya Arjun', hi: 'वैद्य अर्जुन' },
        role: { en: 'Healer', hi: 'वैद्य' },
        emoji: '🌿', schedule: { '7-18': 'pine_forest', '18-22': 'village_square' },
        dialogues: {
            greeting: { en: 'Namaste! Seeking remedies?', hi: 'नमस्ते! इलाज चाहिए?' },
            wisdom: { en: 'Nature hides the cure for every ailment.', hi: 'प्रकृति में हर बीमारी का इलाज छुपा है।' },
            quest: { en: 'I need the rare Brahma Kamal flower.', hi: 'मुझे दुर्लभ ब्रह्म कमल चाहिए।' },
            teach: { en: 'Let me teach you about herbs.', hi: 'चलो जड़ी-बूटियों के बारे में बताता हूँ।' }
        },
        gifts: { loved: ['brahma_kamal', 'tulsi'], liked: ['nettle', 'honey'] }
    },
    'bhim': {
        id: 'bhim', name: { en: 'Bhim', hi: 'भीम' },
        role: { en: 'Mountain Guide', hi: 'पर्वतीय गाइड' },
        emoji: '🏔️', schedule: { '6-18': 'high_meadow', '18-22': 'village_square' },
        dialogues: {
            greeting: { en: 'Ready for adventure?', hi: 'साहसिक यात्रा के लिए तैयार?' },
            wisdom: { en: 'Every stone in these mountains has a story.', hi: 'इन पहाड़ों में हर पत्थर की एक कहानी है।' },
            quest: { en: 'There are treasures hidden in the ruins!', hi: 'खंडहरों में खज़ाने छिपे हैं!' },
            guide: { en: 'Follow me, I know every path.', hi: 'मेरे पीछे आओ, हर रास्ता जानता हूँ।' }
        },
        gifts: { loved: ['climbing_gear', 'expedition_kit'], liked: ['firewood', 'dal_rice'] }
    },
    'sunita': {
        id: 'sunita', name: { en: 'Sunita', hi: 'सुनीता' },
        role: { en: 'Weaver', hi: 'बुनकर' },
        emoji: '🧶', schedule: { '8-12': 'hot_springs', '12-20': 'wool_market' },
        dialogues: {
            greeting: { en: 'Looking for fine woolens?', hi: 'बढ़िया ऊनी कपड़े चाहिए?' },
            wisdom: { en: 'Love is woven into every thread.', hi: 'हर धागे में प्यार बुना है।' },
            quest: { en: 'I need fine wool for a special shawl.', hi: 'खास शॉल के लिए अच्छी ऊन चाहिए।' },
            trade: { en: 'Bring materials, I\'ll make you something warm.', hi: 'सामान लाओ, कुछ गर्म बना दूँगी।' }
        },
        gifts: { loved: ['fine_wool', 'dye_plants'], liked: ['goat_hair', 'berries'] }
    },
    'mysterious_sadhu': {
        id: 'mysterious_sadhu', name: { en: 'Mysterious Sadhu', hi: 'रहस्यमय साधु' },
        role: { en: '???', hi: '???' },
        emoji: '🧘', schedule: { '20-6': 'temple_hill' },
        dialogues: {
            greeting: { en: 'You seek what is hidden...', hi: 'जो छिपा है, वो ढूंढ रहे हो...' },
            wisdom: { en: 'When the time comes, you will understand...', hi: 'जब समय आएगा, सब समझ जाओगे...' },
            quest: { en: 'The Moon Gem calls to those who are worthy.', hi: 'चंद्र मणि योग्य लोगों को बुलाती है।' },
            cryptic: { en: 'Look where moonlight touches water...', hi: 'जहाँ चाँदनी पानी को छूती है, वहाँ देखो...' }
        },
        gifts: { loved: ['moon_gem', 'brahma_kamal'], liked: ['tulsi', 'honey'] }
    },
    'village_child': {
        id: 'village_child', name: { en: 'Little Chintu', hi: 'छोटू चिंटू' },
        role: { en: 'Village Child', hi: 'गाँव का बच्चा' },
        emoji: '👦', schedule: { '8-18': 'village_square' },
        dialogues: {
            greeting: { en: 'Hi! Want to play?', hi: 'नमस्ते! खेलोगे?' },
            sad: { en: 'My goat Champa is lost in the forest!', hi: 'मेरी बकरी चम्पा जंगल में खो गई!' },
            happy: { en: 'You found Champa! Thank you!', hi: 'चम्पा मिल गई! धन्यवाद!' }
        },
        gifts: { loved: ['apple', 'kheer'], liked: ['berries', 'pakora'] }
    },
    'fisherman': {
        id: 'fisherman', name: { en: 'Machhiwala Kaka', hi: 'मछीवाला काका' },
        role: { en: 'Fisherman', hi: 'मछुआरा' },
        emoji: '🎣', schedule: { '5-18': 'riverside' },
        dialogues: {
            greeting: { en: 'The river is generous today!', hi: 'नदी आज मेहरबान है!' },
            wisdom: { en: 'Patience catches the biggest fish.', hi: 'सब्र से बड़ी मछली मिलती है।' },
            teach: { en: 'Want to learn fishing? Get a rod first!', hi: 'मछली पकड़ना सीखना है? पहले छड़ लाओ!' }
        },
        gifts: { loved: ['masala_chai', 'pakora'], liked: ['berries', 'honey'] }
    },
    'traveler': {
        id: 'traveler', name: { en: 'Traveler', hi: 'यात्री' },
        role: { en: 'Passing Traveler', hi: 'गुज़रता यात्री' },
        emoji: '🚶', schedule: { '10-16': 'tea_house' },
        dialogues: {
            greeting: { en: 'A cup of chai, please!', hi: 'एक कप चाय दीजिए!' },
            satisfied: { en: 'Delicious! The best chai in the mountains!', hi: 'वाह! पहाड़ों की सबसे अच्छी चाय!' }
        }
    }
};

// World Manager
export const WorldManager = {
    currentArea: 'village_square',
    visitedAreas: ['village_square'],
    forageState: {}, // { areaId: { spotIndex: lastForagedTime } }
    discoveredSecrets: [],

    init() {
        this.forageState = {};
    },

    changeArea(areaId, entryX, entryY) {
        const area = AreaData[areaId];
        if (!area) return false;

        // Check requirements
        if (area.requiresItem && !window.Inventory?.hasItem(area.requiresItem)) {
            return { success: false, reason: 'missing_item', item: area.requiresItem };
        }

        this.currentArea = areaId;
        if (!this.visitedAreas.includes(areaId)) {
            this.visitedAreas.push(areaId);
        }

        // Update quest objectives for location
        if (window.QuestManager) window.QuestManager.updateObjective('location', areaId, 1);

        return { success: true, x: entryX, y: entryY };
    },

    getCurrentArea() {
        return AreaData[this.currentArea];
    },

    canForage(spotIndex) {
        const key = `${this.currentArea}_${spotIndex}`;
        const lastTime = this.forageState[key];
        if (!lastTime) return true;

        const spot = AreaData[this.currentArea]?.forageSpots?.[spotIndex];
        if (!spot) return false;

        const hoursPassed = (Date.now() - lastTime) / 1000 / 60 / 60;
        return hoursPassed >= spot.respawnHours;
    },

    forage(spotIndex) {
        if (!this.canForage(spotIndex)) return null;

        const area = AreaData[this.currentArea];
        const spot = area?.forageSpots?.[spotIndex];
        if (!spot) return null;

        // Random item from spot
        const itemId = spot.items[Math.floor(Math.random() * spot.items.length)];

        // Mark as foraged
        this.forageState[`${this.currentArea}_${spotIndex}`] = Date.now();

        // Add to inventory
        if (window.Inventory) window.Inventory.addItem(itemId, 1);

        return itemId;
    },

    getNPCsInCurrentArea() {
        const area = AreaData[this.currentArea];
        if (!area?.npcs) return [];

        const hour = window.GameState?.gameTime?.hour || 12;
        return area.npcs.filter(npcId => {
            const npc = NPCData[npcId];
            if (!npc?.schedule) return true;

            for (const [timeRange, location] of Object.entries(npc.schedule)) {
                const [start, end] = timeRange.split('-').map(Number);
                if (start < end ? (hour >= start && hour < end) : (hour >= start || hour < end)) {
                    return location === this.currentArea;
                }
            }
            return false;
        }).map(id => NPCData[id]);
    },

    getSaveData() {
        return {
            currentArea: this.currentArea,
            visitedAreas: this.visitedAreas,
            forageState: this.forageState,
            discoveredSecrets: this.discoveredSecrets
        };
    },

    loadSaveData(data) {
        if (data.currentArea) this.currentArea = data.currentArea;
        if (data.visitedAreas) this.visitedAreas = data.visitedAreas;
        if (data.forageState) this.forageState = data.forageState;
        if (data.discoveredSecrets) this.discoveredSecrets = data.discoveredSecrets;
    }
};

if (typeof window !== 'undefined') {
    window.WorldManager = WorldManager;
    window.AreaData = AreaData;
    window.NPCData = NPCData;
}
