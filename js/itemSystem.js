/**
 * ItemSystem - Handles item templates, generation, and management
 * Ready for expansion with new item types and progression features
 */
const ItemSystem = {
    /**
     * Generate random number using Box-Muller Gaussian/normal distribution
     * @param {number} mean - Mean value
     * @param {number} stdDev - Standard deviation
     * @returns {number} Random number from normal distribution
     */
    gaussianRandom(mean, stdDev) {
        let u = 0, v = 0;
        while(u === 0) u = Math.random(); // Converting [0,1) to (0,1)
        while(v === 0) v = Math.random();
        const z0 = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return z0 * stdDev + mean;
    },

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
     * Generate a random item based on template with NEW PRICING SYSTEM
     * @param {Object} template - Item template to base generation on
     * @returns {Object} Generated item with randomized properties
     */
    generateItem(template) {
        // Generate three quality parameters (0 to 1 range)
        const colorQuality = Math.random();    // 0 = dull, 1 = vibrant (saturation)
        const sizeQuality = Math.random();     // 0 = small, 1 = large
        const cleanliness = Math.random();     // 0 = very dirty/worn, 1 = pristine/clean
        
        // Base value is always fixed from template
        const baseValue = template.basePrice;
        
        // NEW PRICING SYSTEM:
        // 1. Generate market price using Gaussian distribution
        const currentTier = GameState.getTier();
        const priceToBaseMean = 0.9 + (currentTier * 0.02); // 90% + tier * 2%
        const priceStdDev = 0.15; // Standard deviation for variety
        const marketPriceMultiplier = Math.max(0.3, ItemSystem.gaussianRandom(priceToBaseMean, priceStdDev));
        const marketValue = Math.round(baseValue * marketPriceMultiplier);
        
        // 2. Calculate shop price based on three quality parameters
        // Each parameter contributes ±20%, total ±60% from market value
        // 0.5, 0.5, 0.5 = exactly market price (no change)
        // 1, 1, 1 = +60% market price, 0, 0, 0 = -60% market price
        const colorEffect = (colorQuality - 0.5) * 0.4;    // ±20%
        const sizeEffect = (sizeQuality - 0.5) * 0.4;      // ±20%  
        const cleanEffect = (cleanliness - 0.5) * 0.4;     // ±20%
        
        const totalQualityEffect = colorEffect + sizeEffect + cleanEffect; // ±60% total
        const shopPrice = Math.round(marketValue * (1 + totalQualityEffect));
        
        return {
            template,
            colorQuality,
            sizeQuality, 
            purityQuality: (colorQuality + sizeQuality + cleanliness) / 3, // Average for visual compatibility
            cleanliness,
            baseValue: baseValue,
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
            purityQuality: 1,
            cleanliness: 1 // Immortality potion is always pristine
        };
    },

    /**
     * Calculate visual properties for item display - NOW WITH DIRT EFFECT
     * @param {Object} item - Item to calculate visuals for
     * @returns {Object} Visual properties object
     */
    calculateItemVisuals(item) {
        // Calculate visual style based on quality - with safety checks
        const brightness = Math.max(0.7, Math.min(1.3, 0.7 + (item.colorQuality * 0.6))); // Brighter range for emojis
        const opacity = Math.max(0.8, Math.min(1.0, 0.8 + (item.purityQuality * 0.2))); // Less opacity variation for emojis
        
        // FIXED: Saturation from 0% (completely gray) to 120% (very saturated)
        const saturation = item.colorQuality * 120; // 0 to 120%
        
        // Calculate actual font size based on quality (2rem to 5rem for better emoji visibility)
        const fontSize = 2 + (item.sizeQuality * 3); // 2rem to 5rem

        // FIXED: Non-linear dirt calculation
        let dirtOpacity = 0;
        if (item.cleanliness >= 0.5) {
            // Clean items (0.5-1.0): very low dirt opacity (0-15%)
            dirtOpacity = (1 - item.cleanliness) * 0.3; // 0% to 15%
        } else if (item.cleanliness >= 0.35) {
            // Somewhat dirty (0.35-0.5): moderate dirt (15-25%)
            dirtOpacity = 0.15 + ((0.5 - item.cleanliness) / 0.15) * 0.1; // 15% to 25%
        } else {
            // Very dirty (0-0.35): high dirt (25-60%)
            dirtOpacity = 0.25 + ((0.35 - item.cleanliness) / 0.35) * 0.35; // 25% to 60%
        }
        
        return {
            brightness,
            opacity,
            saturation,
            fontSize,
            dirtOpacity
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
