/**
 * ItemSystem - Handles item templates, generation, and management
 * Ready for expansion with new item types and progression features
 */
const ItemSystem = {
    // Item Templates - organized by tier availability
    templates: [
        // Low tier items (always available)
        { name: 'Sapphire', icon: 'bi-circle-fill', basePrice: 100, color: '#0d6efd', minTier: 1 },
        { name: 'Gold Coin', icon: 'bi-coin', basePrice: 200, color: '#ffc107', minTier: 1 },
        
        // Mid tier items
        { name: 'Magic Potion', icon: 'bi-heart-pulse', basePrice: 300, color: '#6f42c1', minTier: 3 },
        { name: 'Crystal', icon: 'bi-diamond', basePrice: 400, color: '#20c997', minTier: 4 },
        
        // High tier items
        { name: 'Ruby', icon: 'bi-gem', basePrice: 500, color: '#dc3545', minTier: 6 },
        { name: 'Treasure Box', icon: 'bi-box-seam', basePrice: 650, color: '#fd7e14', minTier: 8 }
    ],

    /**
     * Generate a random item based on template
     * @param {Object} template - Item template to base generation on
     * @returns {Object} Generated item with randomized properties
     */
    generateItem(template) {
        // Each attribute varies ±20% of base value
        const colorQuality = Math.random(); // 0 = dull, 1 = vibrant
        const sizeQuality = Math.random();  // 0 = small, 1 = large  
        const purityQuality = Math.random(); // 0 = blemished, 1 = pure
        
        // Base value is always fixed from template
        const baseValue = template.basePrice;
        
        // Each modifier can change value by ±20%
        const colorMod = 0.8 + (colorQuality * 0.4); // 0.8 to 1.2
        const sizeMod = 0.8 + (sizeQuality * 0.4);   // 0.8 to 1.2
        const purityMod = 0.8 + (purityQuality * 0.4); // 0.8 to 1.2
        
        // No tier multiplier - tier only affects availability!
        const marketValue = Math.round(baseValue * colorMod * sizeMod * purityMod);
        const shopPrice = Math.round(marketValue * (0.90 + (Math.random() - 0.5) * 0.3)); // Easier: 90% avg instead of 95%
        
        return {
            template,
            colorQuality,
            sizeQuality, 
            purityQuality,
            baseValue: baseValue, // Fixed base value
            marketValue,
            shopPrice: Math.max(1, shopPrice)
        };
    },

    /**
     * Get available items for current tier
     * @param {number} tier - Current game tier
     * @returns {Array} Available item templates
     */
    getAvailableItems(tier) {
        return ItemSystem.templates.filter(template => template.minTier <= tier);
    },

    /**
     * Get weighted item list (lower tier items more common)
     * @param {number} tier - Current game tier
     * @returns {Array} Weighted array of item templates
     */
    getWeightedItems(tier) {
        const availableItems = ItemSystem.getAvailableItems(tier);
        const weightedItems = [];
        
        availableItems.forEach(template => {
            const weight = Math.max(1, 10 - (template.minTier - 1) * 2); // Higher tier = lower weight
            for(let w = 0; w < weight; w++) {
                weightedItems.push(template);
            }
        });
        
        return weightedItems;
    },

    /**
     * Create the legendary Potion of Immortality
     * @returns {Object} Immortality potion item
     */
    createImmortalityPotion() {
        return {
            template: { name: 'Potion of Immortality', icon: 'bi-magic', color: '#ff0080' },
            baseValue: 10000000,
            marketValue: 10000000,
            shopPrice: 1000000,
            isImmortalityPotion: true,
            colorQuality: 1,
            sizeQuality: 1,
            purityQuality: 1
        };
    },

    /**
     * Calculate visual properties for item display
     * @param {Object} item - Item to calculate visuals for
     * @returns {Object} Visual properties object
     */
    calculateItemVisuals(item) {
        // Calculate visual style based on quality - with safety checks
        const brightness = Math.max(0.5, Math.min(1.0, 0.5 + (item.colorQuality * 0.5)));
        const opacity = Math.max(0.6, Math.min(1.0, 0.6 + (item.purityQuality * 0.4)));
        const saturation = Math.max(0, Math.min(100, item.colorQuality * 100));
        
        // Calculate actual font size based on quality (1.5rem to 4.5rem)
        const fontSize = 1.5 + (item.sizeQuality * 3); // 1.5rem to 4.5rem
        
        return {
            brightness,
            opacity,
            saturation,
            fontSize
        };
    },

    /**
     * Calculate profit information for an item
     * @param {Object} item - Item to calculate profit for
     * @returns {Object} Profit information
     */
    calculateProfit(item) {
        const profit = item.marketValue - item.shopPrice;
        const profitPercent = profit / item.marketValue;
        
        return {
            profit,
            profitPercent,
            isProfitable: profit > 0,
            isOverpriced: profitPercent < -0.05 // 5% loss threshold
        };
    },

    /**
     * Add new item template (for future expansion)
     * @param {Object} template - New item template to add
     */
    addItemTemplate(template) {
        ItemSystem.templates.push(template);
    },

    /**
     * Get item template by name
     * @param {string} name - Name of the item template
     * @returns {Object|null} Item template or null if not found
     */
    getItemTemplate(name) {
        return ItemSystem.templates.find(template => template.name === name) || null;
    }
};
