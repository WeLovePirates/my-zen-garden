// js/data.js

const seedShopData = {
    "carrot": {
        price: 10,
        growTime: 15 * 1000, // 15 seconds (much shorter for beginners!)
        sellPrice: 25,
        name: "Carrot",
        seedEmoji: "🥕",
        stages: [ // Define growth stages
            { threshold: 0, emoji: "🌱", sizeClass: "small" },     // Seedling
            { threshold: 0.3, emoji: "🥕", sizeClass: "medium" },    // Small carrot
            { threshold: 0.7, emoji: "🥕", sizeClass: "large" },     // Medium carrot
            { threshold: 1, emoji: "🥕", sizeClass: "xlarge" }     // Fully grown carrot
        ]
    },
    "tomato": {
        price: 50,
        growTime: 45 * 1000, // 45 seconds (much shorter for beginners!)
        sellPrice: 150,
        name: "Tomato",
        seedEmoji: "🍅",
        stages: [
            { threshold: 0, emoji: "🌱", sizeClass: "small" },
            { threshold: 0.25, emoji: "🌿", sizeClass: "medium" },
            { threshold: 0.6, emoji: "🍅", sizeClass: "large" },
            { threshold: 1, emoji: "🍅", sizeClass: "xlarge" }
        ]
    },
    "corn": {
        price: 200,
        growTime: 2 * 60 * 1000, // 2 minutes (much shorter for beginners!)
        sellPrice: 500,
        name: "Corn",
        seedEmoji: "🌽",
        stages: [
            { threshold: 0, emoji: "🌱", sizeClass: "small" },
            { threshold: 0.2, emoji: "🌾", sizeClass: "medium" },
            { threshold: 0.5, emoji: "🌽", sizeClass: "large" },
            { threshold: 1, emoji: "🌽", sizeClass: "xlarge" }
        ]
    }
};