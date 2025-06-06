// js/game/game.js
import { game, LOCAL_STORAGE_KEY, plotGrid, messageArea, moneyDisplay, inventoryDisplay, harvestedItemsDisplay, toolsListDisplay, buySeedButtons, SHOP_RESET_INTERVAL } from './gameState.js';
import { updateMoneyDisplay, showMessage, updateCellVisual, updateInventoryDisplay, updateHarvestedItemsDisplay, updateToolsDisplay } from '../ui/uiUpdates.js';

// Helper function to generate a random weight
function generateRandomWeight(min, max) {
    return Math.random() * (max - min) + min;
}

// --- Game Logic Functions ---
export function handleBuySeed(seedType) {
    const seedDetails = game.seedShop[seedType];
    if (seedDetails) {
        if (seedDetails.stock <= 0) { // Check if stock is available
            showMessage(`${seedDetails.name} seeds are out of stock!`, 'error');
            return;
        }
        if (game.money >= seedDetails.price) {
            game.money -= seedDetails.price;
            game.inventory[seedType]++;
            seedDetails.stock--; // Decrease stock after purchase
            updateMoneyDisplay();
            updateInventoryDisplay();
            updateShopDisplay(); // Call new function to update shop UI
            showMessage(`Bought ${seedDetails.name} Seed for ${seedDetails.price} coins! It's in your inventory.`, 'success');
            saveGame();
        } else {
            showMessage("Not enough money to buy that seed!", 'error');
        }
    }
}

export function selectSeedForPlanting(seedType) {
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

export function plantSeed(row, col) {
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

// Harvests a plant, adds it to harvestedItems inventory
export function harvestPlant(row, col) {
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

        // Calculate sell value based on tier and weight
        // For now, all crops use a linear calculation: baseSellPrice * weight
        sellValue = seedDetails.baseSellPrice * weight;

        const harvestedItem = {
            name: plant.name,
            weight: weight,
            sellValue: Math.round(sellValue) // Round to whole number for display
        };
        game.harvestedItems.push(harvestedItem);
        showMessage(`Harvested a ${plant.name} weighing ${weight.toFixed(2)}kg, worth ${Math.round(sellValue)} coins!`, 'success');

        // Multi-harvest check:
        if (plant.isMultiHarvest && (plant.harvestsLeft > 1 || plant.harvestsLeft === -1)) {
            // If harvestsLeft is -1, don't decrement it (infinite harvests)
            if (plant.harvestsLeft !== -1) {
                plant.harvestsLeft--;
            }
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

        updateHarvestedItemsDisplay();
        updateMoneyDisplay(); // Update money display if selling immediately (though selling is a separate action now)
        saveGame();
    } else if (plant && !plant.isGrown) {
        showMessage(`${plant.name} is still growing...`, 'info');
    } else {
        showMessage("There's nothing to harvest here!", 'error');
    }
}

// Collect all fully grown, multi-harvestable plants
export function collectAllHarvestablePlants() {
    let harvestedCount = 0;
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const plant = game.plot[r][c];
            // Only collect if grown and multi-harvestable
            // The harvestPlant function itself handles the isMultiHarvest check
            if (plant && plant.isGrown) {
                harvestPlant(r, c);
                harvestedCount++;
            }
        }
    }
    if (harvestedCount > 0) {
        // Individual messages are shown by harvestPlant, this is a summary.
        showMessage(`Collected ${harvestedCount} plants!`, 'success');
    } else {
        showMessage("No grown plants to collect!", 'info');
    }
    saveGame();
}


export function sellHarvestedItem(index) {
    if (index >= 0 && index < game.harvestedItems.length) {
        const itemToSell = game.harvestedItems[index];
        game.money += itemToSell.sellValue;
        game.harvestedItems.splice(index, 1); // Remove item from array
        updateMoneyDisplay();
        updateHarvestedItemsDisplay();
        showMessage(`Sold ${itemToSell.name} for ${itemToSell.sellValue} coins!`, 'success');
        saveGame();
    } else {
        showMessage("Error: Item not found in inventory.", 'error');
    }
}

export function sellAllHarvestedItems() {
    if (game.harvestedItems.length === 0) {
        showMessage("No items to sell!", 'info');
        return;
    }

    let totalSoldValue = 0;
    game.harvestedItems.forEach(item => {
        totalSoldValue += item.sellValue;
    });

    game.money += totalSoldValue;
    game.harvestedItems = []; // Clear all harvested items

    updateMoneyDisplay();
    updateHarvestedItemsDisplay();
    showMessage(`Sold all harvested items for a total of ${totalSoldValue} coins!`, 'success');
    saveGame();
}


// Function to save the game state to localStorage
export function saveGame() {
    try {
        const gameData = JSON.stringify(game);
        localStorage.setItem(LOCAL_STORAGE_KEY, gameData);
        // console.log("Game saved successfully!");
    } catch (e) {
        console.error("Error saving game:", e);
        showMessage("Error saving game! Please check your browser's local storage settings.", 'error');
    }
}

// Function to load the game state from localStorage
export function loadGame() {
    try {
        const savedGame = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedGame) {
            const loadedGame = JSON.parse(savedGame);

            // Restore only essential game state properties to avoid overwriting functions or UI elements
            game.money = loadedGame.money || 0;
            game.plot = loadedGame.plot || [];
            game.selectedSeedType = loadedGame.selectedSeedType || null;
            game.inventory = loadedGame.inventory || {};
            game.harvestedItems = loadedGame.harvestedItems || [];
            game.tools = loadedGame.tools || {}; // Ensure tools are loaded
            game.lastShopReset = loadedGame.lastShopReset || Date.now(); // Load lastShopReset or initialize


            // Special handling for plot plants:
            // Re-assign functions and correct plantedTime (Date objects are stringified)
            for (let r = 0; r < game.plot.length; r++) {
                for (let c = 0; c < game.plot[r].length; c++) {
                    if (game.plot[r][c] && typeof game.plot[r][c].plantedTime === 'string') {
                        game.plot[r][c].plantedTime = new Date(game.plot[r][c].plantedTime).getTime();
                        // Ensure isMultiHarvest and harvestsLeft are properly loaded
                        const seedDetails = game.seedShop[game.plot[r][c].name.toLowerCase()];
                        if (seedDetails) {
                            game.plot[r][c].isMultiHarvest = seedDetails.isMultiHarvest || false;
                            game.plot[r][c].harvestsLeft = game.plot[r][c].hasOwnProperty('harvestsLeft') ? game.plot[r][c].harvestsLeft : (seedDetails.isMultiHarvest ? seedDetails.harvestsLeft : 1);
                        }
                    }
                }
            }

            // Ensure all seeds from seedShopData are in inventory, even if 0
            for (const seedType in game.seedShop) {
                if (!(seedType in game.inventory)) {
                    game.inventory[seedType] = 0;
                }
            }
            // Ensure stock is loaded or initialized
            // This loop iterates through seedShopData to ensure stock property exists for all seeds
            for (const seedType in game.seedShop) {
                // If loadedGame.seedShop[seedType] exists, use its stock, otherwise use the default from game.seedShop (seedData.js)
                // This handles cases where old saves might not have 'stock' and new ones do.
                if (loadedGame.seedShop && loadedGame.seedShop[seedType] && loadedGame.seedShop[seedType].hasOwnProperty('stock')) {
                    game.seedShop[seedType].stock = loadedGame.seedShop[seedType].stock;
                } else if (!game.seedShop[seedType].hasOwnProperty('stock')) {
                    // Fallback: if no stock in loaded data AND no stock in current seedShopData, initialize to a default (e.g., 100)
                    // This assumes seedData.js *should* have stock, but as a safeguard.
                    // For this specific request, seedData.js will have stock, so this is primarily for future proofing.
                    game.seedShop[seedType].stock = 100; // Or whatever default makes sense
                }
            }


            // Ensure shovel exists in tools, if not present (for old saves)
            if (!game.tools.shovel) {
                game.tools.shovel = { name: "Shovel", imagePath: "sprites/shovel.png" };
            }

            updateMoneyDisplay();
            updateInventoryDisplay();
            updateHarvestedItemsDisplay();
            updateToolsDisplay(); // Update tools display on load
            updateShopDisplay(); // Update shop display on load
            // createPlotUI(); // This is called in main.js after loadGame
            showMessage("Game loaded successfully!", 'info');
        } else {
            showMessage("No saved game found. Starting new game.", 'info');
        }
    } catch (e) {
        console.error("Error loading game:", e);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        showMessage("Could not load game. Saved data might be corrupt. Starting new game.", 'error');
    }
}


// --- Main Game Loop (updates plant growth) ---
export function gameLoop() {
    let stateChanged = false;
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const plant = game.plot[r][c];
            const cellElement = plotGrid.children[r * 3 + c]; // Get the cell element once

            // If there's a plant and it's not yet grown, update its progress
            if (plant && !plant.isGrown) {
                const now = Date.now();
                const elapsedTime = now - plant.plantedTime;
                const progress = Math.min(1, elapsedTime / plant.growTime);

                // Check if plant is fully grown
                if (progress >= 1) {
                    plant.isGrown = true;
                    showMessage(`${plant.name} at (${r},${c}) has grown!`, 'success');
                    stateChanged = true;
                }
                // Always call updateCellVisual for growing plants to show progress bar and stage updates
                updateCellVisual(cellElement, plant);
            } else if (plant && plant.isGrown) {
                // If the plant is grown (e.g., just became grown, or is a multi-harvest plant)
                // ensure its visual is updated (e.g., to show 'READY' or remaining harvests)
                updateCellVisual(cellElement, plant);
            } else if (plant === null) {
                // If the plot is empty, ensure it's visually empty (e.g., after a final harvest)
                updateCellVisual(cellElement, null);
            }
        }
    }

    // Check shop reset every game loop iteration
    checkShopReset();

    if (stateChanged) {
        saveGame();
    }
    // Always request the next frame
    requestAnimationFrame(gameLoop);
}

// Add a function to start the game loop
export function startGameLoop() {
    // Start the game loop
    requestAnimationFrame(gameLoop);
}

// Add this new function to update the shop display
export function updateShopDisplay() {
    const seedItems = document.querySelectorAll('.seed-item');
    seedItems.forEach(item => {
        const seedType = item.dataset.seed;
        const stockDisplay = item.querySelector('.stock-count');
        const buyButton = item.querySelector('.buy-seed-btn');
        
        if (stockDisplay && game.seedShop[seedType]) {
            const stock = game.seedShop[seedType].stock;
            stockDisplay.textContent = stock;
            
            // Handle out of stock styling
            if (stock <= 0) {
                stockDisplay.classList.add('out-of-stock');
                if (buyButton) {
                    buyButton.classList.add('disabled');
                    buyButton.disabled = true;
                }
            } else {
                stockDisplay.classList.remove('out-of-stock');
                if (buyButton) {
                    buyButton.classList.remove('disabled');
                    buyButton.disabled = false;
                }
            }
        }
    });
}

// Add this new function
export function resetShop() {
    // Reset stock for all seeds
    for (const seedType in game.seedShop) {
        // Randomly set stock between 5 and 15 for each seed
        game.seedShop[seedType].stock = Math.floor(Math.random() * 11) + 5;
    }
    game.lastShopReset = Date.now();
    updateShopDisplay();
    showMessage("The seed shop has been restocked!", 'info');
    saveGame();
}

// Add this function to check and update the shop timer
export function checkShopReset() {
    const now = Date.now();
    const timeSinceReset = now - game.lastShopReset;
    
    if (timeSinceReset >= SHOP_RESET_INTERVAL) {
        resetShop();
    }
    
    // Calculate time remaining
    const timeRemaining = Math.max(0, SHOP_RESET_INTERVAL - timeSinceReset);
    updateShopTimer(timeRemaining);
}

// Add this function to update the timer display
function updateShopTimer(timeRemaining) {
    const timerElement = document.getElementById('shop-timer');
    if (timerElement) {
        const seconds = Math.ceil(timeRemaining / 1000);
        timerElement.textContent = `Shop resets in: ${seconds}s`;
    }
}