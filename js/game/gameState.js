// js/game/gameState.js
import { seedShopData } from '../data/seedData.js'; // Import seedShopData

export const LOCAL_STORAGE_KEY = 'myZenGardenSave'; // Define this once

export const game = {
    money: 100,
    plot: Array(3).fill(null).map(() => Array(3).fill(null)), // 3x3 array for plot
    seedShop: seedShopData, // Reference to data from seedData.js
    selectedSeedType: null,
    inventory: {}, // Inventory for seeds
    harvestedItems: [], // Inventory for harvested crops
    tools: {
        shovel: { name: "Shovel", imagePath: "sprites/shovel.png" } // Shovel is a permanent tool
    }
};

// Initialize inventory with all seeds from seedShopData set to 0
for (const seedType in game.seedShop) {
    game.inventory[seedType] = 0;
}

// Export UI Elements that are directly part of the game state or universally used
export const moneyDisplay = document.getElementById('current-money');
export const messageArea = document.getElementById('message-area');
export const plotGrid = document.getElementById('plot-grid');
export const buySeedButtons = document.querySelectorAll('.buy-seed-btn');
export const collectAllBtn = document.getElementById('collect-all-btn');
export const inventoryDisplay = document.getElementById('inventory-list');
export const harvestedItemsDisplay = document.getElementById('harvested-items-list');
export const sellAllHarvestedBtn = document.getElementById('sell-all-harvested-btn');
export const toolsListDisplay = document.getElementById('tools-list'); // Get the tools list container