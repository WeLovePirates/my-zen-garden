// js/main.js
import { game, LOCAL_STORAGE_KEY } from './game/gameState.js';
import { loadGame, gameLoop, startGameLoop } from './game/game.js';
import { updateMoneyDisplay, createPlotUI, updateInventoryDisplay, updateHarvestedItemsDisplay, updateToolsDisplay, showMessage } from './ui/uiUpdates.js';
import { attachEventListeners } from './ui/eventListeners.js';
import { initializeShops } from './ui/shopUI.js'; // This import remains correct

// --- Game Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    loadGame();
    initGame();
});

function initGame() {
    // Initialize tools here if not already present from save
    if (!game.tools.shovel) {
        game.tools.shovel = { name: "Shovel", imagePath: "sprites/shovel.png" };
    }
    updateMoneyDisplay();
    createPlotUI();
    updateInventoryDisplay();
    updateHarvestedItemsDisplay();
    updateToolsDisplay();
    initializeShops(); // This function call remains correct
    attachEventListeners();
    // Start the game loop explicitly
    startGameLoop();
    showMessage("Welcome to My Zen Garden! Buy some seeds to get started.", 'info');
}