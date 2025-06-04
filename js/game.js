// js/game.js

const LOCAL_STORAGE_KEY = 'myZenGardenSave'; // Define this once

const game = {
    money: 100,
    plot: Array(3).fill(null).map(() => Array(3).fill(null)), // 3x3 array for plot
    seedShop: seedShopData, // Reference to data from data.js
    selectedSeedType: null,
    inventory: {}, // Inventory for seeds
    harvestedItems: [] // NEW: Inventory for harvested crops (e.g., [{ name: "Carrot", weight: 1.2, sellValue: 24 }])
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
// NEW: UI Elements for harvested items
const harvestedItemsDisplay = document.getElementById('harvested-items-list');
const sellAllHarvestedBtn = document.getElementById('sell-all-harvested-btn');