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
        
        // Update item knowledge counters
        DayManager._updateItemKnowledge(inventory);
        
        // Apply Loss Revert Magic if available
        DayManager._applyLossRevert(inventory);
        
        // Create animated row reveals and calculate total profit correctly
        inventory.forEach((item, index) => {
            const profit = item.marketValue - item.shopPrice;
            totalProfit += profit; // Accumulate profit correctly
            DayManager._revealRow(item, index, summary, profit);
        });
        
        // Add market values to cash
        const marketValueSum = inventory.reduce((sum, item) => sum + item.marketValue, 0);
        GameState.addCash(marketValueSum);
        
        // Update UI elements with correct total profit
        document.getElementById('end-day').textContent = GameState.getDay();
        document.getElementById('new-balance').textContent = GameState.getCash();
        
        // Set total profit after all calculations are done
        setTimeout(() => {
            const totalProfitElement = document.getElementById('total-profit');
            const totalProfitContainer = totalProfitElement.parentElement;
            
            if (totalProfit >= 0) {
                totalProfitContainer.innerHTML = `Total Daily Profit: $<span id="total-profit">${totalProfit}</span>`;
            } else {
                totalProfitContainer.innerHTML = `Total Daily Profit: -$<span id="total-profit">${Math.abs(totalProfit)}</span>`;
            }
            
            document.getElementById('total-profit').classList.add('bounce');
            setTimeout(() => document.getElementById('total-profit').classList.remove('bounce'), 800);
            
            // Add previous day income row
            DayManager._addIncomeRow(summary);
            
            // Show item knowledge notifications
            DayManager._showKnowledgeNotifications();
        }, inventory.length * 80 + 400);
        
        UpgradeManager.updateTownUI();
    },

    /**
     * Update item knowledge tracking
     * @param {Array} inventory - Daily inventory
     * @private
     */
    _updateItemKnowledge(inventory) {
        if (!GameState.state.itemKnowledge) {
            GameState.state.itemKnowledge = {};
        }
        if (!GameState.state.newKnowledgeGained) {
            GameState.state.newKnowledgeGained = [];
        }
        
        inventory.forEach(item => {
            const itemName = item.template.name;
            if (!GameState.state.itemKnowledge[itemName]) {
                GameState.state.itemKnowledge[itemName] = {
                    count: 0,
                    baseValue: item.baseValue,
                    emoji: item.template.emoji
                };
            }
            
            GameState.state.itemKnowledge[itemName].count++;
            
            // Check if reached 10+ milestone
            if (GameState.state.itemKnowledge[itemName].count === 10) {
                GameState.state.newKnowledgeGained.push(itemName);
            }
        });
    },

    /**
     * Show notifications for new item knowledge gained
     * @private
     */
    _showKnowledgeNotifications() {
        if (GameState.state.newKnowledgeGained && GameState.state.newKnowledgeGained.length > 0) {
            GameState.state.newKnowledgeGained.forEach(itemName => {
                const knowledge = GameState.state.itemKnowledge[itemName];
                UIManager.showNotification(
                    `${knowledge.emoji} ${itemName} Knowledge Gained! Base value now shown in shops.`, 
                    'info'
                );
            });
            // Clear the notifications
            GameState.state.newKnowledgeGained = [];
        }
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
                
                // Convert loss to profit properly
                biggestLoss.lossReverted = true;
                biggestLoss.originalShopPrice = biggestLoss.shopPrice;
                
                // Calculate what the original loss was
                const originalLoss = biggestLoss.marketValue - biggestLoss.shopPrice; // This is negative
                
                // Set new shop price to create the same amount as profit (flip the sign)
                biggestLoss.shopPrice = biggestLoss.marketValue + originalLoss; // marketValue - |originalLoss|
            }
        }
    },

    /**
     * Create animated row reveal for trade report - NOW WITH DIRT EFFECT
     * @param {Object} item - Item to create row for
     * @param {number} index - Item index
     * @param {Element} summary - Summary table element
     * @param {number} profit - Pre-calculated profit for this item
     * @private
     */
    _revealRow(item, index, summary, profit) {
        setTimeout(() => {
            const row = summary.insertRow();
            row.className = `report-row ${profit >= 0 ? 'profit' : 'loss'}`;
            
            const profitFormatted = profit >= 0 ? `+$${profit}` : `-$${Math.abs(profit)}`;
            const profitText = item.lossReverted ? 
                `<span class="text-warning">${profitFormatted} (🔄 Reverted!)</span>` : 
                `${profitFormatted}`;

            // Generate item emoji with same visual conditions as in shop - INCLUDING DIRT
            const visuals = ItemSystem.calculateItemVisuals(item);
            const itemEmoji = `
                <div style="
                    display: inline-block;
                    margin-right: 8px;
                    vertical-align: middle;
                ">
                    <span class="item-emoji ${visuals.dirtOpacity > 0 ? 'dirty' : ''}" 
                        data-emoji="${item.template.emoji}"
                        style="
                        font-size: 1.2rem;
                        filter: brightness(${visuals.brightness}) saturate(${visuals.saturation}%);
                        opacity: ${visuals.opacity};
                        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
                        --dirt-opacity: ${visuals.dirtOpacity};
                    ">${item.template.emoji}</span>
                </div>
            `;
            
            row.innerHTML = `
                <td>${itemEmoji}<strong>${item.template.name}</strong></td>
                <td>$${item.originalShopPrice || item.shopPrice}</td>
                <td>$${item.baseValue}</td>
                <td>$${item.marketValue}</td>
                <td class="${profit >= 0 ? 'text-success' : 'text-danger'}">${profitText}</td>
            `;
            
            // Trigger animation
            setTimeout(() => row.classList.add('revealed'), 50);
            
        }, index * 80); // 80ms delay between each row
    },

    /**
     * Add previous day income row to summary
     * @param {Element} summary - Summary table element
     * @private
     */
    _addIncomeRow(summary) {
        if (GameState.getDay() > 1) {
            const passiveIncome = GameState.getPassiveIncome();
            if (passiveIncome > 0) {
                setTimeout(() => {
                    const incomeRow = summary.insertRow();
                    incomeRow.className = 'report-row income-row';
                    incomeRow.style.borderTop = '2px solid #28a745';
                    incomeRow.style.background = 'linear-gradient(90deg, rgba(40,167,69,0.15) 0%, rgba(40,167,69,0.08) 100%)';
                    
                    incomeRow.innerHTML = `
                        <td><strong>💰 Daily Income</strong></td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td class="text-success">+$${passiveIncome}</td>
                    `;
                    
                    // Trigger animation
                    setTimeout(() => incomeRow.classList.add('revealed'), 50);
                }, 100);
            }
        }
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
