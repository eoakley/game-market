/**
 * ItemSystem - Handles item templates, generation, and management
 * Ready for expansion with new item types and progression features
 */
const ItemSystem = {
    // Item Templates - organized by tier availability with beautiful emojis
    templates: [
        // Low tier items (always available)
        { name: 'Diamond Shard', emoji: '💎', basePrice: 100, color: '#3b82f6', minTier: 1 },
        { name: 'Gold Coin', emoji: '🪙', basePrice: 150, color: '#f59e0b', minTier: 1 },
        { name: 'Silver Ring', emoji: '💍', basePrice: 120, color: '#6b7280', minTier: 1 },
        
        // Mid tier items
        { name: 'Ruby Crown', emoji: '👑', basePrice: 300, color: '#dc2626', minTier: 3 },
        { name: 'Ancient Vase', emoji: '🏺', basePrice: 250, color: '#92400e', minTier: 3 },
        { name: 'Crystal Ball', emoji: '🔮', basePrice: 400, color: '#7c3aed', minTier: 4 },
        { name: 'Magic Potion', emoji: '⚗️', basePrice: 350, color: '#059669', minTier: 4 },
        
        // High tier items
        { name: 'Mystical Beads', emoji: '📿', basePrice: 500, color: '#be185d', minTier: 6 },
        { name: 'Protective Amulet', emoji: '🧿', basePrice: 550, color: '#1e40af', minTier: 6 },
        { name: 'Golden Key', emoji: '🗝️', basePrice: 650, color: '#d97706', minTier: 8 },
        { name: 'Sacred Scroll', emoji: '📜', basePrice: 700, color: '#78350f', minTier: 8 },
        
        // Ultra rare items (very high tier)
        { name: 'Dragon Egg', emoji: '🥚', basePrice: 1000, color: '#991b1b', minTier: 10 },
        { name: 'Phoenix Feather', emoji: '🪶', basePrice: 1200, color: '#c2410c', minTier: 12 }
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
            template: { name: 'Potion of Immortality', emoji: '🧪', color: '#ff0080' },
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
        const brightness = Math.max(0.7, Math.min(1.3, 0.7 + (item.colorQuality * 0.6))); // Brighter range for emojis
        const opacity = Math.max(0.8, Math.min(1.0, 0.8 + (item.purityQuality * 0.2))); // Less opacity variation for emojis
        const saturation = Math.max(80, Math.min(120, 80 + (item.colorQuality * 40))); // More saturated for emojis
        
        // Calculate actual font size based on quality (2rem to 5rem for better emoji visibility)
        const fontSize = 2 + (item.sizeQuality * 3); // 2rem to 5rem
        
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
