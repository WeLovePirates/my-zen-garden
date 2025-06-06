// js/ui/eventListeners.js
import { game, plotGrid, buySeedButtons, inventoryDisplay, harvestedItemsDisplay, collectAllBtn, sellAllHarvestedBtn, toolsListDisplay } from '../game/gameState.js'; // Added toolsListDisplay
import { handleBuySeed, plantSeed, harvestPlant, selectSeedForPlanting, sellHarvestedItem, sellAllHarvestedItems, saveGame, collectAllHarvestablePlants } from '../game/game.js';
import { showMessage, updateInventoryDisplay, createPlotUI } from './uiUpdates.js'; // Assuming createPlotUI or updatePlotUI will refresh the plot

import { selectTool, handleCropClick } from '../game/tools.js'; // Import tool-related functions

export function attachEventListeners() {
    // Replace the buySeedButtons event listener with this
    document.querySelector('.seed-grid').addEventListener('click', (event) => {
        const seedItem = event.target.closest('.seed-item');
        if (seedItem) {
            const seedType = seedItem.dataset.seed;
            handleBuySeed(seedType);
        }
    });

    collectAllBtn.addEventListener('click', collectAllHarvestablePlants);

    sellAllHarvestedBtn.addEventListener('click', sellAllHarvestedItems);

    // Add tool button listeners
    toolsListDisplay.addEventListener('click', (e) => {
        if (e.target.classList.contains('tool-use-btn')) {
            const toolKey = e.target.dataset.tool;
            selectTool(toolKey);
        }
    });

    // Modify your existing plot click handler to include tool handling
    plotGrid.addEventListener('click', (event) => {
        const cell = event.target.closest('.plot-cell');
        if (cell) {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            // First check if a tool is selected and handle it
            if (game.selectedTool) {
                // handleCropClick should return true if it successfully performed an action
                const wasHandled = handleCropClick(row, col);
                if (wasHandled) {
                    // If the tool handled the click, update the UI
                    // Assuming createPlotUI refreshes the entire plot
                    createPlotUI(); 
                    saveGame(); // Save game state after tool use
                    return; // Stop further processing as tool action was performed
                }
            }
            
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