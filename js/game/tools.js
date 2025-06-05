import { game } from './gameState.js';
import { updateToolsDisplay } from '../ui/uiUpdates.js';
import { saveGame } from './game.js';
import { showMessage } from '../ui/uiUpdates.js';

export function selectTool(toolKey) {
    if (game.selectedTool === toolKey) {
        // If the tool is already selected, deselect it
        game.selectedTool = null;
    } else {
        // Select the new tool
        game.selectedTool = toolKey;
        // Deselect any selected seed when a tool is selected
        game.selectedSeedType = null;
    }
    updateToolsDisplay();
}

export function handleCropClick(row, col) {
    if (game.selectedTool === 'shovel') {
        if (game.plot[row][col]) {
            // Remove the crop
            game.plot[row][col] = null;
            // Deselect the shovel after removing the crop
            game.selectedTool = null;
            updateToolsDisplay();
            showMessage('Crop removed!', 'info');
            saveGame();
            return true; // Indicate that the crop was removed
        }
    }
    return false; // Indicate that no crop was removed
}