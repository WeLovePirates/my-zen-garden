// js/data.js

const seedShopData = {
    "carrot": {
        price: 10,
        growTime: 15 * 1000, // 15 seconds
        baseSellPrice: 150, // ADJUSTED for linear scaling, ensuring value increases with weight
        minWeight: 0.1,    // Realistic min weight for a carrot (0.1 kg = 100g)
        maxWeight: 0.4,    // Realistic max weight for a carrot (0.4 kg = 400g)
        name: "Carrot",
        seedEmoji: "🥕",
        stages: [
            { threshold: 0, emoji: "🌱", sizeClass: "small" },
            { threshold: 0.3, emoji: "🥕", sizeClass: "medium" },
            { threshold: 0.7, emoji: "🥕", sizeClass: "large" },
            { threshold: 1, emoji: "🥕", sizeClass: "xlarge" }
        ]
    },
    "tomato": {
        price: 50,
        growTime: 45 * 1000, // 45 seconds
        baseSellPrice: 600, // Adjusted for smaller profit margins (from previous conversation)
        minWeight: 0.15,   // Realistic min weight for a tomato (0.15 kg = 150g)
        maxWeight: 0.6,    // Realistic max weight for a tomato (0.6 kg = 600g)
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
        growTime: 2 * 60 * 1000, // 2 minutes
        baseSellPrice: 1750, // Adjusted for smaller profit margins (from previous conversation)
        minWeight: 0.2,    // Realistic min weight for corn (0.2 kg = 200g per cob)
        maxWeight: 0.5,    // Realistic max weight for corn (0.5 kg = 500g per cob)
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