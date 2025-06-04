// --- Game State ---
const game = {
    money: 100,
    plot: Array(3).fill(null).map(() => Array(3).fill(null)), // 3x3 array for plot
    seedShop: {
        "carrot": { price: 10, growTime: 5, sellPrice: 20, name: "Carrot", emoji: "🥕" },
        "tomato": { price: 20, growTime: 10, sellPrice: 40, name: "Tomato", emoji: "🍅" },
        "corn": { price: 30, growTime: 15, sellPrice: 60, name: "Corn", emoji: "🌽" }
    },
    selectedSeedType: null, // Stores the type of seed chosen from the shop for planting
};

// --- Local Storage Key ---
const LOCAL_STORAGE_KEY = 'myZenGardenSave';

// --- UI Elements (cached for performance) ---
const moneyDisplay = document.getElementById('current-money');
const messageArea = document.getElementById('message-area');
const plotGrid = document.getElementById('plot-grid');
const buySeedButtons = document.querySelectorAll('.buy-seed-btn');
const collectAllBtn = document.getElementById('collect-all-btn');

// --- Game Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    loadGame(); // Try to load saved game first
    initGame();
});

function initGame() {
    updateMoneyDisplay();
    createPlotUI();
    attachEventListeners();
    gameLoop(); // Start the main game loop
    showMessage("Welcome to My Zen Garden! Buy some seeds to get started.", 'info');
}

// --- Local Storage Functions ---
function saveGame() {
    try {
        // Create a copy of the game state to save, excluding selectedSeedType
        // as it's temporary for planting, not a persistent game state.
        const stateToSave = {
            money: game.money,
            plot: game.plot.map(row => row.map(cell => {
                if (cell) {
                    // Only save necessary plant properties
                    return {
                        name: cell.name,
                        plantedTime: cell.plantedTime, // Crucial for growth calculation
                        isGrown: cell.isGrown
                    };
                }
                return null;
            }))
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
        // console.log("Game saved successfully!"); // For debugging
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

            // Restore money
            game.money = parsedData.money;

            // Restore plot, re-adding full plant details from seedShop
            // This ensures growTime and sellPrice are correctly linked even if they change in seedShop
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
            // console.log("Game loaded successfully!", game); // For debugging
            showMessage("Game loaded from previous session!", 'info');
        } else {
            // console.log("No saved game found."); // For debugging
        }
    } catch (e) {
        console.error("Error loading game from local storage:", e);
        // Clear corrupt data to prevent continuous errors on load
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
    messageArea.className = `message ${type}`; // Apply CSS class for styling
    setTimeout(() => {
        if (messageArea.textContent === message) {
            messageArea.textContent = 'Ready for action!';
            messageArea.className = 'message info';
        }
    }, 5000);
}

function createPlotUI() {
    plotGrid.innerHTML = ''; // Clear existing
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const cell = document.createElement('div');
            cell.classList.add('plot-cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            updateCellVisual(cell, game.plot[r][c]); // Set initial visual
            plotGrid.appendChild(cell);
        }
    }
}

function updateCellVisual(cellElement, plantObject) {
    cellElement.innerHTML = ''; // Clear existing content
    cellElement.classList.remove('empty', 'planted', 'grown');

    if (plantObject) {
        if (plantObject.isGrown) {
            cellElement.classList.add('grown');
            // Get emoji from seedShop based on plant name
            const plantEmoji = game.seedShop[plantObject.name.toLowerCase()] ? game.seedShop[plantObject.name.toLowerCase()].emoji : '❓'; // Fallback emoji
            cellElement.innerHTML = `<span class="plant-icon">${plantEmoji}</span><br>${plantObject.name}`;
        } else {
            cellElement.classList.add('planted');
            cellElement.innerHTML = `<span class="plant-icon">🌱</span><br>${plantObject.name}`; // Generic seedling emoji

            // Add progress bar for planted but not grown plants
            const progressBarContainer = document.createElement('div');
            progressBarContainer.classList.add('progress-bar-container');
            const progressBarFill = document.createElement('div');
            progressBarFill.classList.add('progress-bar-fill');
            progressBarFill.id = `progress-${cellElement.dataset.row}-${cellElement.dataset.col}`; // Unique ID for each bar
            progressBarContainer.appendChild(progressBarFill);
            cellElement.appendChild(progressBarContainer);
        }
    } else {
        cellElement.classList.add('empty');
        cellElement.innerHTML = `<span class="plot-icon">🕳️</span><br>EMPTY`; // Hole/empty plot emoji
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
            saveGame(); // Save game after any interaction on the plot
        }
    });
}

// --- Game Logic Functions ---
function handleBuySeed(seedType) {
    const seedDetails = game.seedShop[seedType];
    if (seedDetails) {
        if (game.money >= seedDetails.price) {
            game.money -= seedDetails.price;
            updateMoneyDisplay();
            game.selectedSeedType = seedType;
            showMessage(`Bought ${seedDetails.name} Seed for ${seedDetails.price} coins! Click an EMPTY plot to plant it.`, 'success');
            saveGame(); // Save after buying seed
        } else {
            showMessage("Not enough money to buy that seed!", 'error');
        }
    }
}

function plantSeed(row, col) {
    if (game.plot[row][col] === null) {
        if (!game.selectedSeedType) {
            showMessage("No seed selected! Buy one from the shop first.", 'error');
            return;
        }

        const seedDetails = game.seedShop[game.selectedSeedType];
        
        const plantInstance = {
            name: seedDetails.name,
            growTime: seedDetails.growTime * 1000, // Convert to milliseconds
            sellPrice: seedDetails.sellPrice,
            plantedTime: Date.now(),
            isGrown: false
        };
        game.plot[row][col] = plantInstance;
        const cellElement = plotGrid.children[row * 3 + col];
        updateCellVisual(cellElement, plantInstance);
        showMessage(`Planted ${plantInstance.name} at (${row},${col})!`, 'success');
        game.selectedSeedType = null;
        saveGame(); // Save after planting
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
            game.plot[row][col] = null; // Remove plant
            const cellElement = plotGrid.children[row * 3 + col];
            updateCellVisual(cellElement, null); // Update visual to empty
            saveGame(); // Save after selling
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
                game.plot[r][c] = null; // Remove plant
                const cellElement = plotGrid.children[r * 3 + c];
                updateCellVisual(cellElement, null); // Update visual to empty
                plantsCollected++;
            }
        }
    }
    updateMoneyDisplay();
    if (plantsCollected > 0) {
        showMessage(`Collected and sold ${plantsCollected} plants for a total of ${totalEarnings} coins!`, 'success');
        saveGame(); // Save after collecting all
    } else {
        showMessage("No grown plants to collect!", 'info');
    }
}


// --- Main Game Loop (updates plant growth) ---
function gameLoop() {
    let stateChanged = false; // Flag to indicate if any plant grew
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const plant = game.plot[r][c];
            if (plant && !plant.isGrown) {
                const now = Date.now();
                const elapsedTime = now - plant.plantedTime;
                const progress = Math.min(1, elapsedTime / plant.growTime); // Calculate progress (0 to 1)
                const percentage = Math.floor(progress * 100);

                const cellElement = plotGrid.children[r * 3 + c];
                const progressBarFill = cellElement.querySelector(`#progress-${r}-${c}`);
                if (progressBarFill) {
                    progressBarFill.style.width = `${percentage}%`;
                }

                if (progress >= 1) {
                    plant.isGrown = true;
                    updateCellVisual(cellElement, plant); // Update visual to grown state
                    showMessage(`${plant.name} at (${r},${c}) has grown!`, 'success');
                    stateChanged = true; // Mark that a change occurred
                }
            }
        }
    }
    if (stateChanged) {
        saveGame(); // Save if any plants grew
    }
    requestAnimationFrame(gameLoop); // Request the next animation frame
}