/**
 * TimerSystem - Handles game timer functionality
 * Centralized timer management for the daily time limit
 */
const TimerSystem = {
    /**
     * Start the daily timer
     */
    startTimer() {
        // Calculate max time based on upgrades
        const timeLevel = GameState.getUpgradeLevel('time');
        const routeLevel = GameState.getUpgradeLevel('route');
        const maxTime = 60 + timeLevel * 10 + routeLevel * 5; // Clocktower: +10s/level, Stables: +5s/level
        GameState.setTimeRemaining(maxTime);
        
        // Clear any existing timer
        TimerSystem.stopTimer();
        
        // Start new timer
        const timer = setInterval(() => {
            GameState.decreaseTimeRemaining(0.1);
            
            if (GameState.getTimeRemaining() <= 0) {
                DayManager.endDay();
            }
            
            TimerSystem.updateTimerDisplay();
        }, 100);
        
        GameState.setTimer(timer);
    },

    /**
     * Stop the current timer
     */
    stopTimer() {
        const currentTimer = GameState.getTimer();
        if (currentTimer) {
            clearInterval(currentTimer);
            GameState.setTimer(null);
        }
    },

    /**
     * Update the timer display with warning effects
     */
    updateTimerDisplay() {
        const timerElement = document.getElementById('timer');
        const timeRemaining = GameState.getTimeRemaining();
        
        // Update display
        timerElement.textContent = timeRemaining.toFixed(1);
        
        // Add warning animation when time is low
        if (timeRemaining < 15 && timeRemaining > 0) {
            timerElement.classList.add('warning');
        } else {
            timerElement.classList.remove('warning');
        }
    },

    /**
     * Get formatted time remaining
     * @returns {string} Formatted time string
     */
    getFormattedTime() {
        return GameState.getTimeRemaining().toFixed(1);
    },

    /**
     * Check if timer is running low (for future warning systems)
     * @returns {boolean} True if time is running low
     */
    isTimerLow() {
        return GameState.getTimeRemaining() < 15 && GameState.getTimeRemaining() > 0;
    },

    /**
     * Add time to current timer (for future power-ups)
     * @param {number} amount - Amount of time to add
     */
    addTime(amount) {
        const newTime = GameState.getTimeRemaining() + amount;
        GameState.setTimeRemaining(newTime);
    },

    /**
     * Get maximum daily time based on upgrades
     * @returns {number} Maximum time for the day
     */
    getMaxDailyTime() {
        const timeLevel = GameState.getUpgradeLevel('time');
        const routeLevel = GameState.getUpgradeLevel('route');
        return 60 + timeLevel * 10 + routeLevel * 5; // Clocktower: +10s/level, Stables: +5s/level
    },

    /**
     * Calculate time efficiency (for future analytics)
     * @returns {number} Percentage of time used (0-100)
     */
    getTimeEfficiency() {
        const maxTime = TimerSystem.getMaxDailyTime();
        const timeUsed = maxTime - GameState.getTimeRemaining();
        return (timeUsed / maxTime) * 100;
    }
};
