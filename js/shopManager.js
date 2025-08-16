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
        
        // Update shop assistance buttons visibility
        ShopManager._updateShopAssistance();
        
        // Update navigation button tooltips
        ShopManager._updateNavigationButtons();
        
        // CRITICAL: Highlight best deal ONCE per shop (never recalculate during shop visit)
        if (GameState.getUpgradeLevel('tipButton') > 0) {
            ShopManager._highlightBestDeal();
        }
    },

    /**
     * Update shop navigation button tooltips based on route upgrade
     * @private
     */
    _updateNavigationButtons() {
        const routeLevel = GameState.getUpgradeLevel('route');
        const nextCost = Math.max(3, 5 - routeLevel);
        const skipCost = Math.max(6, 10 - routeLevel * 2);
        
        document.querySelector('button[onclick="ShopManager.advanceShop(1)"]').innerHTML = 
            `▶ Next Shop (-${nextCost}s)`;
        document.querySelector('button[onclick="ShopManager.advanceShop(2)"]').innerHTML = 
            `⏩ Skip Shop (-${skipCost}s)`;
    },

    /**
     * Update shop assistance buttons based on upgrades
     * @private
     */
    _updateShopAssistance() {
        const instaBuyBtn = document.getElementById('insta-buy-btn');
        
        // Show/hide Insta-Buy button based on upgrades
        if (GameState.getUpgradeLevel('instaBuy') > 0) {
            instaBuyBtn.style.display = 'block';
            const discount = UpgradeManager.getInstaBuyDiscount(GameState.getUpgradeLevel('instaBuy'));
            instaBuyBtn.innerHTML = `⚡ Buy Entire Shop (-${discount}%)`;
        } else {
            instaBuyBtn.style.display = 'none';
        }
    },

    /**
     * Highlight the item with the LARGEST ABSOLUTE PROFIT - ONCE PER SHOP
     * @private
     */
    _highlightBestDeal() {
        console.log('Highlighting best deal for this shop...');
        
        // Clear any existing highlights first
        document.querySelectorAll('.best-deal-highlight').forEach(el => {
            el.classList.remove('best-deal-highlight');
        });

        const shopItems = GameState.getCurrentShop();
        console.log('Shop items:', shopItems.length);
        
        if (shopItems.length === 0) {
            console.log('No shop items found');
            return;
        }

        // Find ALL items (including ones that might be bought later)
        // This ensures consistency - the same item is always the best deal for this shop
        let bestItem = null;
        let bestProfit = -Infinity;

        shopItems.forEach((item, index) => {
            const profit = item.marketValue - item.shopPrice;
            console.log(`Item ${index}: ${item.template.name}, Profit: ${profit}`);
            
            if (profit > bestProfit) {
                bestProfit = profit;
                bestItem = item;
            }
        });

        console.log(`Best item determined: ${bestItem ? bestItem.template.name : 'none'}, Profit: ${bestProfit}`);

        // ALWAYS highlight the best item for this shop (and it stays highlighted)
        if (bestItem && bestItem.element) {
            console.log('Adding highlight class to best deal...');
            bestItem.element.classList.add('best-deal-highlight');
            console.log('Best deal highlight applied successfully');
        } else {
            console.log('ERROR: Best item or element not found');
        }
    },

    /**
     * Insta-Buy entire shop with level-based discount
     */
    instaBuyShop() {
        const instaBuyLevel = GameState.getUpgradeLevel('instaBuy');
        if (instaBuyLevel === 0) {
            UIManager.showNotification('Insta-Buy Assistant not available!', 'error');
            return;
        }

        const shopItems = GameState.getCurrentShop();
        const availableItems = shopItems.filter(item => {
            return item.element.style.opacity !== '0.5'; // Not already bought
        });

        if (availableItems.length === 0) {
            UIManager.showNotification('No items available to buy!', 'warning');
            return;
        }

        // Calculate total cost with discount
        const totalOriginalCost = availableItems.reduce((sum, item) => sum + item.shopPrice, 0);
        const discount = UpgradeManager.getInstaBuyDiscount(instaBuyLevel);
        const discountMultiplier = (100 - discount) / 100;
        const totalCost = Math.round(totalOriginalCost * discountMultiplier);

        if (GameState.getCash() < totalCost) {
            UIManager.showNotification(`Need $${totalCost} to buy entire shop! (${discount}% discount)`, 'error');
            return;
        }

        // Buy all items
        GameState.subtractCash(totalCost);
        let itemsBought = 0;

        availableItems.forEach(item => {
            // Create discounted item for inventory
            const discountedPrice = Math.round(item.shopPrice * discountMultiplier);
            const discountedItem = { ...item, shopPrice: discountedPrice };
            GameState.addToInventory(discountedItem);
            
            // Apply purchase effects (without profit popup)
            ShopManager._applyPurchaseEffectsQuiet(item);
            itemsBought++;
        });

        const savedAmount = totalOriginalCost - totalCost;
        UIManager.showNotification(
            `Bought entire shop! ${itemsBought} items for $${totalCost} (saved $${savedAmount})`, 
            'success'
        );
        UIManager.updateUI();

        // Auto-advance to next shop after a short delay
        setTimeout(() => {
            ShopManager.advanceShop(1);
        }, 1500);
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
            
            // Apply upgrade effects - only show overpriced if Jeweler Shop is available
            const loupeLevel = GameState.getUpgradeLevel('loupe');
            const overpriced = loupeLevel > 0 && profitInfo.isOverpriced ? 'overpriced' : '';
            
            col.innerHTML = ShopManager._generateItemHTML(item, i, overpriced, visuals);
            
            container.appendChild(col);
            // CRITICAL: Store DOM element reference
            item.element = col;
            console.log(`Created element for item ${i}: ${item.template.name}`);
        }
    },

    /**
     * Generate HTML for individual item - NOW WITH DIRT OVERLAY
     * @param {Object} item - Item to generate HTML for
     * @param {number} index - Item index
     * @param {string} overpriced - Overpriced CSS class
     * @param {Object} visuals - Visual properties including dirt
     * @returns {string} HTML string
     * @private
     */
    _generateItemHTML(item, index, overpriced, visuals) {
        const debugInfo = GameState.getDebugMode() ? 
            `<div class="small text-warning"><strong>Debug:</strong><br>Market: $${item.marketValue}<br>Profit: $${item.marketValue - item.shopPrice}<br>Size: ${item.sizeQuality.toFixed(2)}<br>Saturation: ${item.colorQuality.toFixed(2)}<br>Cleanliness: ${item.cleanliness.toFixed(2)}</div>` : 
            '';

        // Check if player has knowledge about this item (bought 10+)
        const hasKnowledge = GameState.hasItemKnowledge(item.template.name);
        const baseValueInfo = hasKnowledge ? 
            `<small class="text-info">Base: $${item.baseValue}</small><br>` : '';

        return `
            <div class="card item-card ${overpriced}" onclick="ShopManager.buyItem(${index})">
                <div class="card-body text-center">
                    <div class="item-display-area" style="
                        height: 90px; 
                        display: flex; 
                        align-items: center; 
                        justify-content: center;
                        position: relative;
                    ">
                        <span class="item-emoji ${visuals.dirtOpacity > 0 ? 'dirty' : ''}" 
                            data-emoji="${item.template.emoji}" 
                            style="
                            font-size: ${visuals.fontSize}rem;
                            filter: brightness(${visuals.brightness}) saturate(${visuals.saturation}%);
                            opacity: ${visuals.opacity};
                            transition: all 0.3s;
                            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                            display: inline-block;
                            transform: scale(1);
                            position: relative;
                            z-index: 1;
                            --dirt-opacity: ${visuals.dirtOpacity};
                        ">${item.template.emoji}</span>
                    </div>
                    <h6 class="card-title mt-2">${item.template.name}</h6>
                    ${baseValueInfo}
                    <p class="card-text text-success fw-bold">$${item.shopPrice}</p>
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
        
        // Apply visual effects (no profit popup)
        ShopManager._applyPurchaseEffects(item);
        
        // DO NOT re-highlight best deal! Best deal is determined once per shop and never changes
        
        // Check for victory condition
        if (item.isImmortalityPotion) {
            setTimeout(() => UIManager.showScreen('victory'), 1000);
            return;
        }
        
        UIManager.updateUI();
    },

    /**
     * Apply visual effects for purchase (no popup)
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
     * Apply visual effects for purchase without sound/animations (for bulk purchases)
     * @param {Object} item - Item that was purchased
     * @private
     */
    _applyPurchaseEffectsQuiet(item) {
        // Item bought animation (no cash animation for bulk)
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
        
        // Generate new shop (which will calculate new best deal)
        GameState.setCurrentShop([]);
        ShopManager.generateShop();
        UIManager.updateUI();
    }
};
