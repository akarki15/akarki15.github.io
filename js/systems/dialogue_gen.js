export const DialogueGenerator = {
    // Word Banks
    banks: {
        greetings: {
            morning: { en: ['Good morning', 'Namaste', 'Ram Ram', 'Rise and shine', 'The sun greets you'], hi: ['सुप्रभात', 'नमस्ते', 'राम राम', 'सुदिनम'] },
            afternoon: { en: ['Good afternoon', 'Namaste', 'The sun is high', 'A warm day'], hi: ['नमस्ते', 'दोपहर की नमस्ते', 'धूप तेज़ है'] },
            evening: { en: ['Good evening', 'The day cools', 'Namaste', 'Stars approach'], hi: ['शुभ संध्या', 'नमस्ते', 'शाम हो गई'] },
            generic: { en: ['Hello', 'Greetings', 'Welcome'], hi: ['नमस्ते', 'प्रणाम', 'पधारिये'] }
        },
        intros: {
            en: ['child', 'traveler', 'friend', 'neighbor', 'young one'],
            hi: ['बच्चे', 'यात्री', 'दोस्त', 'पड़ोसी', 'नौजवान']
        },
        weather_obs: {
            en: ['The wind whispers today.', 'The mountains look sharp.', 'The air smells of pine.', 'Clouds are dancing.', 'A good day for chai.'],
            hi: ['आज हवा कुछ कह रही है।', 'पहाड़ साफ दिख रहे हैं।', 'हवा में देवदार की खुशबू है।', 'बादल नाच रहे हैं।', 'चाय के लिए अच्छा दिन है।']
        },
        feelings: {
            en: ['I feel at peace.', 'My old bones ache a bit.', 'I am thinking of my childhood.', 'Work is worship today.', 'The spirits are quiet.'],
            hi: ['मैं बहुत शांत हूँ।', 'मेरी पुरानी हड्डियों में थोड़ा दर्द है।', 'मुझे अपने बचपन की याद आ रही है।', 'आज काम ही पूजा है।', 'आत्माएं शांत हैं।']
        },
        // Player Choices
        player: {
            chat: {
                neutral: { en: ['Chat', 'Talk a bit', 'How are you?', 'Any news?'], hi: ['बातचीत करें', 'क्या हाल है?', 'कुछ खबर?'] },
                happy: { en: ['(Enthusiastic) Hello!', 'Lovely day to talk!', 'Tell me a story!', 'So happy to see you!'], hi: ['(उत्साह से) नमस्ते!', 'बात करने के लिए अच्छा दिन!', 'कोई कहानी सुनाओ!', 'आपको देखकर खुशी हुई!'] },
                tired: { en: ['(Yawn) Talk...', 'Keeping busy?', 'Tired...', 'Quick chat?'], hi: ['(उबासी) बात...', 'व्यस्त हो?', 'थकान...', 'छोटी सी बात?'] },
                friend: { en: ['Hey buddy!', 'What\'s cooking?', 'My favorite person!', 'Spill the tea!'], hi: ['अरे दोस्त!', 'क्या पक रहा है?', 'मेरे पसंदीदा इंसान!', 'गपशप करें!'] }
            },
            gift: {
                neutral: { en: ['Give Gift', 'Here is something'], hi: ['उपहार दें', 'यह लो'] },
                happy: { en: ['I have a surprise!', 'For you!', 'Best gift ever!'], hi: ['मेरे पास सरप्राइज़ है!', 'तुम्हारे लिए!', 'सबसे अच्छा तोहफा!'] },
                tired: { en: ['Take this.', 'Here...'], hi: ['ये लो।', 'यहाँ...'] },
                friend: { en: ['Something you love!', 'Just for you, friend.'], hi: ['तुम्हारे पसंद की चीज़!', 'सिर्फ तुम्हारे लिए दोस्त।'] }
            },
            bye: {
                neutral: { en: ['Bye', 'See you', 'Later'], hi: ['अलविदा', 'फिर मिलेंगे', 'बाद में'] },
                happy: { en: ['Have a wonderful day!', 'Catch you later!', 'Stay awesome!'], hi: ['आपका दिन शुभ हो!', 'फिर मिलते हैं!', 'शानदार रहो!'] },
                tired: { en: ['Going to sleep...', 'Too tired, bye.', 'Need rest...'], hi: ['सोने जा रहा हूँ...', 'बहुत थकान, बाय।', 'आराम चाहिए...'] },
                friend: { en: ['Don\'t be a stranger!', 'Call me!', 'Hugs!'], hi: ['अजनबी मत बनना!', 'बुलाना!', 'गले मिलो!'] }
            }
        }
    },

    // Template: "{Greeting}, {Intro}. {Weather}. {Feeling}"
    generate(npc, time, weather) {
        const lang = window.GameState?.language || 'en';

        // 1. Select Greeting based on Time
        let timeKey = 'generic';
        if (time < 12) timeKey = 'morning';
        else if (time < 17) timeKey = 'afternoon';
        else timeKey = 'evening';

        const greetings = this.banks.greetings[timeKey][lang];
        const greeting = greetings[Math.floor(Math.random() * greetings.length)];

        // 2. Select Intro
        const intros = this.banks.intros[lang];
        const intro = intros[Math.floor(Math.random() * intros.length)];

        // 3. Select Weather Observation
        const weathers = this.banks.weather_obs[lang];
        const weatherObs = weathers[Math.floor(Math.random() * weathers.length)];

        // 4. Select Feeling
        const feelings = this.banks.feelings[lang];
        const feeling = feelings[Math.floor(Math.random() * feelings.length)];

        return `${greeting}, ${intro}. ${weatherObs} ${feeling}`;
    },

    // Generate Player Choice Text
    generatePlayerChoice(type, mood, relationship) {
        const lang = window.GameState?.language || 'en';
        const bank = this.banks.player[type];
        if (!bank) return type; // Fallback

        // Priority: Friend > Happy/Tired > Neutral
        let options = bank.neutral[lang];

        if (relationship === 'Friend' || relationship === 'Partner' || relationship === 'Best Friend') {
            if (bank.friend && Math.random() > 0.3) options = bank.friend[lang];
        }

        if (mood === 'happy' && bank.happy) {
            if (options === bank.neutral[lang] || Math.random() > 0.5) options = bank.happy[lang];
        } else if (mood === 'tired' && bank.tired) {
            options = bank.tired[lang]; // Tired overrides everything mostly
        }

        return options[Math.floor(Math.random() * options.length)];
    },

    // Generate a quest hint or flavor text dynamically
    generateFlavor(npc) {
        // We can add specific banks per NPC role later
        return this.generate(npc, 12, 'clear');
    }
};
