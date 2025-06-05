// js/ui/eventListeners.js
import { game, plotGrid, buySeedButtons, inventoryDisplay, harvestedItemsDisplay, collectAllBtn, sellAllHarvestedBtn } from '../game/gameState.js';
import { handleBuySeed, plantSeed, harvestPlant, selectSeedForPlanting, sellHarvestedItem, sellAllHarvestedItems, saveGame, collectAllHarvestablePlants } from '../game/game.js';
import { showMessage, updateInventoryDisplay } from './uiUpdates.js';

export function attachEventListeners() {
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