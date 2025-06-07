// js/ui/shopUI.js

import { seedShopData } from '../data/seedData.js'; 

// --- Shop Navigation Elements ---
const shopPages = document.querySelectorAll('.shop-page');
// IMPORTANT: Do NOT use getElementById for arrows here anymore, as IDs are repeated in HTML
// We will query for them dynamically or attach listeners to all of them.

// Keep track of the currently active shop's index
// 0: Seed Shop, 1: Gear & Tool Shop (if you add more, just extend this)
let currentShopIndex = 0;

// --- Shop Generation Functions ---

/**
 * Dynamically generates the HTML for the Seed Shop.
 */
export function generateSeedShopHTML() {
    const shopGrid = document.querySelector('#seedShop .seed-grid'); // Target the seed-grid within #seedShop
    if (!shopGrid) {
        console.error('Seed shop grid element not found!');
        return;
    }
    shopGrid.innerHTML = ''; // Clear existing content

    for (const [seedType, seedData] of Object.entries(seedShopData)) {
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
}

/**
 * Dynamically generates the HTML for the Gear & Tool Shop.
 * You'll expand this with actual tool data later.
 */
export function generateGearToolShopHTML() {
    const toolGrid = document.querySelector('#gearToolShop .tool-grid'); // Target the tool-grid within #gearToolShop
    if (!toolGrid) {
        console.error('Gear & Tool shop grid element not found!');
        return;
    }
    toolGrid.innerHTML = ''; // Clear existing content

    // --- Placeholder for actual tool data loading ---
    // You'd typically have a toolData.js similar to seedData.js
    const toolShopData = {
        shovel: { name: "Basic Shovel", price: 50, imagePath: "sprites/shovel.png" },
        wateringCan: { name: "Watering Can", price: 75, imagePath: "sprites/watering_can.png" },
        // Add more tools here
    };

    for (const [toolType, toolData] of Object.entries(toolShopData)) {
        const toolItemHTML = `
            <div class="tool-item" data-tool="${toolType}">
                <img class="tool-image" src="${toolData.imagePath}" alt="${toolData.name}">
                <div class="tool-info">
                    <span class="tool-name">${toolData.name}</span>
                    <span class="tool-price">$${toolData.price}</span>
                </div>
                <button class="buy-tool-btn" data-tool="${toolType}">Buy</button>
            </div>
        `;
        toolGrid.insertAdjacentHTML('beforeend', toolItemHTML);
    }
}


// --- Shop Navigation Logic ---

/**
 * Shows the shop page at the given index and updates arrow states.
 * @param {number} index - The index of the shop to show.
 */
function showShop(index) {
    // Hide all shop pages
    shopPages.forEach(page => {
        page.classList.remove('active-shop');
    });

    // Show the shop at the given index
    shopPages[index].classList.add('active-shop');

    // Update arrow button states for the newly active shop
    updateArrowStates();
}

/**
 * Updates the disabled state of the left and right arrows based on currentShopIndex.
 * This now queries for the arrows within the *currently active* shop page.
 */
function updateArrowStates() {
    const activeShopPage = shopPages[currentShopIndex];
    const currentLeftArrow = activeShopPage.querySelector('#shop-arrow-left');
    const currentRightArrow = activeShopPage.querySelector('#shop-arrow-right');

    if (currentLeftArrow) {
        currentLeftArrow.disabled = (currentShopIndex === 0); // Disable left if on first shop
    }
    if (currentRightArrow) {
        currentRightArrow.disabled = (currentShopIndex === shopPages.length - 1); // Disable right if on last shop
    }
}

/**
 * Attaches event listeners for shop navigation arrows.
 * This should be called once, e.g., from main.js after DOMContentLoaded.
 * It now attaches listeners to ALL arrows regardless of their shop page.
 */
export function setupShopNavigation() {
    const allShopArrows = document.querySelectorAll('.shop-arrow'); // Select all elements with class 'shop-arrow'

    allShopArrows.forEach(arrow => {
        arrow.addEventListener('click', (event) => {
            // Determine which arrow was clicked by its ID
            if (event.target.id === 'shop-arrow-right') {
                if (currentShopIndex < shopPages.length - 1) {
                    currentShopIndex++; // Move to the next shop
                    showShop(currentShopIndex);
                }
            } else if (event.target.id === 'shop-arrow-left') {
                if (currentShopIndex > 0) { // Check if we are NOT on the first shop
                    currentShopIndex--; // Move to the previous shop
                    showShop(currentShopIndex);
                }
            }
        });
    });

    // Initialize the display to show the first shop and set arrow states
    showShop(currentShopIndex);
}

// Consolidate the main shop initialization function
export function initializeShops() {
    generateSeedShopHTML();
    generateGearToolShopHTML(); // Generate tool shop content
    setupShopNavigation(); // Set up arrow listeners and initial shop display
}