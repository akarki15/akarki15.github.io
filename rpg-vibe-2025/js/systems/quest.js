/**
 * Pahadi Tales - Quest System
 * Handles quest tracking, objectives, and rewards
 */

export const QuestState = {
    NOT_STARTED: 'not_started',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    FAILED: 'failed'
};

export const QuestType = {
    MAIN: 'main',
    SIDE: 'side',
    DAILY: 'daily'
};

// Quest Database
export const QuestData = {
    // ===== MAIN QUESTS =====
    'mq_restore_dhaba': {
        id: 'mq_restore_dhaba',
        type: QuestType.MAIN,
        title: { en: 'A New Beginning', hi: 'एक नई शुरुआत' },
        description: {
            en: 'Restore your grandfather\'s old tea house.',
            hi: 'अपने दादाजी के पुराने चाय घर को फिर से शुरू करें।'
        },
        giver: 'dadi_kamala',
        objectives: [
            { id: 'find_broom', desc: { en: 'Find the old broom', hi: 'पुरानी झाड़ू ढूंढें' }, type: 'collect', target: 'broom', count: 1, current: 0 },
            { id: 'clean_dhaba', desc: { en: 'Sweep the floor (Use Broom)', hi: 'फर्श साफ करें (झाड़ू का प्रयोग करें)' }, type: 'interact', target: 'dhaba_dirt', count: 5, current: 0 },
            { id: 'gather_wood', desc: { en: 'Gather firewood', hi: 'लकड़ी इकट्ठा करें' }, type: 'collect', target: 'firewood', count: 5, current: 0 },
            { id: 'collect_herbs', desc: { en: 'Collect tea herbs', hi: 'चाय की जड़ी-बूटियाँ लाएं' }, type: 'collect', target: 'tea_leaves', count: 3, current: 0 }
        ],
        rewards: { coins: 50, items: ['basic_stove'], xp: 100 },
        unlocks: ['mq_first_customer', 'sq_meera_spices']
    },

    'mq_first_customer': {
        id: 'mq_first_customer',
        type: QuestType.MAIN,
        title: { en: 'First Customer', hi: 'पहला ग्राहक' },
        description: {
            en: 'Serve your first cup of chai to a traveler.',
            hi: 'एक यात्री को अपनी पहली चाय परोसें।'
        },
        giver: 'dadi_kamala',
        prerequisites: ['mq_restore_dhaba'],
        objectives: [
            { id: 'brew_chai', desc: { en: 'Brew masala chai', hi: 'मसाला चाय बनाएं' }, type: 'craft', target: 'masala_chai', count: 1, current: 0 },
            { id: 'serve_traveler', desc: { en: 'Serve the traveler', hi: 'यात्री को परोसें' }, type: 'interact', target: 'traveler_npc', count: 1, current: 0 }
        ],
        rewards: { coins: 30, items: ['recipe_ginger_tea'], xp: 75 },
        unlocks: ['mq_village_helper']
    },

    'mq_village_helper': {
        id: 'mq_village_helper',
        type: QuestType.MAIN,
        title: { en: 'Village Helper', hi: 'गाँव का सहायक' },
        description: {
            en: 'Help three villagers with their problems to earn their trust.',
            hi: 'तीन ग्रामीणों की समस्याओं में मदद करें।'
        },
        giver: 'dadi_kamala',
        prerequisites: ['mq_first_customer'],
        objectives: [
            { id: 'help_raju', desc: { en: 'Help Raju the musician', hi: 'राजू की मदद करें' }, type: 'quest', target: 'sq_raju_instrument', count: 1, current: 0 },
            { id: 'help_meera', desc: { en: 'Help Meera the cook', hi: 'मीरा की मदद करें' }, type: 'quest', target: 'sq_meera_spices', count: 1, current: 0 },
            { id: 'help_vaidya', desc: { en: 'Help Vaidya Arjun', hi: 'वैद्य अर्जुन की मदद करें' }, type: 'quest', target: 'sq_vaidya_herbs', count: 1, current: 0 }
        ],
        rewards: { coins: 100, items: ['village_key'], xp: 200 },
        unlocks: ['mq_temple_mystery']
    },

    'mq_temple_mystery': {
        id: 'mq_temple_mystery',
        type: QuestType.MAIN,
        title: { en: 'Temple Secrets', hi: 'मंदिर के रहस्य' },
        description: {
            en: 'Investigate the strange occurrences at the hilltop temple.',
            hi: 'पहाड़ी मंदिर में अजीब घटनाओं की जाँच करें।'
        },
        giver: 'pandit_shankara',
        prerequisites: ['mq_village_helper'],
        objectives: [
            { id: 'visit_temple', desc: { en: 'Visit the temple at night', hi: 'रात में मंदिर जाएं' }, type: 'location', target: 'temple', timeCondition: 'night', count: 1, current: 0 },
            { id: 'find_clue', desc: { en: 'Find the hidden inscription', hi: 'छिपा शिलालेख खोजें' }, type: 'interact', target: 'temple_inscription', count: 1, current: 0 },
            { id: 'talk_sadhu', desc: { en: 'Speak with the mysterious Sadhu', hi: 'रहस्यमय साधु से बात करें' }, type: 'dialogue', target: 'mysterious_sadhu', count: 1, current: 0 }
        ],
        rewards: { coins: 150, items: ['ancient_map'], xp: 250 },
        unlocks: ['mq_moon_gem_hunt']
    },

    'mq_moon_gem_hunt': {
        id: 'mq_moon_gem_hunt',
        type: QuestType.MAIN,
        title: { en: 'The Moon Gem', hi: 'चंद्र मणि' },
        description: {
            en: 'Follow the clues to find the legendary Chandra Mani that protects the village.',
            hi: 'गाँव की रक्षा करने वाली चंद्र मणि खोजें।'
        },
        giver: 'mysterious_sadhu',
        prerequisites: ['mq_temple_mystery'],
        objectives: [
            { id: 'decode_map', desc: { en: 'Decode the ancient map', hi: 'प्राचीन नक्शा समझें' }, type: 'interact', target: 'ancient_map_item', count: 1, current: 0 },
            { id: 'find_cave', desc: { en: 'Find the hidden cave', hi: 'छिपी गुफा खोजें' }, type: 'location', target: 'secret_cave', count: 1, current: 0 },
            { id: 'solve_puzzle', desc: { en: 'Solve the cave puzzle', hi: 'गुफा की पहेली सुलझाएं' }, type: 'puzzle', target: 'cave_puzzle', count: 1, current: 0 },
            { id: 'obtain_gem', desc: { en: 'Obtain the Moon Gem', hi: 'चंद्र मणि प्राप्त करें' }, type: 'collect', target: 'moon_gem', count: 1, current: 0 }
        ],
        rewards: { coins: 500, items: ['moon_gem_pendant'], xp: 500 },
        unlocks: ['mq_protect_village']
    },

    // ===== SIDE QUESTS =====
    'sq_meera_spices': {
        id: 'sq_meera_spices',
        type: QuestType.SIDE,
        title: { en: 'Spice of Life', hi: 'मसालों की खोज' },
        description: {
            en: 'Help Meera gather rare spices for her famous festival dish.',
            hi: 'मीरा को त्योहार की डिश के लिए दुर्लभ मसाले इकट्ठा करने में मदद करें।'
        },
        giver: 'meera',
        objectives: [
            { id: 'get_cardamom', desc: { en: 'Find wild cardamom', hi: 'जंगली इलायची खोजें' }, type: 'collect', target: 'cardamom', count: 3, current: 0 },
            { id: 'get_cinnamon', desc: { en: 'Get cinnamon bark', hi: 'दालचीनी की छाल लाएं' }, type: 'collect', target: 'cinnamon', count: 2, current: 0 },
            { id: 'get_saffron', desc: { en: 'Find mountain saffron', hi: 'पहाड़ी केसर खोजें' }, type: 'collect', target: 'saffron', count: 1, current: 0 }
        ],
        rewards: { coins: 40, items: ['recipe_kheer'], xp: 50, friendship: { meera: 20 } }
    },

    'sq_raju_instrument': {
        id: 'sq_raju_instrument',
        type: QuestType.SIDE,
        title: { en: 'The Broken Strings', hi: 'टूटे तार' },
        description: {
            en: 'Help Raju repair his beloved sarangi.',
            hi: 'राजू को उनकी प्यारी सारंगी ठीक करने में मदद करें।'
        },
        giver: 'raju',
        objectives: [
            { id: 'find_strings', desc: { en: 'Find goat hair strings', hi: 'बकरी के बाल के तार खोजें' }, type: 'collect', target: 'goat_hair', count: 5, current: 0 },
            { id: 'get_resin', desc: { en: 'Collect pine resin', hi: 'देवदार का राल इकट्ठा करें' }, type: 'collect', target: 'pine_resin', count: 2, current: 0 },
            { id: 'return_raju', desc: { en: 'Return to Raju', hi: 'राजू के पास वापस जाएं' }, type: 'dialogue', target: 'raju', count: 1, current: 0 }
        ],
        rewards: { coins: 35, items: ['flute'], xp: 45, friendship: { raju: 25 } }
    },

    'sq_vaidya_herbs': {
        id: 'sq_vaidya_herbs',
        type: QuestType.SIDE,
        title: { en: 'The Rare Bloom', hi: 'दुर्लभ फूल' },
        description: {
            en: 'Find the high-altitude Brahma Kamal flower for Vaidya Arjun\'s medicine.',
            hi: 'वैद्य अर्जुन की दवाई के लिए ऊँचाई पर उगने वाला ब्रह्म कमल खोजें।'
        },
        giver: 'vaidya_arjun',
        objectives: [
            { id: 'climb_peak', desc: { en: 'Climb to the high meadow', hi: 'ऊँचे चरागाह पर चढ़ें' }, type: 'location', target: 'high_meadow', count: 1, current: 0 },
            { id: 'find_flower', desc: { en: 'Find the Brahma Kamal', hi: 'ब्रह्म कमल खोजें' }, type: 'collect', target: 'brahma_kamal', count: 1, current: 0 },
            { id: 'return_flower', desc: { en: 'Deliver to Vaidya', hi: 'वैद्य को दें' }, type: 'dialogue', target: 'vaidya_arjun', count: 1, current: 0 }
        ],
        rewards: { coins: 60, items: ['healing_salve', 'recipe_herbal_tea'], xp: 65, friendship: { vaidya_arjun: 30 } }
    },

    'sq_sunita_wool': {
        id: 'sq_sunita_wool',
        type: QuestType.SIDE,
        title: { en: 'Threads of Warmth', hi: 'गर्माहट के धागे' },
        description: {
            en: 'Help Sunita gather materials for a special winter shawl.',
            hi: 'सुनीता को सर्दियों की शॉल के लिए सामान इकट्ठा करने में मदद करें।'
        },
        giver: 'sunita',
        objectives: [
            { id: 'get_wool', desc: { en: 'Collect fine wool', hi: 'अच्छी ऊन इकट्ठा करें' }, type: 'collect', target: 'fine_wool', count: 8, current: 0 },
            { id: 'get_dye', desc: { en: 'Get natural dye plants', hi: 'प्राकृतिक रंग के पौधे लाएं' }, type: 'collect', target: 'dye_plants', count: 4, current: 0 }
        ],
        rewards: { coins: 45, items: ['warm_shawl'], xp: 55, friendship: { sunita: 20 } }
    },

    'sq_bhim_treasure': {
        id: 'sq_bhim_treasure',
        type: QuestType.SIDE,
        title: { en: 'Mountain Treasure', hi: 'पहाड़ का खज़ाना' },
        description: {
            en: 'Join Bhim on an expedition to find ancient artifacts in the mountains.',
            hi: 'पहाड़ों में प्राचीन वस्तुएँ खोजने के लिए भीम के साथ जाएं।'
        },
        giver: 'bhim',
        objectives: [
            { id: 'prepare_supplies', desc: { en: 'Gather expedition supplies', hi: 'अभियान की सामग्री जुटाएं' }, type: 'collect', target: 'expedition_kit', count: 1, current: 0 },
            { id: 'explore_ruins', desc: { en: 'Explore the ancient ruins', hi: 'प्राचीन खंडहर देखें' }, type: 'location', target: 'ancient_ruins', count: 1, current: 0 },
            { id: 'find_artifact', desc: { en: 'Find the hidden artifact', hi: 'छिपी वस्तु खोजें' }, type: 'collect', target: 'ancient_artifact', count: 1, current: 0 }
        ],
        rewards: { coins: 80, items: ['climbing_gear', 'old_coin'], xp: 75, friendship: { bhim: 25 } }
    },

    'sq_lost_goat': {
        id: 'sq_lost_goat',
        type: QuestType.SIDE,
        title: { en: 'The Lost Kid', hi: 'खोया बच्चा' },
        description: {
            en: 'A child\'s pet goat has wandered off into the forest. Find it before nightfall!',
            hi: 'एक बच्चे की पालतू बकरी जंगल में चली गई। रात से पहले उसे खोजें!'
        },
        giver: 'village_child',
        objectives: [
            { id: 'search_forest', desc: { en: 'Search the pine forest', hi: 'देवदार के जंगल में खोजें' }, type: 'location', target: 'pine_forest_deep', count: 1, current: 0 },
            { id: 'find_goat', desc: { en: 'Find the baby goat', hi: 'बकरी के बच्चे को खोजें' }, type: 'interact', target: 'lost_goat', count: 1, current: 0 },
            { id: 'return_goat', desc: { en: 'Return the goat safely', hi: 'बकरी को सुरक्षित लौटाएं' }, type: 'dialogue', target: 'village_child', count: 1, current: 0 }
        ],
        rewards: { coins: 25, items: ['goat_milk'], xp: 30 }
    },

    'sq_adopt_pet': {
        id: 'sq_adopt_pet',
        type: QuestType.SIDE,
        title: { en: 'The Stray Companion', hi: 'आवारा साथी' },
        description: {
            en: 'A lonely stray dog has been seen near the village entrance. Win its trust.',
            hi: 'गाँव के प्रवेश द्वार के पास एक अकेला आवारा कुत्ता देखा गया है। उसका भरोसा जीतें।'
        },
        giver: 'dadi_kamala',
        objectives: [
            { id: 'find_dog', desc: { en: 'Find the stray dog', hi: 'आवारा कुत्ता खोजें' }, type: 'interact', target: 'stray_dog', count: 1, current: 0 },
            { id: 'feed_dog', desc: { en: 'Feed the dog some milk', hi: 'कुत्ते को दूध पिलाएं' }, type: 'give', target: 'stray_dog', item: 'milk', count: 1, current: 0 },
            { id: 'adopt_dog', desc: { en: 'Adopt the dog', hi: 'कुत्ते को अपनाएं' }, type: 'dialogue', target: 'stray_dog', count: 1, current: 0 }
        ],
        rewards: { xp: 100, pet: 'sheepdog', friendship: { dadi_kamala: 10 } }
    },

    'sq_whispering_pine': {
        id: 'sq_whispering_pine',
        type: QuestType.SIDE,
        title: { en: 'The Whispering Pine', hi: 'फुसफुसाता देवदार' },
        description: {
            en: 'You hear a strange voice coming from an ancient pine tree near the cliffs.',
            hi: 'चट्टानों के पास एक पुराने देवदार के पेड़ से आपको एक अजीब आवाज सुनाई देती है।'
        },
        giver: 'nature', // Triggered by location/interaction
        objectives: [
            { id: 'investigate_sound', desc: { en: 'Investigate the whispering tree', hi: 'फुसफुसाते पेड़ की जाँच करें' }, type: 'interact', target: 'ancient_pine', count: 1, current: 0 },
            { id: 'find_source', desc: { en: 'Find the source of the voice', hi: 'आवाज का स्रोत खोजें' }, type: 'collect', target: 'wind_chime', count: 1, current: 0 } // It was just a wind chime!
        ],
        choices: {
            'keep_chime': {
                rewards: { items: ['wind_chime_charm'], xp: 50 }
            },
            'leave_chime': {
                rewards: { xp: 100, friendship: { nature_spirits: 10 } } // unseen faction
            }
        },
        rewards: { coins: 20, xp: 50 }
    },

    // ===== DAILY QUESTS =====
    'dq_morning_chai': {
        id: 'dq_morning_chai',
        type: QuestType.DAILY,
        title: { en: 'Morning Brew', hi: 'सुबह की चाय' },
        description: {
            en: 'Serve chai to early morning customers.',
            hi: 'सुबह के ग्राहकों को चाय परोसें।'
        },
        objectives: [
            { id: 'serve_chai', desc: { en: 'Serve 3 cups of chai', hi: '3 कप चाय परोसें' }, type: 'serve', target: 'any_chai', count: 3, current: 0 }
        ],
        rewards: { coins: 15, xp: 20 },
        repeatable: true
    },

    'dq_foraging': {
        id: 'dq_foraging',
        type: QuestType.DAILY,
        title: { en: 'Forest Bounty', hi: 'जंगल की देन' },
        description: {
            en: 'Gather fresh ingredients from the forest.',
            hi: 'जंगल से ताज़ी सामग्री इकट्ठा करें।'
        },
        objectives: [
            { id: 'gather_items', desc: { en: 'Gather 5 forest items', hi: '5 जंगली चीज़ें इकट्ठा करें' }, type: 'collect', target: 'any_forage', count: 5, current: 0 }
        ],
        rewards: { coins: 10, xp: 15 },
        repeatable: true
    },

    'dq_meditation': {
        id: 'dq_meditation',
        type: QuestType.DAILY,
        title: { en: 'Inner Peace', hi: 'आंतरिक शांति' },
        description: {
            en: 'Meditate at the temple to restore your spirit.',
            hi: 'आत्मा को शांत करने के लिए मंदिर में ध्यान करें।'
        },
        objectives: [
            { id: 'meditate', desc: { en: 'Meditate for 5 minutes', hi: '5 मिनट ध्यान करें' }, type: 'activity', target: 'meditation', count: 1, current: 0 }
        ],
        rewards: { xp: 25, energy: 50 },
        repeatable: true
    }
};

// Quest Manager
export const QuestManager = {
    activeQuests: [],
    completedQuests: [],
    questLog: [],

    init() {
        // Start with the first main quest
        this.startQuest('mq_restore_dhaba');
    },

    startQuest(questId) {
        const questDef = QuestData[questId];
        if (!questDef) return false;

        // Check prerequisites
        if (questDef.prerequisites) {
            for (const prereq of questDef.prerequisites) {
                if (!this.completedQuests.includes(prereq)) {
                    return false;
                }
            }
        }

        // Check if already active or completed
        if (this.activeQuests.find(q => q.id === questId)) return false;
        if (this.completedQuests.includes(questId) && !questDef.repeatable) return false;

        // Create active quest instance
        const quest = {
            id: questId,
            state: QuestState.ACTIVE,
            objectives: JSON.parse(JSON.stringify(questDef.objectives)),
            startDay: window.GameState?.day || 1,
            startTime: Date.now()
        };

        this.activeQuests.push(quest);
        this.logEvent(questId, 'started');

        return true;
    },

    updateObjective(type, target, amount = 1) {
        for (const quest of this.activeQuests) {
            const questDef = QuestData[quest.id];

            for (const obj of quest.objectives) {
                if (obj.type === type && (obj.target === target || obj.target.startsWith('any_'))) {
                    obj.current = Math.min(obj.current + amount, obj.count);

                    // Check if quest is complete
                    if (this.isQuestComplete(quest)) {
                        this.completeQuest(quest.id);
                    }

                    return true;
                }
            }
        }
        return false;
    },

    isQuestComplete(quest) {
        return quest.objectives.every(obj => obj.current >= obj.count);
    },

    completeQuest(questId) {
        const questIndex = this.activeQuests.findIndex(q => q.id === questId);
        if (questIndex === -1) return false;

        const quest = this.activeQuests[questIndex];
        const questDef = QuestData[questId];

        quest.state = QuestState.COMPLETED;
        this.activeQuests.splice(questIndex, 1);

        if (!questDef.repeatable) {
            this.completedQuests.push(questId);
        }

        // Grant rewards
        this.grantRewards(questDef.rewards);

        // Unlock new quests
        if (questDef.unlocks) {
            for (const unlockId of questDef.unlocks) {
                // These become available but don't auto-start
                this.logEvent(unlockId, 'unlocked');
            }
        }

        this.logEvent(questId, 'completed');
        return true;
    },

    grantRewards(rewards) {
        if (!rewards) return;

        if (rewards.coins && window.Inventory) {
            window.Inventory.addCoins(rewards.coins);
        }

        if (rewards.items && window.Inventory) {
            for (const itemId of rewards.items) {
                window.Inventory.addItem(itemId, 1);
            }
        }

        if (rewards.xp && window.Player) {
            window.Player.addXP(rewards.xp);
        }

        if (rewards.friendship && window.RelationshipManager) {
            for (const [npcId, amount] of Object.entries(rewards.friendship)) {
                window.RelationshipManager.addFriendship(npcId, amount);
            }
        }

        if (rewards.pet && window.PetManager) {
            if (window.PetManager.adoptPet(rewards.pet)) {
                if (window.NotificationSystem) {
                    window.NotificationSystem.show('🐾 New Companion Adopted!', 'success');
                }
            }
        }
    },

    logEvent(questId, event) {
        this.questLog.push({
            questId,
            event,
            timestamp: Date.now(),
            day: window.GameState?.day || 1
        });
    },

    getActiveQuests() {
        return this.activeQuests.map(q => ({
            ...q,
            definition: QuestData[q.id]
        }));
    },

    getQuestProgress(questId) {
        const quest = this.activeQuests.find(q => q.id === questId);
        if (!quest) return null;

        const completed = quest.objectives.filter(o => o.current >= o.count).length;
        const total = quest.objectives.length;

        return { completed, total, percentage: (completed / total) * 100 };
    },

    // Save/Load
    getSaveData() {
        return {
            activeQuests: this.activeQuests,
            completedQuests: this.completedQuests,
            questLog: this.questLog.slice(-50) // Keep last 50 entries
        };
    },

    loadSaveData(data) {
        if (data.activeQuests) this.activeQuests = data.activeQuests;
        if (data.completedQuests) this.completedQuests = data.completedQuests;
        if (data.questLog) this.questLog = data.questLog;
    },

    // Branching Choices
    handleChoice(questId, choiceId) {
        const quest = this.activeQuests.find(q => q.id === questId);
        if (!quest) return false;

        const questDef = QuestData[questId];
        if (!questDef.choices || !questDef.choices[choiceId]) return false;

        const choiceEffect = questDef.choices[choiceId];

        // Log the choice
        this.logEvent(questId, `choice_${choiceId}`);

        // Apply effects
        if (choiceEffect.nextStage) {
            // Logic to advance quest stage could go here
            // For now, we'll just log it, but this enables multi-stage quests
            console.log(`Quest ${questId} advancing to stage: ${choiceEffect.nextStage}`);
        }

        if (choiceEffect.rewards) {
            this.grantRewards(choiceEffect.rewards);
        }

        return true;
    }
};
