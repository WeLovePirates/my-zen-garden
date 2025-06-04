// js/game.js

const LOCAL_STORAGE_KEY = 'myZenGardenSave'; // Define this once

const game = {
    money: 100,
    plot: Array(3).fill(null).map(() => Array(3).fill(null)), // 3x3 array for plot
    seedShop: seedShopData, // Reference to data from data.js
    selectedSeedType: null, // Stores the type of seed chosen from inventory for planting
    inventory: {} // Initialize inventory dynamically based on seedShopData
};

// Initialize inventory with all seeds from seedShopData set to 0
for (const seedType in game.seedShop) {
    game.inventory[seedType] = 0;
}

// UI Elements (cached for performance)
const moneyDisplay = document.getElementById('current-money');
const messageArea = document.getElementById('message-area');
const plotGrid = document.getElementById('plot-grid');
const buySeedButtons = document.querySelectorAll('.buy-seed-btn');
const collectAllBtn = document.getElementById('collect-all-btn');
const inventoryDisplay = document.getElementById('inventory-list');