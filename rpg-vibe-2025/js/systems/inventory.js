/**
 * Pahadi Tales - Inventory System
 */

export const ItemCategory = { RESOURCE: 'resource', FOOD: 'food', INGREDIENT: 'ingredient', TOOL: 'tool', EQUIPMENT: 'equipment', RECIPE: 'recipe', QUEST: 'quest' };

// Item Database - Core items
export const ItemData = {
    // Resources
    'firewood': { id: 'firewood', name: { en: 'Firewood', hi: 'लकड़ी' }, category: ItemCategory.RESOURCE, stackSize: 50, value: 2, emoji: '🪵' },
    'stone': { id: 'stone', name: { en: 'Stone', hi: 'पत्थर' }, category: ItemCategory.RESOURCE, stackSize: 50, value: 1, emoji: '🪨' },
    'pine_resin': { id: 'pine_resin', name: { en: 'Pine Resin', hi: 'देवदार का राल' }, category: ItemCategory.RESOURCE, stackSize: 20, value: 8, emoji: '🍯' },
    'goat_hair': { id: 'goat_hair', name: { en: 'Goat Hair', hi: 'बकरी के बाल' }, category: ItemCategory.RESOURCE, stackSize: 30, value: 5, emoji: '🧶' },
    'fine_wool': { id: 'fine_wool', name: { en: 'Fine Wool', hi: 'अच्छी ऊन' }, category: ItemCategory.RESOURCE, stackSize: 30, value: 12, emoji: '🐑' },
    'dye_plants': { id: 'dye_plants', name: { en: 'Dye Plants', hi: 'रंग के पौधे' }, category: ItemCategory.RESOURCE, stackSize: 20, value: 6, emoji: '🌸' },

    // Ingredients
    'tea_leaves': { id: 'tea_leaves', name: { en: 'Tea Leaves', hi: 'चाय पत्ती' }, category: ItemCategory.INGREDIENT, stackSize: 30, value: 3, emoji: '🍃' },
    'milk': { id: 'milk', name: { en: 'Fresh Milk', hi: 'ताज़ा दूध' }, category: ItemCategory.INGREDIENT, stackSize: 10, value: 5, emoji: '🥛' },
    'honey': { id: 'honey', name: { en: 'Wild Honey', hi: 'जंगली शहद' }, category: ItemCategory.INGREDIENT, stackSize: 15, value: 15, emoji: '🍯' },
    'ginger': { id: 'ginger', name: { en: 'Fresh Ginger', hi: 'ताज़ी अदरक' }, category: ItemCategory.INGREDIENT, stackSize: 20, value: 4, emoji: '🫚' },
    'cardamom': { id: 'cardamom', name: { en: 'Cardamom', hi: 'इलायची' }, category: ItemCategory.INGREDIENT, stackSize: 20, value: 10, emoji: '🌿' },
    'cinnamon': { id: 'cinnamon', name: { en: 'Cinnamon', hi: 'दालचीनी' }, category: ItemCategory.INGREDIENT, stackSize: 20, value: 8, emoji: '🪵' },
    'saffron': { id: 'saffron', name: { en: 'Mountain Saffron', hi: 'पहाड़ी केसर' }, category: ItemCategory.INGREDIENT, stackSize: 10, value: 50, emoji: '🧡' },
    'turmeric': { id: 'turmeric', name: { en: 'Turmeric', hi: 'हल्दी' }, category: ItemCategory.INGREDIENT, stackSize: 20, value: 5, emoji: '💛' },
    'rice': { id: 'rice', name: { en: 'Mountain Rice', hi: 'पहाड़ी चावल' }, category: ItemCategory.INGREDIENT, stackSize: 30, value: 4, emoji: '🍚' },
    'potato': { id: 'potato', name: { en: 'Mountain Potato', hi: 'पहाड़ी आलू' }, category: ItemCategory.INGREDIENT, stackSize: 25, value: 2, emoji: '🥔' },
    'apple': { id: 'apple', name: { en: 'Himalayan Apple', hi: 'हिमालयी सेब' }, category: ItemCategory.INGREDIENT, stackSize: 20, value: 5, emoji: '🍎' },
    'walnut': { id: 'walnut', name: { en: 'Walnut', hi: 'अखरोट' }, category: ItemCategory.INGREDIENT, stackSize: 25, value: 6, emoji: '🥜' },
    'mushroom': { id: 'mushroom', name: { en: 'Forest Mushroom', hi: 'जंगली मशरूम' }, category: ItemCategory.INGREDIENT, stackSize: 20, value: 7, emoji: '🍄' },
    'berries': { id: 'berries', name: { en: 'Wild Berries', hi: 'जंगली बेरी' }, category: ItemCategory.INGREDIENT, stackSize: 25, value: 4, emoji: '🫐' },
    'tulsi': { id: 'tulsi', name: { en: 'Holy Basil', hi: 'तुलसी' }, category: ItemCategory.INGREDIENT, stackSize: 25, value: 8, emoji: '🌿' },
    'brahma_kamal': { id: 'brahma_kamal', name: { en: 'Brahma Kamal', hi: 'ब्रह्म कमल' }, category: ItemCategory.INGREDIENT, stackSize: 5, value: 100, emoji: '🪷' },
    'lentils': { id: 'lentils', name: { en: 'Lentils', hi: 'दाल' }, category: ItemCategory.INGREDIENT, stackSize: 30, value: 4, emoji: '🫘' },
    'flour': { id: 'flour', name: { en: 'Wheat Flour', hi: 'आटा' }, category: ItemCategory.INGREDIENT, stackSize: 30, value: 3, emoji: '🌾' },
    'fish': { id: 'fish', name: { en: 'Fresh Fish', hi: 'ताज़ी मछली' }, category: ItemCategory.INGREDIENT, stackSize: 15, value: 12, emoji: '🐟' },
    'nettle': { id: 'nettle', name: { en: 'Nettle Leaf', hi: 'बिच्छू बूटी' }, category: ItemCategory.INGREDIENT, stackSize: 20, value: 6, emoji: '🌿' },
    'flower': { id: 'flower', name: { en: 'Mountain Flower', hi: 'पहाड़ी फूल' }, category: ItemCategory.INGREDIENT, stackSize: 20, value: 5, emoji: '🌸' },
    'goat_milk': { id: 'goat_milk', name: { en: 'Goat Milk', hi: 'बकरी का दूध' }, category: ItemCategory.INGREDIENT, stackSize: 10, value: 8, emoji: '🥛' },

    // Food
    'masala_chai': { id: 'masala_chai', name: { en: 'Masala Chai', hi: 'मसाला चाय' }, category: ItemCategory.FOOD, stackSize: 10, value: 15, energy: 20, emoji: '☕' },
    'ginger_tea': { id: 'ginger_tea', name: { en: 'Ginger Tea', hi: 'अदरक की चाय' }, category: ItemCategory.FOOD, stackSize: 10, value: 12, energy: 18, emoji: '🍵' },
    'dal_rice': { id: 'dal_rice', name: { en: 'Dal Chawal', hi: 'दाल चावल' }, category: ItemCategory.FOOD, stackSize: 5, value: 20, energy: 40, emoji: '🍛' },
    'aloo_paratha': { id: 'aloo_paratha', name: { en: 'Aloo Paratha', hi: 'आलू पराठा' }, category: ItemCategory.FOOD, stackSize: 8, value: 18, energy: 35, emoji: '🫓' },
    'kheer': { id: 'kheer', name: { en: 'Kheer', hi: 'खीर' }, category: ItemCategory.FOOD, stackSize: 5, value: 25, energy: 30, emoji: '🍮' },
    'pakora': { id: 'pakora', name: { en: 'Pakora', hi: 'पकौड़ा' }, category: ItemCategory.FOOD, stackSize: 10, value: 12, energy: 20, emoji: '🧆' },
    'healing_salve': { id: 'healing_salve', name: { en: 'Healing Salve', hi: 'उपचार मरहम' }, category: ItemCategory.FOOD, stackSize: 10, value: 30, health: 30, emoji: '🩹' },
    'herbal_tea': { id: 'herbal_tea', name: { en: 'Herbal Tea', hi: 'जड़ी-बूटी चाय' }, category: ItemCategory.FOOD, stackSize: 10, value: 18, energy: 25, health: 10, emoji: '🍵' },
    'fish_curry': { id: 'fish_curry', name: { en: 'Fish Curry', hi: 'मछली करी' }, category: ItemCategory.FOOD, stackSize: 5, value: 28, energy: 45, emoji: '🍛' },
    'samosa': { id: 'samosa', name: { en: 'Samosa', hi: 'समोसा' }, category: ItemCategory.FOOD, stackSize: 8, value: 15, energy: 25, emoji: '🥟' },
    'ladoo': { id: 'ladoo', name: { en: 'Ladoo', hi: 'लड्डू' }, category: ItemCategory.FOOD, stackSize: 10, value: 20, energy: 30, emoji: '🍪' },
    'apple_pie': { id: 'apple_pie', name: { en: 'Apple Pie', hi: 'सेब पाई' }, category: ItemCategory.FOOD, stackSize: 5, value: 22, energy: 35, emoji: '🥧' },
    'mushroom_soup': { id: 'mushroom_soup', name: { en: 'Mushroom Soup', hi: 'मशरूम सूप' }, category: ItemCategory.FOOD, stackSize: 8, value: 16, energy: 28, emoji: '🍲' },

    // Tools
    'basic_stove': { id: 'basic_stove', name: { en: 'Clay Stove', hi: 'मिट्टी का चूल्हा' }, category: ItemCategory.TOOL, stackSize: 1, value: 50, emoji: '🔥' },
    'broom': { id: 'broom', name: { en: 'Old Broom', hi: 'पुराना झाड़ू' }, category: ItemCategory.TOOL, stackSize: 1, value: 10, emoji: '🧹' },
    'axe': { id: 'axe', name: { en: 'Wood Axe', hi: 'कुल्हाड़ी' }, category: ItemCategory.TOOL, stackSize: 1, value: 45, emoji: '🪓' },
    'hoe': { id: 'hoe', name: { en: 'Farming Hoe', hi: 'कुदाल' }, category: ItemCategory.TOOL, stackSize: 1, value: 40, emoji: '⛏️' },
    'pickaxe': { id: 'pickaxe', name: { en: 'Pickaxe', hi: 'गैंती' }, category: ItemCategory.TOOL, stackSize: 1, value: 55, emoji: '⛏️' },
    'fishing_rod': { id: 'fishing_rod', name: { en: 'Fishing Rod', hi: 'मछली की छड़' }, category: ItemCategory.TOOL, stackSize: 1, value: 40, emoji: '🎣' },
    'foraging_basket': { id: 'foraging_basket', name: { en: 'Foraging Basket', hi: 'टोकरी' }, category: ItemCategory.TOOL, stackSize: 1, value: 25, emoji: '🧺' },
    'flute': { id: 'flute', name: { en: 'Bamboo Flute', hi: 'बांसुरी' }, category: ItemCategory.TOOL, stackSize: 1, value: 35, emoji: '🎶' },
    'climbing_gear': { id: 'climbing_gear', name: { en: 'Climbing Gear', hi: 'चढ़ाई सामान' }, category: ItemCategory.TOOL, stackSize: 1, value: 100, emoji: '🧗' },
    'expedition_kit': { id: 'expedition_kit', name: { en: 'Expedition Kit', hi: 'अभियान किट' }, category: ItemCategory.TOOL, stackSize: 1, value: 80, emoji: '🎒' },

    // Equipment
    'warm_shawl': { id: 'warm_shawl', name: { en: 'Warm Shawl', hi: 'गर्म शॉल' }, category: ItemCategory.EQUIPMENT, stackSize: 1, value: 75, emoji: '🧣' },
    'village_key': { id: 'village_key', name: { en: 'Village Key', hi: 'गाँव की चाबी' }, category: ItemCategory.EQUIPMENT, stackSize: 1, value: 0, emoji: '🗝️' },
    'moon_gem_pendant': { id: 'moon_gem_pendant', name: { en: 'Moon Gem Pendant', hi: 'चंद्र मणि लॉकेट' }, category: ItemCategory.EQUIPMENT, stackSize: 1, value: 1000, emoji: '💎' },

    // Quest
    'ancient_map': { id: 'ancient_map', name: { en: 'Ancient Map', hi: 'प्राचीन नक्शा' }, category: ItemCategory.QUEST, stackSize: 1, value: 0, emoji: '🗺️' },
    'moon_gem': { id: 'moon_gem', name: { en: 'Chandra Mani', hi: 'चंद्र मणि' }, category: ItemCategory.QUEST, stackSize: 1, value: 0, emoji: '🌙' },
    'ancient_artifact': { id: 'ancient_artifact', name: { en: 'Ancient Artifact', hi: 'प्राचीन वस्तु' }, category: ItemCategory.QUEST, stackSize: 1, value: 200, emoji: '🏺' },
    'old_coin': { id: 'old_coin', name: { en: 'Old Coin', hi: 'पुराना सिक्का' }, category: ItemCategory.QUEST, stackSize: 10, value: 25, emoji: '🪙' },

    // Recipes
    'recipe_ginger_tea': { id: 'recipe_ginger_tea', name: { en: 'Recipe: Ginger Tea', hi: 'विधि: अदरक चाय' }, category: ItemCategory.RECIPE, stackSize: 1, value: 30, emoji: '📜' },
    'recipe_kheer': { id: 'recipe_kheer', name: { en: 'Recipe: Kheer', hi: 'विधि: खीर' }, category: ItemCategory.RECIPE, stackSize: 1, value: 40, emoji: '📜' },
    'recipe_herbal_tea': { id: 'recipe_herbal_tea', name: { en: 'Recipe: Herbal Tea', hi: 'विधि: जड़ी-बूटी चाय' }, category: ItemCategory.RECIPE, stackSize: 1, value: 35, emoji: '📜' },
    'recipe_fish_curry': { id: 'recipe_fish_curry', name: { en: 'Recipe: Fish Curry', hi: 'विधि: मछली करी' }, category: ItemCategory.RECIPE, stackSize: 1, value: 45, emoji: '📜' },
};

// Inventory Manager
export const Inventory = {
    items: {}, coins: 100, maxSlots: 30,

    init() { this.addItem('firewood', 5); this.addItem('tea_leaves', 3); },

    addItem(itemId, qty = 1) {
        if (!ItemData[itemId]) return false;
        if (!this.items[itemId] && Object.keys(this.items).length >= this.maxSlots) return false;
        if (!this.items[itemId]) this.items[itemId] = 0;
        this.items[itemId] = Math.min(this.items[itemId] + qty, ItemData[itemId].stackSize || 99);
        if (window.QuestManager) window.QuestManager.updateObjective('collect', itemId, qty);
        return true;
    },

    removeItem(itemId, qty = 1) {
        if (!this.items[itemId] || this.items[itemId] < qty) return false;
        this.items[itemId] -= qty;
        if (this.items[itemId] <= 0) delete this.items[itemId];
        return true;
    },

    hasItem(id, qty = 1) { return this.items[id] && this.items[id] >= qty; },
    getItemCount(id) { return this.items[id] || 0; },
    addCoins(amt) { this.coins += amt; },
    removeCoins(amt) { if (this.coins < amt) return false; this.coins -= amt; return true; },

    useItem(itemId) {
        const item = ItemData[itemId];
        if (!item || !this.hasItem(itemId)) return false;
        if (item.category === ItemCategory.FOOD) {
            if (item.energy && window.Player) window.Player.restoreEnergy(item.energy);
            if (item.health && window.Player) window.Player.restoreHealth(item.health);
            return this.removeItem(itemId, 1);
        }
        return false;
    },

    getAllItems() { return Object.entries(this.items).map(([id, qty]) => ({ ...ItemData[id], quantity: qty })); },
    getSaveData() { return { items: this.items, coins: this.coins }; },
    loadSaveData(data) { if (data.items) this.items = data.items; if (data.coins !== undefined) this.coins = data.coins; }
};

if (typeof window !== 'undefined') { window.Inventory = Inventory; window.ItemData = ItemData; }
