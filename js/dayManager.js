/**
 * DayManager - Handles day progression and end-of-day calculations
 * Manages daily reports, profit calculations, and day transitions
 */
const DayManager = {
    /**
     * End the current day and show report
     */
    endDay() {
        TimerSystem.stopTimer();
        
        // Process daily inventory and calculate profits
        DayManager._processInventory();
        
        // Show day end screen
        UIManager.showScreen('dayend');
    },

    /**
     * Process inventory and generate day-end report
     * @private
     */
    _processInventory() {
        const inventory = GameState.getDailyInventory();
        let totalProfit = 0;
        const summary = document.getElementById('trade-summary');
        summary.innerHTML = '';
        
        // Apply Loss Revert Magic if available
        DayManager._applyLossRevert(inventory);
        
        // Create animated row reveals
        inventory.forEach((item, index) => {
            DayManager._revealRow(item, index, totalProfit, summary);
        });
        
        // Add market values to cash
        const marketValueSum = inventory.reduce((sum, item) => sum + item.marketValue, 0);
        GameState.addCash(marketValueSum);
        
        // Update UI elements
        document.getElementById('end-day').textContent = GameState.getDay();
        document.getElementById('total-profit').textContent = '...'; // Will be updated by animation
        document.getElementById('new-balance').textContent = GameState.getCash();
        
        UpgradeManager.updateTownUI();
    },

    /**
     * Apply Loss Revert Magic upgrade
     * @param {Array} inventory - Daily inventory
     * @private
     */
    _applyLossRevert(inventory) {
        const lossRevertLevel = GameState.getUpgradeLevel('lossRevert');
        
        if (lossRevertLevel > 0 && inventory.length > 0) {
            const lossItems = inventory.filter(item => (item.marketValue - item.shopPrice) < 0);
            
            if (lossItems.length > 0) {
                // Find biggest loss item
                const biggestLoss = lossItems.reduce((prev, current) => 
                    ((prev.marketValue - prev.shopPrice) < (current.marketValue - current.shopPrice)) ? prev : current
                );
                
                // Convert loss to profit
                biggestLoss.lossReverted = true;
                biggestLoss.originalShopPrice = biggestLoss.shopPrice;
                biggestLoss.shopPrice = Math.round(biggestLoss.marketValue * 0.8); // 20% profit
            }
        }
    },

    /**
     * Create animated row reveal for trade report
     * @param {Object} item - Item to create row for
     * @param {number} index - Item index
     * @param {number} totalProfit - Running total profit
     * @param {Element} summary - Summary table element
     * @private
     */
    _revealRow(item, index, totalProfit, summary) {
        setTimeout(() => {
            const profit = item.marketValue - item.shopPrice;
            totalProfit += profit;
            
            const row = summary.insertRow();
            row.className = `report-row ${profit >= 0 ? 'profit' : 'loss'}`;
            
            const profitText = item.lossReverted ? 
                `<span class="text-warning">$${profit} (🔄 Reverted!)</span>` : 
                `$${profit}`;
            
            row.innerHTML = `
                <td><strong>${item.template.name}</strong></td>
                <td>$${item.originalShopPrice || item.shopPrice}</td>
                <td>$${item.baseValue}</td>
                <td>$${item.marketValue}</td>
                <td class="${profit >= 0 ? 'text-success' : 'text-danger'}">${profitText}</td>
            `;
            
            // Trigger animation
            setTimeout(() => row.classList.add('revealed'), 50);
            
            // Update totals after last row
            if (index === GameState.getDailyInventory().length - 1) {
                setTimeout(() => {
                    document.getElementById('total-profit').textContent = totalProfit;
                    document.getElementById('total-profit').classList.add('bounce');
                    setTimeout(() => document.getElementById('total-profit').classList.remove('bounce'), 800);
                }, 200);
            }
        }, index * 80); // 80ms delay between each row
    },

    /**
     * Start the next day
     */
    startNextDay() {
        const dailyCost = GameState.getDailyCost();
        
        if (GameState.getCash() < dailyCost) {
            GameManager.resetGame();
            return;
        }
        
        // Apply passive income from buildings
        const passiveIncome = GameState.getPassiveIncome();
        GameState.addCash(passiveIncome);
        
        // Deduct daily cost
        GameState.subtractCash(dailyCost);
        
        // Advance day and reset daily values
        GameState.incrementDay();
        GameState.setTier(1);
        GameState.setDailyInventory([]);
        GameState.resetSkipCount();
        GameState.setCurrentShop([]);
        
        // Start new day
        UIManager.showScreen('shop');
        ShopManager.generateShop();
        TimerSystem.startTimer();
        UIManager.updateUI();
    },

    /**
     * Calculate daily statistics (for future analytics)
     * @returns {Object} Daily statistics
     */
    getDayStats() {
        const inventory = GameState.getDailyInventory();
        const totalSpent = inventory.reduce((sum, item) => sum + item.shopPrice, 0);
        const totalEarned = inventory.reduce((sum, item) => sum + item.marketValue, 0);
        const totalProfit = totalEarned - totalSpent;
        const itemsPurchased = inventory.length;
        
        return {
            totalSpent,
            totalEarned,
            totalProfit,
            itemsPurchased,
            avgProfitPerItem: itemsPurchased > 0 ? totalProfit / itemsPurchased : 0
        };
    },

    /**
     * Check if day end conditions are met
     * @returns {boolean} True if day should end
     */
    shouldEndDay() {
        return GameState.getTimeRemaining() <= 0;
    }
};
