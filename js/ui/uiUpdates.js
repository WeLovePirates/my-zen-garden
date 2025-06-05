// js/ui/uiUpdates.js
import { game, moneyDisplay, messageArea, plotGrid, inventoryDisplay, harvestedItemsDisplay, sellAllHarvestedBtn, toolsListDisplay } from '../game/gameState.js';

export function updateMoneyDisplay() {
    moneyDisplay.textContent = game.money;
}

export function showMessage(message, type = 'info') {
    messageArea.textContent = message;
    messageArea.className = `message ${type}`;
    setTimeout(() => {
        if (messageArea.textContent === message) {
            messageArea.textContent = 'Ready for action!';
            messageArea.className = 'message info';
        }
    }, 5000);
}

export function createPlotUI() {
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

export function updateCellVisual(cellElement, plantObject) {
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
                <img class="plant-icon ${currentStage.sizeClass}" src="${currentStage.imagePath}" alt="${plantObject.name} Stage">${plantObject.name}<br>
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
            if (seedDetails.isMultiHarvest && (plantObject.harvestsLeft > 0 || plantObject.harvestsLeft === -1)) {
                cellElement.classList.add('multi-harvest-ready');
                cellElement.innerHTML = `
                    <img class="plant-icon ${finalStage.sizeClass}" src="${finalStage.imagePath}" alt="${plantObject.name} Grown">
                    ${plantObject.name}<br>
                    READY ${plantObject.harvestsLeft === -1 ? '' : `(${plantObject.harvestsLeft})`}
                `;
            } else {
                cellElement.innerHTML = `
                    <img class="plant-icon ${finalStage.sizeClass}" src="${finalStage.imagePath}" alt="${plantObject.name} Grown">
                    ${plantObject.name}<br>
                    READY
                `;
            }
        }
    } else {
        cellElement.classList.add('empty');
        cellElement.innerHTML = `<img class="plot-icon" src="sprites/hole.png" alt="Empty Plot"><br>EMPTY`;
    }
}

// Function to update the display of inventory items
export function updateInventoryDisplay() {
    inventoryDisplay.innerHTML = ''; // Clear previous content

    let hasSeeds = false;
    for (const seedType in game.inventory) {
        if (game.inventory[seedType] > 0) {
            hasSeeds = true;
            const seedDetails = game.seedShop[seedType];
            const inventoryItemDiv = document.createElement('div');
            inventoryItemDiv.classList.add('inventory-item');
            if (game.selectedSeedType === seedType) {
                inventoryItemDiv.classList.add('selected');
            }
            inventoryItemDiv.innerHTML = `
                <img class="seed-icon" src="${seedDetails.seedIcon}" alt="${seedDetails.name} Seed">
                <span class="seed-name">${seedDetails.name} Seeds</span>
                <span class="seed-quantity">x${game.inventory[seedType]}</span>
                <button class="plant-from-inventory-btn" data-seed="${seedType}">
                    ${game.selectedSeedType === seedType ? 'Selected' : 'Plant'}
                </button>
            `;
            inventoryDisplay.appendChild(inventoryItemDiv);
        }
    }

    if (!hasSeeds) {
        inventoryDisplay.innerHTML = '<p class="no-seeds-message">Your seed inventory is empty!</p>';
    }
}

// Function to update the display of harvested items
export function updateHarvestedItemsDisplay() {
    harvestedItemsDisplay.innerHTML = ''; // Clear previous content

    if (game.harvestedItems.length === 0) {
        harvestedItemsDisplay.innerHTML = '<p class="no-harvested-message">No harvested items yet!</p>';
        sellAllHarvestedBtn.style.display = 'none'; // Hide "Sell All" button
    } else {
        sellAllHarvestedBtn.style.display = 'block'; // Show "Sell All" button
        game.harvestedItems.forEach((item, index) => {
            const harvestedItemDiv = document.createElement('div');
            harvestedItemDiv.classList.add('inventory-item', 'harvested-item'); // Apply similar styling classes
            harvestedItemDiv.innerHTML = `
                <img class="seed-icon" src="sprites/${item.name.toLowerCase()}.png" alt="${item.name}">
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

// Function to update the display of tools
export function updateToolsDisplay() {
    toolsListDisplay.innerHTML = ''; // Clear previous content

    if (Object.keys(game.tools).length === 0) {
        toolsListDisplay.innerHTML = '<p class="no-tools-message">You have no tools yet!</p>';
    } else {
        for (const toolKey in game.tools) {
            const tool = game.tools[toolKey];
            // Since shovel is a permanent item, we display it if it exists
            if (tool) {
                const toolItemDiv = document.createElement('div');
                // Apply similar styling classes to inventory items
                toolItemDiv.classList.add('inventory-item', 'tool-item'); 
                
                // Add selected class if this tool is selected
                if (game.selectedTool === toolKey) {
                    toolItemDiv.classList.add('selected');
                }
                
                // Using the same structure as inventory items
                toolItemDiv.innerHTML = `
                    <div style="display: flex; align-items: center;">
                        <img class="seed-icon" src="${tool.imagePath}" alt="${tool.name}">
                        <span class="tool-name">${tool.name}</span>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <button class="tool-use-btn" data-tool="${toolKey}">
                            ${game.selectedTool === toolKey ? 'Selected' : 'Use'}
                        </button>
                    </div>
                `;
                toolsListDisplay.appendChild(toolItemDiv);
            }
        }
    }
}