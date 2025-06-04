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

// --- UI Elements (cached for performance) ---
const moneyDisplay = document.getElementById('current-money');
const messageArea = document.getElementById('message-area');
const plotGrid = document.getElementById('plot-grid');
const buySeedButtons = document.querySelectorAll('.buy-seed-btn');
const collectAllBtn = document.getElementById('collect-all-btn'); // Renamed from collectModeBtn

// --- Game Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initGame();
});

function initGame() {
    updateMoneyDisplay();
    createPlotUI();
    attachEventListeners();
    gameLoop(); // Start the main game loop
    showMessage("Welcome to your garden! Buy some seeds to get started.", 'info');
}

// --- UI Update Functions ---
function updateMoneyDisplay() {
    moneyDisplay.textContent = game.money;
}

function showMessage(message, type = 'info') {
    messageArea.textContent = message;
    messageArea.className = `message ${type}`; // Apply CSS class for styling
    // Clear message after a few seconds (optional)
    setTimeout(() => {
        if (messageArea.textContent === message) { // Only clear if it hasn't been overwritten
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
            // Display emoji and text
            cellElement.innerHTML = `<span class="plant-icon">${game.seedShop[plantObject.name.toLowerCase()].emoji}</span><br>${plantObject.name}`;
        } else {
            cellElement.classList.add('planted');
            // Display seed emoji and text
            cellElement.innerHTML = `<span class="plant-icon">🌱</span><br>${plantObject.name}`; // Generic seedling emoji
        }
    } else {
        cellElement.classList.add('empty');
        cellElement.innerHTML = `<span class="plot-icon">🕳️</span><br>EMPTY`; // Hole/empty plot emoji
    }
}

// --- Event Listeners ---
function attachEventListeners() {
    // Buy Seed Buttons
    buySeedButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const seedType = event.target.dataset.seed;
            handleBuySeed(seedType);
        });
    });

    // Collect All Button
    collectAllBtn.addEventListener('click', collectAllGrownPlants);

    // Plot Cell Clicks (unified handler for planting/collecting)
    plotGrid.addEventListener('click', (event) => {
        const cell = event.target.closest('.plot-cell');
        if (cell) {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);

            if (game.selectedSeedType) {
                // If a seed is selected, attempt to plant
                plantSeed(row, col);
            } else {
                // If no seed is selected, attempt to collect/sell
                collectAndSellPlant(row, col);
            }
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
            game.selectedSeedType = seedType; // Store the type of seed for immediate planting
            showMessage(`Bought ${seedDetails.name} Seed for ${seedDetails.price} coins! Click an EMPTY plot to plant it.`, 'success');
        } else {
            showMessage("Not enough money to buy that seed!", 'error');
        }
    }
}

function plantSeed(row, col) {
    if (game.plot[row][col] === null) {
        // Check if a seed is actually selected for planting
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
        game.selectedSeedType = null; // Clear selected seed after successful planting
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
    } else {
        showMessage("No grown plants to collect!", 'info');
    }
}


// --- Main Game Loop (updates plant growth) ---
function gameLoop() {
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const plant = game.plot[r][c];
            if (plant && !plant.isGrown) {
                if (Date.now() - plant.plantedTime >= plant.growTime) {
                    plant.isGrown = true;
                    const cellElement = plotGrid.children[r * 3 + c];
                    updateCellVisual(cellElement, plant);
                    showMessage(`${plant.name} at (${r},${c}) has grown!`, 'success');
                }
            }
        }
    }
    requestAnimationFrame(gameLoop); // Request the next animation frame
}