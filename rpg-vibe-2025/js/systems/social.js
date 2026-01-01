/**
 * Pahadi Tales - Social System
 * Handles relationships, conversation history, and social status
 */

export const SocialSystem = {
    relationships: {}, // npcId -> { xp: 0, status: 'Stranger', giftsToday: 0, talkedToday: false }

    // Status thresholds
    THRESHOLDS: {
        'Stranger': 0,
        'Acquaintance': 20,
        'Friend': 60,
        'Good Friend': 120,
        'Best Friend': 200,
        'Partner': 350, // Dating
        'Spouse': 600   // Marriage
    },

    init() {
        this.relationships = {};
    },

    getRelationship(npcId) {
        if (!this.relationships[npcId]) {
            this.relationships[npcId] = { xp: 0, status: 'Stranger', giftsToday: 0, talkedToday: false };
        }
        return this.relationships[npcId];
    },

    addXP(npcId, amount) {
        const rel = this.getRelationship(npcId);
        rel.xp += amount;
        this.updateStatus(npcId);
        return rel.status;
    },

    updateStatus(npcId) {
        const rel = this.getRelationship(npcId);
        let newStatus = rel.status;

        for (const [status, threshold] of Object.entries(this.THRESHOLDS)) {
            if (rel.xp >= threshold) {
                // Don't auto-upgrade to dating/marriage without event, but simple for now
                if (status === 'Partner' && rel.status !== 'Partner' && rel.status !== 'Spouse') continue;
                if (status === 'Spouse' && rel.status !== 'Spouse') continue;
                newStatus = status;
            }
        }

        if (newStatus !== rel.status) {
            rel.status = newStatus;
            return true; // Status changed
        }
        return false;
    },

    canDate(npcId) {
        const rel = this.getRelationship(npcId);
        return rel.xp >= 200 && rel.status !== 'Partner' && rel.status !== 'Spouse';
    },

    startDating(npcId) {
        const rel = this.getRelationship(npcId);
        if (this.canDate(npcId)) {
            rel.status = 'Partner';
            rel.xp += 50;
            return true;
        }
        return false;
    },

    // Save/Load
    getSaveData() {
        return this.relationships;
    },

    loadSaveData(data) {
        if (data) this.relationships = data;
    }
};

// Global access
if (typeof window !== 'undefined') window.SocialSystem = SocialSystem;
