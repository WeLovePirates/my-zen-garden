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
            inventory: game.inventory
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
        const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedData) {
            const parsedData = JSON.parse(savedData);

            game.money = parsedData.money;

            // Ensure all seed types from seedShopData are present in inventory, initializing new ones to 0
            for(const seedType in game.seedShop) {
                game.inventory[seedType] = parsedData.inventory?.[seedType] ?? 0;
            }

            game.plot = parsedData.plot.map(row => row.map(savedPlant => {
                if (savedPlant) {
                    const seedDetails = game.seedShop[savedPlant.name.toLowerCase()];
                    if (seedDetails) {
                        return {
                            name: seedDetails.name,
                            growTime: seedDetails.growTime,
                            sellPrice: seedDetails.sellPrice,
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

    collectAllBtn.addEventListener('click', collectAllGrownPlants);

    plotGrid.addEventListener('click', (event) => {
        const cell = event.target.closest('.plot-cell');
        if (cell) {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);

            if (game.selectedSeedType) {
                plantSeed(row, col);
            } else {
                collectAndSellPlant(row, col);
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
            game.selectedSeedType = null; // Also deselect if trying to select an empty seed type
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
            // This check should already catch it, but we ensure deselection here too
            showMessage(`You don't have any ${game.seedShop[game.selectedSeedType].name} seeds left! Selecting a different seed.`, 'error');
            game.selectedSeedType = null;
            updateInventoryDisplay();
            return;
        }

        const seedTypeToPlant = game.selectedSeedType;
        const seedDetails = game.seedShop[seedTypeToPlant];

        const plantInstance = {
            name: seedDetails.name,
            growTime: seedDetails.growTime,
            sellPrice: seedDetails.sellPrice,
            plantedTime: Date.now(),
            isGrown: false,
            isMultiHarvest: seedDetails.isMultiHarvest || false,
            harvestsLeft: seedDetails.isMultiHarvest ? seedDetails.harvestsLeft : 1
        };
        game.plot[row][col] = plantInstance;
        game.inventory[seedTypeToPlant]--;

        // Check if the current selected seed type has run out
        if (game.inventory[seedTypeToPlant] === 0) {
            game.selectedSeedType = null; // Deselect the seed
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

function collectAndSellPlant(row, col) {
    const plant = game.plot[row][col];
    if (plant) {
        if (plant.isGrown) {
            game.money += plant.sellPrice;
            updateMoneyDisplay();
            showMessage(`Sold ${plant.name} for ${plant.sellPrice} coins!`, 'success');

            if (plant.isMultiHarvest) {
                plant.harvestsLeft--;
                if (plant.harvestsLeft > 0) {
                    plant.isGrown = false;
                    plant.plantedTime = Date.now();
                    const cellElement = plotGrid.children[row * 3 + col];
                    updateCellVisual(cellElement, plant);
                } else {
                    game.plot[row][col] = null;
                    const cellElement = plotGrid.children[row * 3 + col];
                    updateCellVisual(cellElement, null);
                    showMessage(`Fully harvested ${plant.name}. Plot is now empty.`, 'success');
                }
            } else {
                game.plot[row][col] = null;
                const cellElement = plotGrid.children[row * 3 + col];
                updateCellVisual(cellElement, null);
            }
            saveGame();
        } else {
            showMessage(`${plant.name} is not yet grown! Come back later.`, 'error');
        }
    } else {
        showMessage("No plant here to collect.", 'error');
    }
}

function collectAllGrownPlants() {
    let plantsCollected = 0;
    let totalEarnings = 0;
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const plant = game.plot[r][c];
            if (plant && plant.isGrown) {
                game.money += plant.sellPrice;
                totalEarnings += plant.sellPrice;
                plantsCollected++;

                if (plant.isMultiHarvest) {
                    plant.harvestsLeft--;
                    if (plant.harvestsLeft > 0) {
                        plant.isGrown = false;
                        plant.plantedTime = Date.now();
                        const cellElement = plotGrid.children[r * 3 + c];
                        updateCellVisual(cellElement, plant);
                    } else {
                        game.plot[r][c] = null;
                        const cellElement = plotGrid.children[r * 3 + c];
                        updateCellVisual(cellElement, null);
                    }
                } else {
                    game.plot[r][c] = null;
                    const cellElement = plotGrid.children[r * 3 + c];
                    updateCellVisual(cellElement, null);
                }
            }
        }
    }
    updateMoneyDisplay();
    if (plantsCollected > 0) {
        showMessage(`Collected and sold ${plantsCollected} plants for a total of ${totalEarnings} coins!`, 'success');
        saveGame();
    } else {
        showMessage("No grown plants to collect!", 'info');
    }
}


// --- Main Game Loop (updates plant growth) ---
function gameLoop() {
    let stateChanged = false;
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const plant = game.plot[r][c];
            if (plant) {
                // Always update visual for progressive stages, even if not fully grown
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