/**
 * Pahadi Tales - Pet Companion System
 */

export const PetData = {
    'sheepdog': {
        id: 'sheepdog',
        name: { en: 'Himalayan Sheepdog', hi: 'भोटिया कुत्ता' },
        nickname: { en: 'Bholu', hi: 'भोलू' },
        description: { en: 'A loyal, brave, and fluffy companion.', hi: 'एक वफादार, बहादुर और मुलायम साथी।' },
        ability: 'find_items', // Can find hidden items
        emoji: '🐕',
        baseStats: { happiness: 80, hunger: 50, energy: 100 },
        favoriteFood: ['milk', 'dal_rice'],
        walkSpeed: 2.5
    },
    'mountain_cat': {
        id: 'mountain_cat',
        name: { en: 'Mountain Cat', hi: 'पहाड़ी बिल्ली' },
        nickname: { en: 'Mitthu', hi: 'मिट्ठू' },
        description: { en: 'Mysterious and cuddly.', hi: 'रहस्यमय और प्यारी।' },
        ability: 'calm', // Reduces stress, finds mice
        emoji: '🐈',
        baseStats: { happiness: 70, hunger: 60, energy: 80 },
        favoriteFood: ['milk', 'fish'],
        walkSpeed: 3
    },
    'snow_hare': {
        id: 'snow_hare',
        name: { en: 'Snow Hare', hi: 'हिम खरगोश' },
        nickname: { en: 'Snowball', hi: 'गोला' },
        description: { en: 'Bouncy and curious.', hi: 'उछलता और जिज्ञासु।' },
        ability: 'speed_boost', // Makes player faster
        emoji: '🐇',
        baseStats: { happiness: 90, hunger: 70, energy: 120 },
        favoriteFood: ['berries', 'apple'],
        walkSpeed: 4
    },
    'baby_eagle': {
        id: 'baby_eagle',
        name: { en: 'Baby Eagle', hi: 'गरुड़ का बच्चा' },
        nickname: { en: 'Garuda', hi: 'गरुड़' },
        description: { en: 'Majestic and protective.', hi: 'भव्य और रक्षक।' },
        ability: 'scout', // Reveals map areas
        emoji: '🦅',
        baseStats: { happiness: 60, hunger: 80, energy: 90 },
        favoriteFood: ['fish', 'meat'],
        walkSpeed: 5
    },
    'baby_goat': {
        id: 'baby_goat',
        name: { en: 'Baby Goat', hi: 'बकरी का बच्चा' },
        nickname: { en: 'Champa', hi: 'चम्पा' },
        description: { en: 'Playful and stubborn.', hi: 'चंचल और ज़िद्दी।' },
        ability: 'climb', // Can access mountain areas
        emoji: '🐐',
        baseStats: { happiness: 85, hunger: 40, energy: 110 },
        favoriteFood: ['berries', 'apple', 'tea_leaves'],
        walkSpeed: 2
    },
    'fireflies': {
        id: 'fireflies',
        name: { en: 'Magic Fireflies', hi: 'जादुई जुगनू' },
        nickname: { en: 'Jugnu', hi: 'जुगनू' },
        description: { en: 'Enchanting and mysterious.', hi: 'मंत्रमुग्ध और रहस्यमय।' },
        ability: 'night_vision', // Lights up dark areas
        emoji: '✨',
        baseStats: { happiness: 100, hunger: 0, energy: 100 },
        favoriteFood: ['honey'],
        walkSpeed: 3
    }
};

export const PetManager = {
    ownedPets: [],
    activePet: null,

    init() { },

    adoptPet(petId, customName = null) {
        if (this.ownedPets.find(p => p.id === petId)) return false;
        const petDef = PetData[petId];
        if (!petDef) return false;

        const pet = {
            id: petId,
            customName: customName,
            happiness: petDef.baseStats.happiness,
            hunger: petDef.baseStats.hunger,
            energy: petDef.baseStats.energy,
            affection: 0,
            adoptedDay: window.GameState?.day || 1
        };

        this.ownedPets.push(pet);
        if (!this.activePet) this.activePet = pet;
        return true;
    },

    feedPet(petId, foodItemId) {
        const pet = this.ownedPets.find(p => p.id === petId);
        if (!pet || !window.Inventory?.hasItem(foodItemId)) return false;

        const petDef = PetData[petId];
        const isFavorite = petDef.favoriteFood.includes(foodItemId);

        window.Inventory.removeItem(foodItemId, 1);
        pet.hunger = Math.max(0, pet.hunger - (isFavorite ? 40 : 25));
        pet.happiness = Math.min(100, pet.happiness + (isFavorite ? 15 : 5));
        pet.affection = Math.min(100, pet.affection + (isFavorite ? 5 : 2));

        return true;
    },

    petInteract(petId) {
        const pet = this.ownedPets.find(p => p.id === petId);
        if (!pet) return false;

        pet.happiness = Math.min(100, pet.happiness + 10);
        pet.affection = Math.min(100, pet.affection + 3);
        return true;
    },

    setActivePet(petId) {
        const pet = this.ownedPets.find(p => p.id === petId);
        if (pet) { this.activePet = pet; return true; }
        return false;
    },

    update(deltaTime) {
        const hoursPassed = deltaTime / 1000 / 60; // Game minutes

        for (const pet of this.ownedPets) {
            // Hunger increases over time
            pet.hunger = Math.min(100, pet.hunger + hoursPassed * 0.5);

            // Happiness decreases if hungry
            if (pet.hunger > 80) {
                pet.happiness = Math.max(0, pet.happiness - hoursPassed * 0.3);
            }
        }
    },

    getActivePetBonus() {
        if (!this.activePet) return null;
        const petDef = PetData[this.activePet.id];
        return petDef?.ability || null;
    },

    getPetName(petId) {
        const pet = this.ownedPets.find(p => p.id === petId);
        const petDef = PetData[petId];
        const lang = window.GameState?.language || 'en';
        return pet?.customName || petDef?.nickname[lang] || petDef?.name[lang];
    },

    getSaveData() {
        return {
            ownedPets: this.ownedPets,
            activePetId: this.activePet?.id
        };
    },

    loadSaveData(data) {
        if (data.ownedPets) this.ownedPets = data.ownedPets;
        if (data.activePetId) this.activePet = this.ownedPets.find(p => p.id === data.activePetId);
    }
};

if (typeof window !== 'undefined') window.PetManager = PetManager;
