/**
 * ShopManager - Handles shop generation, item buying, and navigation
 * Centralized shop logic ready for expansion with new features
 */
const ShopManager = {
    /**
     * Generate a new shop with random items
     */
    generateShop() {
        const container = document.getElementById('items-container');
        container.innerHTML = '';
        
        // Check for legendary shop (4 skips in a row)
        const isLegendary = GameState.getSkipCount() >= 4 && 
                           Math.random() < 0.1 && 
                           GameState.getCash() >= 1000000;
        
        let shopItems = [];
        
        for (let i = 0; i < 5; i++) {
            let item;
            if (isLegendary && i === 0) {
                // Potion of Immortality
                item = ItemSystem.createImmortalityPotion();
            } else {
                // Get weighted items for current tier
                const weightedItems = ItemSystem.getWeightedItems(GameState.getTier());
                const template = weightedItems[Math.floor(Math.random() * weightedItems.length)];
                item = ItemSystem.generateItem(template);
            }
            shopItems.push(item);
        }
        
        // Ensure at least one unprofitable item (unless legendary shop)
        if (!isLegendary) {
            ShopManager._ensureUnprofitableItem(shopItems);
        }
        
        // Generate shop UI
        ShopManager._generateShopUI(shopItems);
        
        // Store current shop and update UI
        GameState.setCurrentShop(shopItems);
        document.getElementById('tier').textContent = GameState.getTier();
    },

    /**
     * Ensure at least one unprofitable item exists in shop
     * @param {Array} shopItems - Array of shop items
     * @private
     */
    _ensureUnprofitableItem(shopItems) {
        const hasLoss = shopItems.some(item => item.marketValue < item.shopPrice);
        if (!hasLoss) {
            // Make the first item unprofitable by increasing its shop price
            const firstItem = shopItems[0];
            firstItem.shopPrice = Math.round(firstItem.marketValue * 1.2); // 20% loss guaranteed
        }
    },

    /**
     * Generate the visual shop UI
     * @param {Array} shopItems - Array of items to display
     * @private
     */
    _generateShopUI(shopItems) {
        const container = document.getElementById('items-container');
        
        for (let i = 0; i < 5; i++) {
            const item = shopItems[i];
            const col = document.createElement('div');
            col.className = 'col';
            
            const profitInfo = ItemSystem.calculateProfit(item);
            const visuals = ItemSystem.calculateItemVisuals(item);
            
            // Apply upgrade effects
            const loupeLevel = GameState.getUpgradeLevel('loupe');
            const overpriced = loupeLevel > 0 && profitInfo.isOverpriced ? 'overpriced' : '';
            const profitable = profitInfo.isProfitable ? 'profitable' : '';
            
            col.innerHTML = ShopManager._generateItemHTML(item, i, overpriced, profitable, visuals);
            
            container.appendChild(col);
            item.element = col;
        }
    },

    /**
     * Generate HTML for individual item
     * @param {Object} item - Item to generate HTML for
     * @param {number} index - Item index
     * @param {string} overpriced - Overpriced CSS class
     * @param {string} profitable - Profitable CSS class
     * @param {Object} visuals - Visual properties
     * @returns {string} HTML string
     * @private
     */
    _generateItemHTML(item, index, overpriced, profitable, visuals) {
        const debugInfo = GameState.getDebugMode() ? 
            `<div class="small text-warning"><strong>Debug:</strong><br>Market: $${item.marketValue}<br>Profit: $${item.marketValue - item.shopPrice}</div>` : 
            '';

        return `
            <div class="card item-card ${overpriced} ${profitable}" onclick="ShopManager.buyItem(${index})">
                <div class="card-body text-center">
                    <div style="height: 80px; display: flex; align-items: center; justify-content: center;">
                        <i class="${item.template.icon}" style="
                            color: ${item.template.color};
                            filter: saturate(${visuals.saturation}%) brightness(${visuals.brightness});
                            font-size: ${visuals.fontSize}rem;
                            opacity: ${visuals.opacity};
                            transition: all 0.3s;
                        "></i>
                    </div>
                    <h6 class="card-title mt-2">${item.template.name}</h6>
                    <p class="card-text text-success">$${item.shopPrice}</p>
                    ${debugInfo}
                </div>
            </div>
        `;
    },

    /**
     * Handle item purchase
     * @param {number} index - Index of item to buy
     */
    buyItem(index) {
        const item = GameState.getCurrentShop()[index];
        
        if (GameState.getCash() >= item.shopPrice) {
            ShopManager._processPurchase(item, index);
        } else {
            ShopManager._handleInsufficientFunds();
        }
    },

    /**
     * Process successful item purchase
     * @param {Object} item - Item being purchased
     * @param {number} index - Item index
     * @private
     */
    _processPurchase(item, index) {
        // Deduct cash and add to inventory
        GameState.subtractCash(item.shopPrice);
        GameState.addToInventory(item);
        
        // Show profit/loss popup
        ShopManager._showProfitPopup(item);
        
        // Apply visual effects
        ShopManager._applyPurchaseEffects(item);
        
        // Check for victory condition
        if (item.isImmortalityPotion) {
            setTimeout(() => UIManager.showScreen('victory'), 1000);
            return;
        }
        
        UIManager.updateUI();
    },

    /**
     * Show profit/loss popup animation
     * @param {Object} item - Item that was purchased
     * @private
     */
    _showProfitPopup(item) {
        const profit = item.marketValue - item.shopPrice;
        const popup = document.createElement('div');
        popup.className = profit >= 0 ? 'profit-popup' : 'loss-popup';
        popup.textContent = profit >= 0 ? `+$${profit}` : `$${profit}`;
        item.element.style.position = 'relative';
        item.element.appendChild(popup);
        
        // Remove popup after animation
        setTimeout(() => popup.remove(), 1000);
    },

    /**
     * Apply visual effects for purchase
     * @param {Object} item - Item that was purchased
     * @private
     */
    _applyPurchaseEffects(item) {
        // Cash decrease animation
        const cashElement = document.querySelector('.cash');
        cashElement.classList.add('decrease');
        setTimeout(() => cashElement.classList.remove('decrease'), 500);
        
        // Item bought animation
        item.element.classList.add('bought');
        item.element.style.opacity = '0.5';
        item.element.onclick = null;
    },

    /**
     * Handle insufficient funds
     * @private
     */
    _handleInsufficientFunds() {
        const cashElement = document.querySelector('.cash');
        cashElement.classList.add('shake');
        setTimeout(() => cashElement.classList.remove('shake'), 500);
    },

    /**
     * Advance to next shop or skip shops
     * @param {number} type - 1 for next shop, 2 for skip shop
     */
    advanceShop(type) {
        const routeLevel = GameState.getUpgradeLevel('route');
        const cost = type === 1 ? 
            Math.max(3, 5 - routeLevel) : 
            Math.max(6, 10 - routeLevel * 2);
        
        if (GameState.getTimeRemaining() <= cost) {
            DayManager.endDay();
            return;
        }
        
        // Apply time cost and tier advancement
        GameState.decreaseTimeRemaining(cost);
        GameState.incrementTier(type);
        
        // Update skip count
        if (type === 2) {
            GameState.incrementSkipCount();
        } else {
            GameState.resetSkipCount();
        }
        
        // Generate new shop
        GameState.setCurrentShop([]);
        ShopManager.generateShop();
        UIManager.updateUI();
    }
};
