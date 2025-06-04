// js/ui.js

function updateMoneyDisplay() {
    moneyDisplay.textContent = game.money;
}

function showMessage(message, type = 'info') {
    messageArea.textContent = message;
    messageArea.className = `message ${type}`;
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
    cellElement.classList.remove('empty', 'planted', 'grown', 'multi-harvest-ready');
    cellElement.querySelectorAll('.plant-icon').forEach(icon => {
        icon.classList.remove('small', 'medium', 'large', 'xlarge');
    });

    if (plantObject) {
        const seedDetails = game.seedShop[plantObject.name.toLowerCase()];
        let currentStage = seedDetails.stages[0];
        let stageName = "Growing...";

        if (!plantObject.isGrown) {
            const now = Date.now();
            const elapsedTime = now - plantObject.plantedTime;
            const progress = Math.min(1, elapsedTime / plantObject.growTime);

            for (let i = seedDetails.stages.length - 1; i >= 0; i--) {
                if (progress >= seedDetails.stages[i].threshold) {
                    currentStage = seedDetails.stages[i];
                    if (i === 0) stageName = "Seedling";
                    else if (i === seedDetails.stages.length - 1) stageName = "Almost Grown";
                    else stageName = "Growing...";
                    break;
                }
            }
            cellElement.classList.add('planted');
            cellElement.innerHTML = `
                <span class="plant-icon ${currentStage.sizeClass}">${currentStage.emoji}</span><br>${plantObject.name}<br>
                ${stageName}
            `;

            const progressBarContainer = document.createElement('div');
            progressBarContainer.classList.add('progress-bar-container');
            const progressBarFill = document.createElement('div');
            progressBarFill.classList.add('progress-bar-fill');
            progressBarFill.id = `progress-${cellElement.dataset.row}-${cellElement.dataset.col}`;
            progressBarFill.style.width = `${Math.floor(progress * 100)}%`;
            progressBarContainer.appendChild(progressBarFill);
            cellElement.appendChild(progressBarContainer);

        } else { // Plant is grown
            cellElement.classList.add('grown');
            const finalStage = seedDetails.stages[seedDetails.stages.length - 1];
            if (seedDetails.isMultiHarvest && plantObject.harvestsLeft > 0) {
                 cellElement.classList.add('multi-harvest-ready');
                 cellElement.innerHTML = `
                    <span class="plant-icon ${finalStage.sizeClass}">${finalStage.emoji}</span><br>
                    ${plantObject.name}<br>
                    READY (${plantObject.harvestsLeft})
                 `;
            } else {
                cellElement.innerHTML = `
                    <span class="plant-icon ${finalStage.sizeClass}">${finalStage.emoji}</span><br>
                    ${plantObject.name}<br>
                    READY
                `;
            }
        }
    } else {
        cellElement.classList.add('empty');
        cellElement.innerHTML = `<span class="plot-icon">🕳️</span><br>EMPTY`;
    }
}

function updateInventoryDisplay() {
    inventoryDisplay.innerHTML = '';

    if (Object.keys(game.inventory).length !== Object.keys(game.seedShop).length) {
        for (const seedType in game.seedShop) {
            game.inventory[seedType] = game.inventory[seedType] || 0;
        }
    }

    let hasSeeds = false;
    for (const seedType in game.inventory) {
        const quantity = game.inventory[seedType];
        const seedDetails = game.seedShop[seedType];

        if (seedDetails && quantity > 0) {
            hasSeeds = true;
            const inventoryItem = document.createElement('div');
            inventoryItem.classList.add('inventory-item');
            inventoryItem.dataset.seed = seedType;
            if (game.selectedSeedType === seedType) {
                inventoryItem.classList.add('selected');
            }

            inventoryItem.innerHTML = `
                <span class="seed-emoji">${seedDetails.seedEmoji}</span>
                <span class="seed-name">${seedDetails.name}</span>
                <span class="seed-quantity">x${quantity}</span>
                <button class="plant-from-inventory-btn" data-seed="${seedType}">Plant</button>
            `;
            inventoryDisplay.appendChild(inventoryItem);
        }
    }
    if (!hasSeeds) {
        inventoryDisplay.innerHTML = '<p class="no-seeds-message">Your inventory is empty. Buy seeds from the shop!</p>';
    }
}

// NEW: Function to update the display of harvested items
function updateHarvestedItemsDisplay() {
    harvestedItemsDisplay.innerHTML = ''; // Clear previous content

    if (game.harvestedItems.length === 0) {
        harvestedItemsDisplay.innerHTML = '<p class="no-harvested-message">You haven\'t harvested any crops yet!</p>';
        sellAllHarvestedBtn.style.display = 'none'; // Hide sell all button if no items
    } else {
        sellAllHarvestedBtn.style.display = 'block'; // Show sell all button
        game.harvestedItems.forEach((item, index) => {
            const harvestedItemDiv = document.createElement('div');
            harvestedItemDiv.classList.add('inventory-item', 'harvested-item'); // Reuse inventory-item styling
            harvestedItemDiv.innerHTML = `
                <span class="seed-emoji">${item.emoji}</span>
                <span class="seed-name">${item.name}</span>
                <span class="harvested-details">
                    (Wt: ${item.weight.toFixed(2)}kg, Val: ${item.sellValue})
                </span>
                <button class="plant-from-inventory-btn sell-harvested-btn" data-index="${index}">Sell</button>
            `;
            harvestedItemsDisplay.appendChild(harvestedItemDiv);
        });
    }
}