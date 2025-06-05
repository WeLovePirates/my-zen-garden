// js/logic.js

// --- Game Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    loadGame();
    initGame();
});

function initGame() {
    updateMoneyDisplay();
    createPlotUI();
    updateInventoryDisplay();
    updateHarvestedItemsDisplay(); // Call to update harvested items
    attachEventListeners();
    gameLoop();
    showMessage("Welcome to My Zen Garden! Buy some seeds to get started.", 'info');
}

// --- Local Storage Functions ---
function saveGame() {
    try {
        const stateToSave = {
            money: game.money,
            plot: game.plot.map(row => row.map(cell => {
                if (cell) {
                    return {
                        name: cell.name,
                        plantedTime: cell.plantedTime,
                        isGrown: cell.isGgrown,
                        isMultiHarvest: cell.isMultiHarvest,
                        harvestsLeft: cell.harvestsLeft
                    };
                }
                return null;
            })),
            inventory: game.inventory,
            harvestedItems: game.harvestedItems
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
        // console.log("Game saved successfully!");
    } catch (e) {
        console.error("Error saving game to local storage:", e);
        showMessage("Could not save game. Your browser may be in private mode or storage is full.", 'error');
    }
}

function loadGame() {
    try {
        const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedState) {
            const parsedState = JSON.parse(savedState);

            // Restore money
            game.money = parsedState.money || 100;

            // Restore plot, ensuring plantedTime is a Date object if needed, and handling new properties
            game.plot = parsedState.plot.map(row => row.map(cell => {
                if (cell) {
                    return {
                        name: cell.name,
                        plantedTime: cell.plantedTime, // stored as timestamp
                        isGrown: cell.isGrown,
                        isMultiHarvest: cell.isMultiHarvest || false, // Default to false if not present
                        harvestsLeft: cell.harvestsLeft !== undefined ? cell.harvestsLeft : 0 // Default or adjust based on your multi-harvest needs
                    };
                }
                return null;
            }));

            // Restore inventory, ensuring all seed types are present even if not in save
            game.inventory = {};
            for (const seedType in game.seedShop) {
                game.inventory[seedType] = parsedState.inventory[seedType] !== undefined ? parsedState.inventory[seedType] : 0;
            }

            // Restore harvested items (ensure it's an array)
            game.harvestedItems = Array.isArray(parsedState.harvestedItems) ? parsedState.harvestedItems : [];

            // console.log("Game loaded successfully!");
        } else {
            // console.log("No saved game found. Starting new game.");
        }
    } catch (e) {
        console.error("Error loading game from local storage:", e);
        showMessage("Could not load saved game. Starting a new game.", 'error');
        // Reset game state in case of loading error
        game.money = 100;
        game.plot = Array(3).fill(null).map(() => Array(3).fill(null));
        game.selectedSeedType = null;
        game.inventory = {};
        for (const seedType in game.seedShop) {
            game.inventory[seedType] = 0;
        }
        game.harvestedItems = [];
    }
}

// --- Event Listeners ---
function attachEventListeners() {
    // Buy Seed Buttons
    buySeedButtons.forEach(button => {
        button.addEventListener('click', () => {
            const seedType = button.dataset.seed;
            handleBuySeed(seedType);
        });
    });

    // Collect All Button
    collectAllBtn.addEventListener('click', collectAllHarvestablePlants);

    // Sell All Harvested Crops Button
    sellAllHarvestedBtn.addEventListener('click', sellAllHarvestedItems);

    // Plot Grid clicks (for planting and harvesting)
    plotGrid.addEventListener('click', (event) => {
        const cell = event.target.closest('.plot-cell');
        if (cell) {
            const r = parseInt(cell.dataset.row);
            const c = parseInt(cell.dataset.col);

            // --- SHOVEL TOOL INTEGRATION START ---
            if (game.shovelActive) {
                handleShovelAction(r, c);
                return; // Prevent other actions when shovel is active
            }
            // --- SHOVEL TOOL INTEGRATION END ---

            const plant = game.plot[r][c];

            if (plant && plant.isGrown) {
                harvestPlant(r, c);
            } else if (!plant && game.selectedSeedType) {
                plantSeed(r, c);
            } else if (!plant && !game.selectedSeedType) {
                showMessage("Select a seed from your inventory first!", 'info');
            } else if (plant && !plant.isGrown) {
                showMessage(`This ${plant.name} is still growing!`, 'info');
            }
        }
    });

    // Inventory "Plant" buttons
    inventoryDisplay.addEventListener('click', (event) => {
        const targetBtn = event.target.closest('.plant-from-inventory-btn');
        if (targetBtn && targetBtn.dataset.seedType) {
            const seedType = targetBtn.dataset.seedType;
            selectSeedForPlanting(seedType);
        }
    });

    // Harvested Items "Sell" buttons
    harvestedItemsDisplay.addEventListener('click', (event) => {
        const sellBtn = event.target.closest('.sell-harvested-btn');
        if (sellBtn && sellBtn.dataset.index) {
            const index = parseInt(sellBtn.dataset.index);
            sellHarvestedItem(index);
        }
    });

    // --- SHOVEL TOOL EVENT LISTENER ---
    if (shovelToolBtn) { // Check if the element exists
        shovelToolBtn.addEventListener('click', toggleShovelTool);
    }
}

// --- Seed & Plant Logic ---
function handleBuySeed(seedType) {
    const seed = game.seedShop[seedType];
    if (seed) {
        if (game.money >= seed.price) {
            game.money -= seed.price;
            game.inventory[seedType]++;
            updateMoneyDisplay();
            updateInventoryDisplay();
            showMessage(`Bought 1 ${seed.name} seed for ${seed.price} coins!`, 'success');
            saveGame();
        } else {
            showMessage(`Not enough money to buy ${seed.name} seed! Needs ${seed.price} coins.`, 'error');
        }
    }
}

function selectSeedForPlanting(seedType) {
    if (game.inventory[seedType] > 0) {
        game.selectedSeedType = seedType;
        showMessage(`Selected ${game.seedShop[seedType].name} seed. Click an empty plot to plant!`, 'info');
        updateInventoryDisplay(); // Update to show selected state
        // --- SHOVEL TOOL INTEGRATION: Deselect shovel if a seed is selected ---
        if (game.shovelActive) {
            toggleShovelTool();
        }
    } else {
        showMessage(`You don't have any ${game.seedShop[seedType].name} seeds!`, 'error');
    }
}

function plantSeed(row, col) {
    if (game.selectedSeedType && game.inventory[game.selectedSeedType] > 0) {
        const seedInfo = game.seedShop[game.selectedSeedType];
        game.plot[row][col] = {
            name: seedInfo.name,
            plantedTime: Date.now(),
            growTime: seedInfo.growTime,
            isGrown: false,
            // Multi-harvest properties (example for future expansion)
            isMultiHarvest: seedInfo.multiHarvest || false,
            harvestsLeft: seedInfo.multiHarvest ? (seedInfo.maxHarvests || 3) : 1 // Example: 3 harvests if multi-harvest
        };
        game.inventory[game.selectedSeedType]--;
        game.selectedSeedType = null; // Deselect after planting
        updateInventoryDisplay();
        const cellElement = plotGrid.children[row * 3 + col];
        updateCellVisual(cellElement, game.plot[row][col]);
        showMessage(`Planted 1 ${seedInfo.name} at (${row},${col})!`, 'success');
        saveGame();
    }
}

function generateRandomWeight(min, max) {
    return (Math.random() * (max - min) + min).toFixed(2);
}

function harvestPlant(row, col) {
    const plant = game.plot[row][col];
    if (plant && plant.isGrown) {
        const seedInfo = game.seedShop[plant.name.toLowerCase()];
        const weight = generateRandomWeight(seedInfo.minWeight, seedInfo.maxWeight);
        const sellValue = Math.round(seedInfo.baseSellPrice * weight); // Value scales with weight

        game.harvestedItems.push({
            name: plant.name,
            weight: parseFloat(weight), // Store as number
            sellValue: sellValue,
            imagePath: seedInfo.stages[seedInfo.stages.length - 1].imagePath // Path to the fully grown image
        });

        // Handle multi-harvest
        if (plant.isMultiHarvest && plant.harvestsLeft > 1) {
            plant.harvestsLeft--;
            plant.isGrown = false; // Reset growth for next harvest
            plant.plantedTime = Date.now(); // Reset planted time for next growth cycle
            showMessage(`Harvested 1 ${plant.name}! ${plant.harvestsLeft} harvests left.`, 'success');
        } else {
            game.plot[row][col] = null; // Clear the plot after single harvest or last multi-harvest
            showMessage(`Harvested 1 ${plant.name}!`, 'success');
        }

        const cellElement = plotGrid.children[row * 3 + col];
        updateCellVisual(cellElement, plant); // Update visual
        updateHarvestedItemsDisplay(); // Update harvested items list
        saveGame();
    }
}

function collectAllHarvestablePlants() {
    let harvestedCount = 0;
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const plant = game.plot[r][c];
            if (plant && plant.isGrown) {
                harvestPlant(r, c); // This will update the plot and UI for each plant
                harvestedCount++;
            }
        }
    }
    if (harvestedCount > 0) {
        showMessage(`Collected ${harvestedCount} grown plant(s)!`, 'success');
    } else {
        showMessage("No plants are ready to be collected.", 'info');
    }
}

function sellHarvestedItem(index) {
    if (index >= 0 && index < game.harvestedItems.length) {
        const item = game.harvestedItems[index];
        game.money += item.sellValue;
        game.harvestedItems.splice(index, 1); // Remove the item

        updateMoneyDisplay();
        updateHarvestedItemsDisplay();
        showMessage(`Sold 1 ${item.name} for ${item.sellValue} coins!`, 'success');
        saveGame();
    }
}

function sellAllHarvestedItems() {
    if (game.harvestedItems.length === 0) {
        showMessage("No crops to sell!", 'info');
        return;
    }

    let totalEarnings = 0;
    game.harvestedItems.forEach(item => {
        totalEarnings += item.sellValue;
    });

    const numItems = game.harvestedItems.length;
    game.money += totalEarnings;
    game.harvestedItems = []; // Clear all harvested items

    updateMoneyDisplay();
    updateHarvestedItemsDisplay();
    showMessage(`Sold ${numItems} harvested crops for a total of ${totalEarnings} coins!`, 'success');
    saveGame();
}


// --- Main Game Loop (updates plant growth) ---
function gameLoop() {
    let stateChanged = false;
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const plant = game.plot[r][c];
            if (plant) {
                const cellElement = plotGrid.children[r * 3 + c];
                updateCellVisual(cellElement, plant);

                if (!plant.isGrown) {
                    const now = Date.now();
                    const elapsedTime = now - plant.plantedTime;
                    const progress = Math.min(1, elapsedTime / plant.growTime);
                    const percentage = Math.floor(progress * 100);

                    const progressBarFill = cellElement.querySelector(`.progress-bar-fill`);
                    if (progressBarFill) {
                        progressBarFill.style.width = `${percentage}%`;
                    }

                    if (progress >= 1) {
                        plant.isGrown = true;
                        updateCellVisual(cellElement, plant);
                        showMessage(`${plant.name} at (${r},${c}) has grown!`, 'success');
                        stateChanged = true;
                    }
                }
            }
        }
    }
    if (stateChanged) {
        saveGame(); // Save game if any plant state has changed
    }
    requestAnimationFrame(gameLoop);
}