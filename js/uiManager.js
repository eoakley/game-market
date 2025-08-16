/**
 * UIManager - Handles all UI updates and screen management
 * Centralized UI control for clean separation of concerns
 */
const UIManager = {
    /**
     * Show a specific screen and hide others
     * @param {string} screenId - ID of screen to show
     */
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    },

    /**
     * Update all UI elements with current game state
     */
    updateUI() {
        UIManager.updateCashDisplay();
        UIManager.updateDayDisplay();
        UIManager.updateBalanceDisplay();
        TimerSystem.updateTimerDisplay();
    },

    /**
     * Update cash display
     */
    updateCashDisplay() {
        document.getElementById('cash').textContent = GameState.getCash();
    },

    /**
     * Update day display
     */
    updateDayDisplay() {
        document.getElementById('day').textContent = GameState.getDay();
    },

    /**
     * Update balance display (used in day end screen)
     */
    updateBalanceDisplay() {
        document.getElementById('new-balance').textContent = GameState.getCash();
    },

    /**
     * Show cash increase animation
     */
    showCashIncrease() {
        const cashElement = document.querySelector('.cash');
        cashElement.classList.add('increase');
        setTimeout(() => cashElement.classList.remove('increase'), 500);
    },

    /**
     * Show cash decrease animation
     */
    showCashDecrease() {
        const cashElement = document.querySelector('.cash');
        cashElement.classList.add('decrease');
        setTimeout(() => cashElement.classList.remove('decrease'), 500);
    },

    /**
     * Show insufficient funds animation
     */
    showInsufficientFunds() {
        const cashElement = document.querySelector('.cash');
        cashElement.classList.add('shake');
        setTimeout(() => cashElement.classList.remove('shake'), 500);
    },

    /**
     * Initialize UI on game start
     */
    initializeUI() {
        UIManager.updateUI();
        UIManager.attachEventListeners();
    },

    /**
     * Attach event listeners for UI interactions
     */
    attachEventListeners() {
        // Debug hotkeys
        document.addEventListener('keydown', (event) => {
            if (event.key.toLowerCase() === 'd') {
                const debugMode = !GameState.getDebugMode();
                GameState.setDebugMode(debugMode);
                
                // Refresh shop to show/hide debug info
                if (GameState.getCurrentShop().length > 0) {
                    ShopManager.generateShop();
                }
                
                UIManager.showNotification(`Debug mode ${debugMode ? 'ON' : 'OFF'}`, 'info');
            }
            
            if (event.key.toLowerCase() === 'g') {
                GameState.addCash(1000);
                UIManager.showCashIncrease();
                UIManager.updateUI();
                UIManager.showNotification('Added $1000 for testing!', 'success');
            }
            
            // Debug hotkey for testing best deal highlighting
            if (event.key.toLowerCase() === 'h') {
                if (GameState.getCurrentShop().length > 0) {
                    ShopManager._highlightBestDeal();
                    UIManager.showNotification('Manually triggered best deal highlighting!', 'info');
                } else {
                    UIManager.showNotification('No shop available to highlight!', 'warning');
                }
            }
        });
    },

    /**
     * Show notification with enhanced styling and auto-hide
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, info, warning)
     */
    showNotification(message, type = 'info') {
        // Remove any existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    /**
     * Create loading spinner (for future async operations)
     * @returns {Element} Loading spinner element
     */
    createLoadingSpinner() {
        const spinner = document.createElement('div');
        spinner.className = 'spinner-border';
        spinner.innerHTML = '<span class="visually-hidden">Loading...</span>';
        return spinner;
    },

    /**
     * Show modal dialog (for future confirmations/dialogs)
     * @param {string} title - Modal title
     * @param {string} content - Modal content
     * @param {Function} onConfirm - Callback for confirm button
     */
    showModal(title, content, onConfirm = null) {
        // This could be expanded to show Bootstrap modals
        // For now, using simple confirm dialog
        const result = confirm(`${title}\n\n${content}`);
        if (result && onConfirm) {
            onConfirm();
        }
    },

    /**
     * Update progress bar (for future progression systems)
     * @param {string} elementId - Progress bar element ID
     * @param {number} percentage - Progress percentage (0-100)
     */
    updateProgressBar(elementId, percentage) {
        const progressBar = document.getElementById(elementId);
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
            progressBar.setAttribute('aria-valuenow', percentage);
        }
    },

    /**
     * Show welcome message for new upgrades
     * @param {string} upgradeName - Name of the upgrade
     */
    showUpgradeWelcome(upgradeName) {
        const messages = {
            'Insta-Buy Assistant': 'You can now buy entire shops with increasing discounts per level!',
            'Deal Finder': 'Best deals are now automatically highlighted in every shop!'
        };
        
        const message = messages[upgradeName] || `${upgradeName} is now available!`;
        UIManager.showNotification(message, 'success');
    },

    /**
     * Highlight element temporarily
     * @param {Element} element - Element to highlight
     * @param {number} duration - Duration in milliseconds
     */
    highlightElement(element, duration = 2000) {
        element.style.boxShadow = '0 0 20px rgba(255, 193, 7, 0.8)';
        element.style.transform = 'scale(1.05)';
        
        setTimeout(() => {
            element.style.boxShadow = '';
            element.style.transform = '';
        }, duration);
    }
};
