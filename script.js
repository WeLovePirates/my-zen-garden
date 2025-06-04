// --- Game State ---
const game = {
    money: 100,
    plot: Array(3).fill(null).map(() => Array(3).fill(null)), // 3x3 array for plot
    seedShop: {
        "carrot": { price: 10, growTime: 5, sellPrice: 20, name: "Carrot", emoji: "🥕" },
        "tomato": { price: 20, growTime: 10, sellPrice: 40, name: "Tomato", emoji: "🍅" },
        "corn": { price: 30, growTime: 15, sellPrice: 60, name: "Corn", emoji: "🌽" }
    },
    selectedSeedType: null, // Stores the type of seed chosen from inventory for planting
    inventory: {
        "carrot": 0,
        "tomato": 0,
        "corn": 0
    }
};

// --- Local Storage Key ---
const LOCAL_STORAGE_KEY = 'myZenGardenSave';

// --- UI Elements (cached for performance) ---
const moneyDisplay = document.getElementById('current-money');
const messageArea = document.getElementById('message-area');
const plotGrid = document.getElementById('plot-grid');
const buySeedButtons = document.querySelectorAll('.buy-seed-btn');
const collectAllBtn = document.getElementById('collect-all-btn');
const inventoryDisplay = document.getElementById('inventory-list');

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
                        isGrown: cell.isGrown
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
            game.inventory = parsedData.inventory || { "carrot": 0, "tomato": 0, "corn": 0 };

            game.plot = parsedData.plot.map(row => row.map(savedPlant => {
                if (savedPlant) {
                    const seedDetails = game.seedShop[savedPlant.name.toLowerCase()];
                    if (seedDetails) {
                        return {
                            name: seedDetails.name,
                            growTime: seedDetails.growTime * 1000,
                            sellPrice: seedDetails.sellPrice,
                            plantedTime: savedPlant.plantedTime,
                            isGrown: savedPlant.isGrown
                        };
                    }
                }
                return null;
            }));
            // console.log("Game loaded successfully!", game);
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

// --- UI Update Functions ---
function updateMoneyDisplay() {
    moneyDisplay.textContent = game.money;
}

function showMessage(message, type = 'info') {
    messageArea.textContent = message;
    messageArea.className = `message ${type}`;
    // Clear message after 5 seconds, but only if it's still the same message
    setTimeout(() => {
        if (messageArea.textContent === message) {
            messageArea.textContent = 'Ready for action!';
            messageArea.className = 'message info';
        }
    }, 5000);
}

function createPlotUI() {
    plotGrid.innerHTML = '';
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const cell = document.createElement('div');
            cell.classList.add('plot-cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            updateCellVisual(cell, game.plot[r][c]);
            plotGrid.appendChild(cell);
        }
    }
}

function updateCellVisual(cellElement, plantObject) {
    cellElement.innerHTML = '';
    cellElement.classList.remove('empty', 'planted', 'grown');

    if (plantObject) {
        if (plantObject.isGrown) {
            cellElement.classList.add('grown');
            const plantEmoji = game.seedShop[plantObject.name.toLowerCase()] ? game.seedShop[plantObject.name.toLowerCase()].emoji : '❓';
            cellElement.innerHTML = `<span class="plant-icon">${plantEmoji}</span><br>${plantObject.name}`;
        } else {
            cellElement.classList.add('planted');
            cellElement.innerHTML = `<span class="plant-icon">🌱</span><br>${plantObject.name}`;

            const progressBarContainer = document.createElement('div');
            progressBarContainer.classList.add('progress-bar-container');
            const progressBarFill = document.createElement('div');
            progressBarFill.classList.add('progress-bar-fill');
            progressBarFill.id = `progress-${cellElement.dataset.row}-${cellElement.dataset.col}`;
            progressBarContainer.appendChild(progressBarFill);
            cellElement.appendChild(progressBarContainer);
        }
    } else {
        cellElement.classList.add('empty');
        cellElement.innerHTML = `<span class="plot-icon">🕳️</span><br>EMPTY`;
    }
}

function updateInventoryDisplay() {
    inventoryDisplay.innerHTML = '';

    for (const seedType in game.inventory) {
        const quantity = game.inventory[seedType];
        const seedDetails = game.seedShop[seedType];

        if (seedDetails && quantity > 0) {
            const inventoryItem = document.createElement('div');
            inventoryItem.classList.add('inventory-item');
            inventoryItem.dataset.seed = seedType;
            if (game.selectedSeedType === seedType) {
                inventoryItem.classList.add('selected');
            }

            inventoryItem.innerHTML = `
                <span class="seed-emoji">${seedDetails.emoji}</span>
                <span class="seed-name">${seedDetails.name}</span>
                <span class="seed-quantity">x${quantity}</span>
                <button class="plant-from-inventory-btn" data-seed="${seedType}">Plant</button>
            `;
            inventoryDisplay.appendChild(inventoryItem);
        }
    }
    if (Object.values(game.inventory).every(q => q === 0)) {
        inventoryDisplay.innerHTML = '<p class="no-seeds-message">Your inventory is empty. Buy seeds from the shop!</p>';
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

// MODIFIED: Function to select a seed from inventory for planting or deselect
function selectSeedForPlanting(seedType) {
    // If the clicked seed is ALREADY selected, deselect it
    if (game.selectedSeedType === seedType) {
        game.selectedSeedType = null;
        showMessage("Seed deselected. Click a seed to plant.", 'info');
    } else {
        // Otherwise, select the new seed (if available)
        if (game.inventory[seedType] > 0) {
            game.selectedSeedType = seedType;
            showMessage(`Selected ${game.seedShop[seedType].name} seed. Click an EMPTY plot to plant it.`, 'info');
        } else {
            showMessage(`You don't have any ${game.seedShop[seedType].name} seeds!`, 'error');
            game.selectedSeedType = null; // Ensure nothing is selected if count is zero
        }
    }
    updateInventoryDisplay(); // Always update to reflect selection/deselection
}


// MODIFIED: Function to plant a seed (allows consecutive planting)
function plantSeed(row, col) {
    if (game.plot[row][col] === null) {
        if (!game.selectedSeedType) {
            showMessage("No seed selected! Select one from your inventory first.", 'error');
            return;
        }
        // Check if seed is actually available in inventory
        if (game.inventory[game.selectedSeedType] <= 0) {
            showMessage(`You don't have any ${game.seedShop[game.selectedSeedType].name} seeds left! Selecting a different seed.`, 'error');
            game.selectedSeedType = null; // Deselect if run out
            updateInventoryDisplay();
            return;
        }

        const seedTypeToPlant = game.selectedSeedType;
        const seedDetails = game.seedShop[seedTypeToPlant];
        
        const plantInstance = {
            name: seedDetails.name,
            growTime: seedDetails.growTime * 1000,
            sellPrice: seedDetails.sellPrice,
            plantedTime: Date.now(),
            isGrown: false
        };
        game.plot[row][col] = plantInstance;
        game.inventory[seedTypeToPlant]--; // Decrement from inventory
        
        const cellElement = plotGrid.children[row * 3 + col];
        updateCellVisual(cellElement, plantInstance);
        updateInventoryDisplay(); // Update inventory UI after planting

        showMessage(`Planted ${plantInstance.name} at (${row},${col})! Click another empty plot to plant more or click the seed in inventory to deselect.`, 'success');
        // REMOVED: game.selectedSeedType = null; // This line was removed to allow consecutive planting
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
            game.plot[row][col] = null;
            const cellElement = plotGrid.children[row * 3 + col];
            updateCellVisual(cellElement, null);
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
                game.plot[r][c] = null;
                const cellElement = plotGrid.children[r * 3 + c];
                updateCellVisual(cellElement, null);
                plantsCollected++;
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
            if (plant && !plant.isGrown) {
                const now = Date.now();
                const elapsedTime = now - plant.plantedTime;
                const progress = Math.min(1, elapsedTime / plant.growTime);
                const percentage = Math.floor(progress * 100);

                const cellElement = plotGrid.children[r * 3 + c];
                const progressBarFill = cellElement.querySelector(`#progress-${r}-${c}`);
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
    if (stateChanged) {
        saveGame();
    }
    requestAnimationFrame(gameLoop);
}