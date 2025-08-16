/**
 * GameManager - Main game coordination and high-level flow management
 * Orchestrates all other modules and handles game lifecycle
 */
const GameManager = {
    /**
     * Initialize and start the game
     */
    startGame() {
        UIManager.showScreen('shop');
        ShopManager.generateShop();
        TimerSystem.startTimer();
    },

    /**
     * Reset game to initial state
     */
    resetGame() {
        // Stop any running timers
        TimerSystem.stopTimer();
        
        // Reset game state
        GameState.reset();
        
        // Show intro screen
        UIManager.showScreen('intro');
        
        // Update UI
        UIManager.updateUI();
    },

    /**
     * Initialize the entire game system
     */
    initialize() {
        // Initialize UI and attach event listeners
        UIManager.initializeUI();
        
        // Set up initial state
        GameState.reset();
        
        // Show intro screen
        UIManager.showScreen('intro');
    },

    /**
     * Check victory condition
     * @returns {boolean} True if player has won
     */
    checkVictory() {
        const inventory = GameState.getDailyInventory();
        return inventory.some(item => item.isImmortalityPotion);
    },

    /**
     * Get game statistics for analysis
     * @returns {Object} Complete game statistics
     */
    getGameStats() {
        return {
            day: GameState.getDay(),
            cash: GameState.getCash(),
            tier: GameState.getTier(),
            timeRemaining: GameState.getTimeRemaining(),
            upgrades: GameState.getUpgrades(),
            buildings: GameState.getBuildings(),
            dailyInventory: GameState.getDailyInventory(),
            passiveIncome: GameState.getPassiveIncome(),
            dailyCost: GameState.getDailyCost()
        };
    },

    /**
     * Save game state (for future save/load functionality)
     * @returns {string} Serialized game state
     */
    saveGame() {
        const gameStats = GameManager.getGameStats();
        return JSON.stringify(gameStats);
    },

    /**
     * Load game state (for future save/load functionality)
     * @param {string} saveData - Serialized game state
     * @returns {boolean} True if load successful
     */
    loadGame(saveData) {
        try {
            const data = JSON.parse(saveData);
            
            // Restore game state
            GameState.setCash(data.cash || 1000);
            GameState.setDay(data.day || 1);
            GameState.setTier(data.tier || 1);
            GameState.setTimeRemaining(data.timeRemaining || 60);
            GameState.setDailyInventory(data.dailyInventory || []);
            
            // Restore upgrades and buildings
            Object.assign(GameState.state.upgrades, data.upgrades || {});
            Object.assign(GameState.state.buildings, data.buildings || {});
            
            UIManager.updateUI();
            return true;
        } catch (error) {
            console.error('Failed to load game:', error);
            return false;
        }
    },

    /**
     * Export game data for sharing/analysis
     * @returns {Object} Formatted game data
     */
    exportGameData() {
        const stats = GameManager.getGameStats();
        const dayStats = DayManager.getDayStats();
        
        return {
            gameInfo: {
                version: '1.0.0',
                exportedAt: new Date().toISOString()
            },
            gameState: stats,
            dailyStats: dayStats,
            achievements: GameManager.checkAchievements() // For future achievement system
        };
    },

    /**
     * Check achievements (placeholder for future system)
     * @returns {Array} Array of unlocked achievements
     */
    checkAchievements() {
        const achievements = [];
        const stats = GameManager.getGameStats();
        
        // Example achievements that could be implemented
        if (stats.cash >= 100000) achievements.push('Six Figure Merchant');
        if (stats.day >= 10) achievements.push('Veteran Trader');
        if (stats.buildings.megaBuilding >= 5) achievements.push('Real Estate Mogul');
        
        return achievements;
    },

    /**
     * Handle game over scenarios
     */
    handleGameOver() {
        UIManager.showModal(
            'Game Over',
            'You don\'t have enough money to continue. The game will restart.',
            () => GameManager.resetGame()
        );
    },

    /**
     * Get debug information
     * @returns {Object} Debug information
     */
    getDebugInfo() {
        return {
            gameState: GameState.state,
            currentShop: GameState.getCurrentShop(),
            debugMode: GameState.getDebugMode(),
            timerActive: GameState.getTimer() !== null
        };
    }
};

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    GameManager.initialize();
});
