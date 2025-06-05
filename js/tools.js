// js/tools.js

/**
 * Toggles the active state of the shovel tool.
 * When activated, it changes the cursor and adds a visual indicator to planted plots.
 * When deactivated, it reverts these changes.
 */
function toggleShovelActive() {
    // Access global 'game' object, 'showMessage' from ui.js, and 'useShovelBtn' from game.js
    // These are globally accessible in this non-module setup.
    if (game.selectedTool === 'shovel') {
        game.selectedTool = null; // Deactivate shovel
        showMessage('Shovel deactivated.', 'info');
        useShovelBtn.classList.remove('active');
        document.body.classList.remove('shovel-active');
    } else {
        game.selectedTool = 'shovel'; // Activate shovel
        showMessage('Shovel activated. Click a planted plot to dig up!', 'info');
        useShovelBtn.classList.add('active');
        document.body.classList.add('shovel-active');
        // Deselect any seed if one was selected
        if (game.selectedSeedType) {
            game.selectedSeedType = null;
            showMessage('Seed selection cleared. Shovel is active.', 'info');
            // You might want to add UI feedback for seed deselection here if you have active seed highlighting
        }
    }
    // Update all plot visuals to show/hide shovel-target class
    // Access global 'plotGrid' and 'updateCellVisual' from ui.js
    const plotCells = plotGrid.querySelectorAll('.plot-cell');
    plotCells.forEach((cell) => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        updateCellVisual(cell, game.plot[row][col]);
    });
}

/**
 * Digs up a plant at the specified plot coordinates.
 * Prompts the user for confirmation before deleting the plant.
 *
 * @param {number} row - The row index of the plot.
 * @param {number} col - The column index of the plot.
 */
function digUpPlant(row, col) {
    const plant = game.plot[row][col];
    if (plant) {
        // Confirmation dialog
        if (confirm(`Are you sure you want to dig up the ${plant.name}? You will NOT get the seed back.`)) {
            game.plot[row][col] = null; // Delete the plant
            // Access global 'plotGrid' and 'updateCellVisual' from ui.js
            updateCellVisual(plotGrid.children[row * 3 + col], null); // Update UI to show empty plot
            showMessage(`Successfully dug up the ${plant.name} from (${row},${col}).`, 'success');
            // Access global 'saveGame' from logic.js
            saveGame();
        } else {
            showMessage('Digging cancelled.', 'info');
        }
    } else {
        showMessage('There is nothing to dig up here!', 'error');
    }
    // Always deactivate shovel after an attempt to dig (whether successful or not, or nothing was there)
    toggleShovelActive();
}