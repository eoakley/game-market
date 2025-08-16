/**
 * GameState - Central game state management
 * Handles all game data and provides methods to access/modify state
 */
const GameState = {
    // Core game state
    state: {
        cash: 1000,
        day: 1,
        tier: 1,
        timeRemaining: 60,
        dailyInventory: [],
        skipCount: 0,
        upgrades: { time: 0, route: 0, loupe: 0, lossRevert: 0 },
        buildings: { bank: 0, megaBuilding: 0 },
        timer: null,
        debugMode: false,
        currentShop: []
    },

    // Getters for game state
    getCash: () => GameState.state.cash,
    getDay: () => GameState.state.day,
    getTier: () => GameState.state.tier,
    getTimeRemaining: () => GameState.state.timeRemaining,
    getDailyInventory: () => GameState.state.dailyInventory,
    getSkipCount: () => GameState.state.skipCount,
    getUpgrades: () => GameState.state.upgrades,
    getBuildings: () => GameState.state.buildings,
    getTimer: () => GameState.state.timer,
    getDebugMode: () => GameState.state.debugMode,
    getCurrentShop: () => GameState.state.currentShop,

    // Setters for game state
    setCash: (cash) => GameState.state.cash = cash,
    setDay: (day) => GameState.state.day = day,
    setTier: (tier) => GameState.state.tier = tier,
    setTimeRemaining: (time) => GameState.state.timeRemaining = time,
    setDailyInventory: (inventory) => GameState.state.dailyInventory = inventory,
    setSkipCount: (count) => GameState.state.skipCount = count,
    setTimer: (timer) => GameState.state.timer = timer,
    setDebugMode: (mode) => GameState.state.debugMode = mode,
    setCurrentShop: (shop) => GameState.state.currentShop = shop,

    // Utility methods
    addCash: (amount) => GameState.state.cash += amount,
    subtractCash: (amount) => GameState.state.cash -= amount,
    addToInventory: (item) => GameState.state.dailyInventory.push(item),
    incrementDay: () => GameState.state.day++,
    incrementTier: (amount = 1) => GameState.state.tier += amount,
    incrementSkipCount: () => GameState.state.skipCount++,
    resetSkipCount: () => GameState.state.skipCount = 0,
    decreaseTimeRemaining: (amount) => GameState.state.timeRemaining -= amount,

    // Upgrade methods
    getUpgradeLevel: (type) => GameState.state.upgrades[type] || 0,
    incrementUpgrade: (type) => GameState.state.upgrades[type]++,
    getBuildingCount: (type) => GameState.state.buildings[type] || 0,
    incrementBuilding: (type) => GameState.state.buildings[type]++,

    // Reset game state
    reset: () => {
        GameState.state = {
            cash: 1000,
            day: 1,
            tier: 1,
            timeRemaining: 60,
            dailyInventory: [],
            skipCount: 0,
            upgrades: { time: 0, route: 0, loupe: 0, lossRevert: 0 },
            buildings: { bank: 0, megaBuilding: 0 },
            timer: null,
            debugMode: false,
            currentShop: []
        };
    },

    // Calculate passive income
    getPassiveIncome: () => {
        const bankIncome = GameState.getBuildingCount('bank') * 20;
        const megaIncome = GameState.getBuildingCount('megaBuilding') * 200;
        return bankIncome + megaIncome;
    },

    // Calculate daily cost
    getDailyCost: () => (GameState.getDay() - 1) * 10
};
