// js/logic.js

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
                        isGrown: cell.isGrown,
                        isMultiHarvest: cell.isMultiHarvest,
                        harvestsLeft: cell.harvestsLeft
                    };
                }
                return null;
            })),
            inventory: game.inventory,
            harvestedItems: game.harvestedItems,
            tools: game.tools // Save the tools object
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
        // console.log("Game saved successfully!");
        updateToolsDisplay(); // NEW: Update tools display on save
    } catch (e) {
        console.error("Error saving game to local storage:", e);
        showMessage("Could not save game. Your browser may be in private mode or storage is full.", 'error');
    }
}

function loadGame() {
    try {
        const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedData) {
            const parsedData = JSON.parse(savedData);

            game.money = parsedData.money;

            // Ensure all seed types from seedShopData are present in inventory, initializing new ones to 0
            for(const seedType in game.seedShop) {
                game.inventory[seedType] = parsedData.inventory?.[seedType] ?? 0;
            }

            // Load harvested items
            game.harvestedItems = parsedData.harvestedItems || [];

            // Load tools - ensure shovel is always present and in the new format
            game.tools = parsedData.tools || {};
            if (!game.tools.shovel || game.tools.shovel.quantity !== undefined) { // Check for old format or missing
                game.tools.shovel = { name: "Shovel", imagePath: "sprites/shovel.png" };
            }


            game.plot = parsedData.plot.map(row => row.map(savedPlant => {
                if (savedPlant) {
                    const seedDetails = game.seedShop[savedPlant.name.toLowerCase()];
                    if (seedDetails) {
                        return {
                            name: seedDetails.name,
                            growTime: seedDetails.growTime,
                            plantedTime: savedPlant.plantedTime,
                            isGrown: savedPlant.isGrown,
                            isMultiHarvest: seedDetails.isMultiHarvest || false,
                            harvestsLeft: savedPlant.isMultiHarvest ? (savedPlant.harvestsLeft !== undefined ? savedPlant.harvestsLeft : seedDetails.harvestsLeft) : 1
                        };
                    }
                }
                return null;
            }));
            showMessage("Game loaded from previous session!", 'info');
        } else {
            // console.log("No saved game found.");
        }
    } catch (e) {
        console.error("Error loading game from local storage:", e);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        showMessage("Could not load game. Saved data might be corrupt. Starting new game.", 'error');
    }
}


// --- Event Listeners ---
function attachEventListeners() {
    buySeedButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const seedType = event.target.dataset.seed;
            handleBuySeed(seedType);
        });
    });

    collectAllBtn.addEventListener('click', collectAllHarvestablePlants);

    sellAllHarvestedBtn.addEventListener('click', sellAllHarvestedItems);


    plotGrid.addEventListener('click', (event) => {
        const cell = event.target.closest('.plot-cell');
        if (cell) {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);

            const plant = game.plot[row][col];
            if (plant && plant.isGrown) { // If there's a grown plant, harvest it
                harvestPlant(row, col);
            } else if (game.selectedSeedType) { // If no grown plant, but a seed is selected, plant it
                plantSeed(row, col);
            } else if (plant === null) { // If empty and no seed selected, inform user
                showMessage("Select a seed from your inventory to plant, or wait for plants to grow!", 'info');
            } else if (plant && !plant.isGrown) { // If there's a plant but not grown
                showMessage(`${plant.name} is still growing...`, 'info');
            }
            saveGame();
        }
    });

    inventoryDisplay.addEventListener('click', (event) => {
        const targetButton = event.target.closest('.plant-from-inventory-btn');
        if (targetButton) {
            const seedType = targetButton.dataset.seed;
            selectSeedForPlanting(seedType);
        }
    });

    harvestedItemsDisplay.addEventListener('click', (event) => {
        const targetButton = event.target.closest('.sell-harvested-btn');
        if (targetButton) {
            const itemIndex = parseInt(targetButton.dataset.index);
            sellHarvestedItem(itemIndex);
        }
    });
}

// --- Game Logic Functions ---
function handleBuySeed(seedType) {
    const seedDetails = game.seedShop[seedType];
    if (seedDetails) {
        if (game.money >= seedDetails.price) {
            game.money -= seedDetails.price;
            game.inventory[seedType]++;
            updateMoneyDisplay();
            updateInventoryDisplay();
            showMessage(`Bought ${seedDetails.name} Seed for ${seedDetails.price} coins! It's in your inventory.`, 'success');
            saveGame();
        } else {
            showMessage("Not enough money to buy that seed!", 'error');
        }
    }
}

function selectSeedForPlanting(seedType) {
    if (game.selectedSeedType === seedType) {
        game.selectedSeedType = null;
        showMessage("Seed deselected. Click a seed to plant.", 'info');
    } else {
        if (game.inventory[seedType] > 0) {
            game.selectedSeedType = seedType;
            showMessage(`Selected ${game.seedShop[seedType].name} seed. Click an EMPTY plot to plant it.`, 'info');
        } else {
            showMessage(`You don't have any ${game.seedShop[seedType].name} seeds!`, 'error');
            game.selectedSeedType = null;
            updateInventoryDisplay();
        }
    }
    updateInventoryDisplay();
}

function plantSeed(row, col) {
    if (game.plot[row][col] === null) {
        if (!game.selectedSeedType) {
            showMessage("No seed selected! Select one from your inventory first.", 'error');
            return;
        }
        if (game.inventory[game.selectedSeedType] <= 0) {
            showMessage(`You don't have any ${game.seedShop[game.selectedSeedType].name} seeds! Selecting a different seed.`, 'error');
            game.selectedSeedType = null;
            updateInventoryDisplay();
            return;
        }

        const seedTypeToPlant = game.selectedSeedType;
        const seedDetails = game.seedShop[seedTypeToPlant];

        const plantInstance = {
            name: seedDetails.name,
            growTime: seedDetails.growTime,
            plantedTime: Date.now(),
            isGrown: false,
            isMultiHarvest: seedDetails.isMultiHarvest || false,
            harvestsLeft: seedDetails.isMultiHarvest ? seedDetails.harvestsLeft : 1
        };
        game.plot[row][col] = plantInstance;
        game.inventory[seedTypeToPlant]--;

        if (game.inventory[seedTypeToPlant] === 0) {
            game.selectedSeedType = null;
            showMessage(`Planted ${plantInstance.name} at (${row},${col})! You've run out of ${plantInstance.name} seeds, so it has been deselected.`, 'info');
        } else {
            showMessage(`Planted ${plantInstance.name} at (${row},${col})! Click another empty plot to plant more or click the seed in inventory to deselect.`, 'success');
        }

        const cellElement = plotGrid.children[row * 3 + col];
        updateCellVisual(cellElement, plantInstance);
        updateInventoryDisplay();

        saveGame();
    } else {
        showMessage("That spot is already occupied! Choose an empty plot.", 'error');
    }
}

// Helper function to generate a random weight
function generateRandomWeight(min, max) {
    return Math.random() * (max - min) + min;
}

// Harvests a plant, adds it to harvestedItems inventory
function harvestPlant(row, col) {
    const plant = game.plot[row][col];
    if (plant && plant.isGrown) {
        const seedDetails = game.seedShop[plant.name.toLowerCase()];
        if (!seedDetails) {
            console.error(`Seed details not found for ${plant.name}`);
            showMessage("Error: Plant details missing.", 'error');
            return;
        }

        const weight = generateRandomWeight(seedDetails.minWeight, seedDetails.maxWeight);
        let sellValue;

        // ALL CROPS now use the same linear calculation for value, ensuring weight always increases value
        const calculatedBaseValue = seedDetails.baseSellPrice * weight;
        sellValue = Math.round(Math.max(calculatedBaseValue, seedDetails.price)); // Ensure min sell value = seed cost

        game.harvestedItems.push({
            name: plant.name,
            weight: parseFloat(weight.toFixed(2)), // Keep weight with 2 decimals for realism
            sellValue: sellValue, // Stored as a whole number
            emoji: seedDetails.stages[seedDetails.stages.length - 1].emoji
        });

        showMessage(`Harvested a ${plant.name} (Weight: ${weight.toFixed(2)}kg, Est. Value: ${sellValue} coins)! It's in your Harvested Crops inventory.`, 'success');

        if (plant.isMultiHarvest && plant.harvestsLeft > 1) {
            plant.harvestsLeft--;
            plant.isGrown = false;
            plant.plantedTime = Date.now(); // Reset grow time
            const cellElement = plotGrid.children[row * 3 + col];
            updateCellVisual(cellElement, plant);
        } else {
            game.plot[row][col] = null; // Clear the plot
            const cellElement = plotGrid.children[row * 3 + col];
            updateCellVisual(cellElement, null);
            if (plant.isMultiHarvest) { // If it was multi-harvest but now exhausted
                showMessage(`Fully harvested ${plant.name}. Plot is now empty.`, 'success');
            }
        }
        updateHarvestedItemsDisplay(); // Update display for new item
        saveGame();
    } else if (plant && !plant.isGrown) {
        showMessage(`${plant.name} is not yet grown! Come back later.`, 'error');
    } else {
        showMessage("No plant here to harvest.", 'error');
    }
}

// Collects all grown plants and harvests them
function collectAllHarvestablePlants() {
    let plantsHarvested = 0;
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const plant = game.plot[r][c];
            if (plant && plant.isGrown) {
                harvestPlant(r, c); // Use the harvestPlant function
                plantsHarvested++;
            }
        }
    }
    if (plantsHarvested === 0) {
        showMessage("No grown plants to harvest!", 'info');
    }
    saveGame();
    updateHarvestedItemsDisplay(); // Ensure display is updated after bulk harvest
}

// Sells a single harvested item from inventory
function sellHarvestedItem(index) {
    if (index >= 0 && index < game.harvestedItems.length) {
        const item = game.harvestedItems[index];
        game.money += item.sellValue;
        game.harvestedItems.splice(index, 1); // Remove item from array

        updateMoneyDisplay();
        updateHarvestedItemsDisplay();
        showMessage(`Sold ${item.name} (Weight: ${item.weight}kg) for ${item.sellValue} coins!`, 'success');
        saveGame();
    } else {
        showMessage("Error: Item not found in inventory.", 'error');
    }
}

// Sells all harvested items from inventory
function sellAllHarvestedItems() {
    if (game.harvestedItems.length === 0) {
        showMessage("No harvested crops to sell!", 'info');
        return;
    }

    let totalEarnings = 0;
    game.harvestedItems.forEach(item => {
        totalEarnings += item.sellValue;
    });

    game.money += totalEarnings;
    const numItems = game.harvestedItems.length;
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
        saveGame();
    }
    requestAnimationFrame(gameLoop);
}