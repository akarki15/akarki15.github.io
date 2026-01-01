# Quest Development Backlog

This file tracks ideas and implementation steps for new quests and narrative enhancements.

## Goal: "More Satisfying Stories"

### New Quest Arc: "The Mountain Spirit"
**Theme**: Mystical connection with nature.
- [ ] **Quest 1: The Whispering Pine**
    - **Concept**: Players hear a voice from an ancient tree.
    - **Objective**: Find the source of the sound (a trapped spirit or wind chime).
    - **Reward**: "Pine Cone Charm" (minor luck boost).
    - **Files to Modify**: `js/systems/quest.js` (add quest def), `js/engine/game.js` (add interaction).

- [ ] **Quest 2: Shadow of the Peak**
    - **Concept**: A shadow is growing over the village crops.
    - **Objective**: Climb to a specific high point at sunset to find what's blocking the light.
    - **Reward**: Unlock "Sun Greeting" emote.

### New Quest Arc: "The Lost Caravan"
**Theme**: History and trade.
- [ ] **Quest 1: Wagon Tracks**
    - **Concept**: Old tracks found near the river.
    - **Objective**: Follow tracks to a hidden cave.
    - **Reward**: Old coins.

### System Improvements
- [ ] **Branching Choices**: Implement `nextStep` logic in `quest.js` that depends on player dialogue choice.
- [ ] **Quest Journal UI**: Make the quest log in the UI more detailed (show flavor text vs just objectives).
