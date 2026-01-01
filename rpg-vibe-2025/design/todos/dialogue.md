# Dialogue System Improvements

This file tracks tasks for deepening character interactions and "deeper character dialogues".

## Goal: "Deep Character Dialogues"

### NPC Personality Profiles
Define "Vibe" and "Voice" for key NPCs in `js/systems/dialogue_gen.js`.

#### Dadi Kamala (The Grandmother)
- **Vibe**: Warm, wise, slightly strict about tradition but loving.
- **Voice**: Uses Hindi endearments ("Beta", "Mera bachha"). Speaks in proverbs.
- **Topics**: Old recipes, village history, health precautions.

#### Raju (The Musician)
- **Vibe**: Dreamy, artistic, unreliable but charming.
- **Voice**: Poetic, often hums or references songs.
- **Topics**: Music, nature's sounds, finding the perfect rhythm.

#### Meera (The Cook)
- **Vibe**: Practical, energetic, gossip-loving.
- **Voice**: Fast-paced, asks many questions.
- **Topics**: Food, other villagers' secrets, spice prices.

### Technical Tasks
- [ ] **Context Awareness**: Modify `DialogueGenerator.generate()` in `js/systems/dialogue_gen.js` to check:
    - [ ] **Relationship Score**: Unlock deeper secrets at high friendship.
    - [ ] **Quest State**: NPCs should comment on current active quests (e.g., "Good luck finding that broom!").
    - [ ] **Inventory**: React if player is holding a specific item.

- [ ] **Dynamic Greetings**: Add time-specific greetings (Morning/Evening) that are more varied than current set.
