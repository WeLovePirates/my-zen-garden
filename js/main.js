// js/main.js
import { game, LOCAL_STORAGE_KEY } from './game/gameState.js';
import { loadGame, gameLoop } from './game/game.js';
import { updateMoneyDisplay, createPlotUI, updateInventoryDisplay, updateHarvestedItemsDisplay, updateToolsDisplay, showMessage } from './ui/uiUpdates.js';
import { attachEventListeners } from './ui/eventListeners.js';

// --- Game Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    loadGame();
    initGame();
});

function initGame() {
    // Initialize tools here if not already present from save
    // Shovel is now a permanent item without a quantity
    if (!game.tools.shovel) {
        game.tools.shovel = { name: "Shovel", imagePath: "sprites/shovel.png" };
    }
    updateMoneyDisplay();
    createPlotUI();
    updateInventoryDisplay();
    updateHarvestedItemsDisplay(); // Call to update harvested items
    updateToolsDisplay(); // NEW: Call to update tools display
    attachEventListeners();
    gameLoop();
    showMessage("Welcome to My Zen Garden! Buy some seeds to get started.", 'info');
}