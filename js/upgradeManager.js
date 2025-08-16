/**
 * UpgradeManager - Handles all upgrades and buildings
 * Modular system ready for expansion with new upgrade types
 */
const UpgradeManager = {
    // Upgrade costs configuration
    upgradeCosts: {
        time: [100, 500],
        route: [150, 750],
        loupe: [1000],
        lossRevert: [2000],
        // New shop upgrades - Multi-level Insta-Buy
        instaBuy: [5000, 12000, 20000, 30000],
        tipButton: [2000]
    },

    // Building costs configuration
    buildingCosts: {
        bank: 300,
        megaBuilding: 1500
    },

    /**
     * Purchase an upgrade
     * @param {string} type - Type of upgrade to purchase
     */
    buyUpgrade(type) {
        const costs = UpgradeManager.upgradeCosts[type];
        const currentLevel = GameState.getUpgradeLevel(type);
        const cost = costs[currentLevel];
        
        if (GameState.getCash() >= cost && currentLevel < costs.length) {
            GameState.subtractCash(cost);
            GameState.incrementUpgrade(type);
            UpgradeManager.updateTownUI();
            
            // Show success notification
            UIManager.showNotification(`${UpgradeManager.getUpgradeName(type)} purchased!`, 'success');
        }
    },

    /**
     * Purchase a building
     * @param {string} type - Type of building to purchase
     */
    buyBuilding(type) {
        const cost = UpgradeManager.buildingCosts[type];
        
        if (GameState.getCash() >= cost) {
            GameState.subtractCash(cost);
            GameState.incrementBuilding(type);
            UpgradeManager.updateTownUI();
            
            // Show success notification
            UIManager.showNotification(`${UpgradeManager.getBuildingName(type)} built!`, 'success');
        }
    },

    /**
     * Update the town/upgrade UI
     */
    updateTownUI() {
        UpgradeManager._updateUpgradeBuildings();
        UpgradeManager._updatePassiveBuildings();
        UpgradeManager._updatePassiveIncomeDisplay();
        UpgradeManager._updateNextDayButton();
    },

    /**
     * Update upgrade buildings UI
     * @private
     */
    _updateUpgradeBuildings() {
        ['time', 'route', 'loupe', 'lossRevert', 'instaBuy', 'tipButton'].forEach(type => {
            const level = GameState.getUpgradeLevel(type);
            const maxLevel = UpgradeManager.upgradeCosts[type].length;
            
            document.getElementById(`${type}-level`).textContent = level;
            
            if (level < maxLevel) {
                const cost = UpgradeManager.upgradeCosts[type][level];
                document.getElementById(`${type}-cost`).textContent = cost;
                document.getElementById(`${type}-btn`).disabled = GameState.getCash() < cost;
            } else {
                document.getElementById(`${type}-btn`).textContent = 'BUILT';
                document.getElementById(`${type}-btn`).disabled = true;
            }
        });
    },

    /**
     * Update passive income buildings UI
     * @private
     */
    _updatePassiveBuildings() {
        document.getElementById('bank-count').textContent = GameState.getBuildingCount('bank');
        document.getElementById('mega-count').textContent = GameState.getBuildingCount('megaBuilding');
        document.getElementById('bank-btn').disabled = GameState.getCash() < UpgradeManager.buildingCosts.bank;
        document.getElementById('mega-btn').disabled = GameState.getCash() < UpgradeManager.buildingCosts.megaBuilding;
    },

    /**
     * Update passive income display
     * @private
     */
    _updatePassiveIncomeDisplay() {
        const passiveIncome = GameState.getPassiveIncome();
        document.getElementById('passive-income').textContent = passiveIncome;
    },

    /**
     * Update next day button
     * @private
     */
    _updateNextDayButton() {
        const dailyCost = GameState.getDailyCost();
        const nextDayBtn = document.getElementById('next-day-btn');
        
        if (GameState.getCash() < dailyCost) {
            nextDayBtn.textContent = 'RESTART GAME';
            nextDayBtn.className = 'btn btn-danger btn-lg w-100';
        } else {
            const buttonText = dailyCost === 0 ? 
                'Start Next Day (FREE!)' : 
                `Start Next Day (-$${dailyCost})`;
            nextDayBtn.textContent = buttonText;
            nextDayBtn.className = 'btn btn-primary btn-lg w-100';
        }
    },

    /**
     * Get upgrade name for display
     * @param {string} type - Upgrade type
     * @returns {string} Upgrade name
     */
    getUpgradeName(type) {
        const names = {
            time: 'Clocktower',
            route: 'Stables', 
            loupe: 'Jeweler Shop',
            lossRevert: 'Loss Revert Magic',
            instaBuy: 'Insta-Buy Assistant',
            tipButton: 'Deal Finder'
        };
        return names[type] || type;
    },

    /**
     * Get upgrade description for future UI enhancements
     * @param {string} type - Upgrade type
     * @returns {string} Upgrade description
     */
    getUpgradeDescription(type) {
        const descriptions = {
            time: 'More time per day',
            route: 'Faster travel between shops',
            loupe: 'Highlights overpriced items',
            lossRevert: 'Converts biggest loss to profit!',
            instaBuy: 'Buy entire shop with discount (2-5% per level)',
            tipButton: 'Automatically highlights the best deal in each shop'
        };
        return descriptions[type] || '';
    },

    /**
     * Get Insta-Buy discount percentage based on level
     * @param {number} level - Upgrade level
     * @returns {number} Discount percentage
     */
    getInstaBuyDiscount(level) {
        const discounts = [0, 2, 3, 4, 5]; // Level 0 = 0%, Level 1 = 2%, etc.
        return discounts[level] || 0;
    },

    /**
     * Get building name for display
     * @param {string} type - Building type
     * @returns {string} Building name
     */
    getBuildingName(type) {
        const names = {
            bank: 'Bank',
            megaBuilding: 'Mega Building'
        };
        return names[type] || type;
    },

    /**
     * Get building description for future UI enhancements
     * @param {string} type - Building type
     * @returns {string} Building description
     */
    getBuildingDescription(type) {
        const descriptions = {
            bank: '+$20 per day each',
            megaBuilding: '+$200 per day each'
        };
        return descriptions[type] || '';
    },

    /**
     * Add new upgrade type (for future expansion)
     * @param {string} type - Upgrade type name
     * @param {Array} costs - Array of costs for each level
     */
    addUpgradeType(type, costs) {
        UpgradeManager.upgradeCosts[type] = costs;
        // Initialize upgrade level in game state
        GameState.state.upgrades[type] = 0;
    },

    /**
     * Add new building type (for future expansion)
     * @param {string} type - Building type name
     * @param {number} cost - Building cost
     */
    addBuildingType(type, cost) {
        UpgradeManager.buildingCosts[type] = cost;
        // Initialize building count in game state
        GameState.state.buildings[type] = 0;
    }
};
