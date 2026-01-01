/**
 * Pahadi Tales - Crafting System
 */

export const CraftingRecipes = {
    // Chai & Beverages
    'masala_chai': {
        id: 'masala_chai', result: 'masala_chai', quantity: 2,
        ingredients: [{ item: 'tea_leaves', qty: 1 }, { item: 'milk', qty: 1 }, { item: 'cardamom', qty: 1 }],
        name: { en: 'Masala Chai', hi: 'मसाला चाय' }, time: 3, xp: 10
    },
    'ginger_tea': {
        id: 'ginger_tea', result: 'ginger_tea', quantity: 2,
        ingredients: [{ item: 'tea_leaves', qty: 1 }, { item: 'ginger', qty: 1 }],
        name: { en: 'Ginger Tea', hi: 'अदरक चाय' }, time: 2, xp: 8
    },
    'herbal_tea': {
        id: 'herbal_tea', result: 'herbal_tea', quantity: 1,
        ingredients: [{ item: 'tulsi', qty: 2 }, { item: 'honey', qty: 1 }],
        name: { en: 'Herbal Tea', hi: 'जड़ी-बूटी चाय' }, time: 3, xp: 15
    },

    // Food
    'dal_rice': {
        id: 'dal_rice', result: 'dal_rice', quantity: 1,
        ingredients: [{ item: 'rice', qty: 2 }, { item: 'lentils', qty: 2 }, { item: 'turmeric', qty: 1 }],
        name: { en: 'Dal Chawal', hi: 'दाल चावल' }, time: 5, xp: 20
    },
    'aloo_paratha': {
        id: 'aloo_paratha', result: 'aloo_paratha', quantity: 2,
        ingredients: [{ item: 'potato', qty: 2 }, { item: 'flour', qty: 1 }],
        name: { en: 'Aloo Paratha', hi: 'आलू पराठा' }, time: 4, xp: 15
    },
    'kheer': {
        id: 'kheer', result: 'kheer', quantity: 2,
        ingredients: [{ item: 'rice', qty: 1 }, { item: 'milk', qty: 2 }, { item: 'cardamom', qty: 1 }],
        name: { en: 'Kheer', hi: 'खीर' }, time: 6, xp: 25
    },
    'pakora': {
        id: 'pakora', result: 'pakora', quantity: 4,
        ingredients: [{ item: 'potato', qty: 1 }, { item: 'flour', qty: 1 }],
        name: { en: 'Pakora', hi: 'पकौड़ा' }, time: 3, xp: 12
    },

    // Medicine
    'healing_salve': {
        id: 'healing_salve', result: 'healing_salve', quantity: 1,
        ingredients: [{ item: 'tulsi', qty: 2 }, { item: 'turmeric', qty: 1 }, { item: 'honey', qty: 1 }],
        name: { en: 'Healing Salve', hi: 'उपचार मरहम' }, time: 4, xp: 20
    },

    // Tools
    'expedition_kit': {
        id: 'expedition_kit', result: 'expedition_kit', quantity: 1,
        ingredients: [{ item: 'firewood', qty: 5 }, { item: 'stone', qty: 3 }],
        name: { en: 'Expedition Kit', hi: 'अभियान किट' }, time: 5, xp: 30
    },

    // More Food Recipes
    'fish_curry': {
        id: 'fish_curry', result: 'fish_curry', quantity: 1,
        ingredients: [{ item: 'fish', qty: 2 }, { item: 'turmeric', qty: 1 }, { item: 'ginger', qty: 1 }],
        name: { en: 'Fish Curry', hi: 'मछली करी' }, time: 6, xp: 25
    },
    'samosa': {
        id: 'samosa', result: 'samosa', quantity: 4,
        ingredients: [{ item: 'flour', qty: 1 }, { item: 'potato', qty: 2 }],
        name: { en: 'Samosa', hi: 'समोसा' }, time: 4, xp: 15
    },
    'ladoo': {
        id: 'ladoo', result: 'ladoo', quantity: 6,
        ingredients: [{ item: 'flour', qty: 2 }, { item: 'honey', qty: 1 }, { item: 'walnut', qty: 2 }],
        name: { en: 'Ladoo', hi: 'लड्डू' }, time: 5, xp: 20
    },
    'apple_pie': {
        id: 'apple_pie', result: 'apple_pie', quantity: 1,
        ingredients: [{ item: 'apple', qty: 3 }, { item: 'flour', qty: 1 }, { item: 'honey', qty: 1 }],
        name: { en: 'Apple Pie', hi: 'सेब पाई' }, time: 6, xp: 22
    },
    'mushroom_soup': {
        id: 'mushroom_soup', result: 'mushroom_soup', quantity: 2,
        ingredients: [{ item: 'mushroom', qty: 3 }, { item: 'milk', qty: 1 }],
        name: { en: 'Mushroom Soup', hi: 'मशरूम सूप' }, time: 4, xp: 18
    }
};

export const CraftingSystem = {
    knownRecipes: ['masala_chai', 'ginger_tea'],
    craftingInProgress: null,

    init() { },

    learnRecipe(recipeId) {
        if (!this.knownRecipes.includes(recipeId) && CraftingRecipes[recipeId]) {
            this.knownRecipes.push(recipeId);
            return true;
        }
        return false;
    },

    canCraft(recipeId) {
        const recipe = CraftingRecipes[recipeId];
        if (!recipe || !this.knownRecipes.includes(recipeId)) return false;
        for (const ing of recipe.ingredients) {
            if (!window.Inventory?.hasItem(ing.item, ing.qty)) return false;
        }
        return true;
    },

    craft(recipeId) {
        if (!this.canCraft(recipeId)) return false;
        const recipe = CraftingRecipes[recipeId];

        // Remove ingredients
        for (const ing of recipe.ingredients) {
            window.Inventory.removeItem(ing.item, ing.qty);
        }

        // Add result
        window.Inventory.addItem(recipe.result, recipe.quantity);

        // Add XP
        if (window.Player && recipe.xp) window.Player.addXP(recipe.xp);

        // Update quest objectives
        if (window.QuestManager) window.QuestManager.updateObjective('craft', recipeId, 1);

        return true;
    },

    getAvailableRecipes() {
        return this.knownRecipes.map(id => ({
            ...CraftingRecipes[id],
            canCraft: this.canCraft(id)
        }));
    },

    getSaveData() { return { knownRecipes: this.knownRecipes }; },
    loadSaveData(data) { if (data.knownRecipes) this.knownRecipes = data.knownRecipes; }
};

if (typeof window !== 'undefined') window.CraftingSystem = CraftingSystem;
