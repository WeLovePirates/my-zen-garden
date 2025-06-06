// js/ui/shopUI.js

import { seedShopData } from '../data/seedData.js'; // <-- CHANGE THIS LINE

/**
 * Dynamically generates the shop HTML from seedShopData.
 */
export function generateShopHTML() {
    const shopGrid = document.querySelector('.seed-grid');
    if (!shopGrid) {
        console.error('Shop grid element not found!');
        return;
    }
    shopGrid.innerHTML = ''; // Clear existing content

    for (const [seedType, seedData] of Object.entries(seedShopData)) {
        // Find the image path for the fully grown stage
        const fullyGrownImagePath = seedData.stages[seedData.stages.length - 1].imagePath;

        const seedItemHTML = `
            <div class="seed-item" data-seed="${seedType}">
                <span class="stock-count">${seedData.stock}</span>
                <img class="seed-image" src="${fullyGrownImagePath}" alt="${seedData.name}">
                <div class="seed-info">
                    <span class="seed-name">${seedData.name} Seed</span>
                    <span class="seed-price">$${seedData.price}</span>
                </div>
                <button class="buy-seed-btn" data-seed="${seedType}">Buy</button>
            </div>
        `;
        shopGrid.insertAdjacentHTML('beforeend', seedItemHTML);
    }

    // Remember to re-attach event listeners for buy buttons here if they are detached
    // For example: setupBuyButtonListeners();
}