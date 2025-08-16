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
        // Debug hotkey
        document.addEventListener('keydown', (event) => {
            if (event.key.toLowerCase() === 'd') {
                const debugMode = !GameState.getDebugMode();
                GameState.setDebugMode(debugMode);
                
                // Refresh shop to show/hide debug info
                if (GameState.getCurrentShop().length > 0) {
                    ShopManager.generateShop();
                }
            }
        });
    },

    /**
     * Show notification (for future expansion)
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, info)
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Position notification
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '9999';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '5px';
        notification.style.color = 'white';
        
        // Set background color based on type
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8',
            warning: '#ffc107'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
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
    }
};
