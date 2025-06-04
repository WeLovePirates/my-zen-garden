// js/data.js

const seedShopData = {
    "carrot": {
        price: 10,
        growTime: 15 * 1000, // 15 seconds
        baseSellPrice: 150, // ADJUSTED for linear scaling, ensuring value increases with weight
        minWeight: 0.1,    // Realistic min weight for a carrot (0.1 kg = 100g)
        maxWeight: 0.4,    // Realistic max weight for a carrot (0.4 kg = 400g)
        name: "Carrot",
        seedIcon: "sprites/seed_box.png", // Generic seed box icon
        stages: [
            { threshold: 0, imagePath: "sprites/seedling.png", sizeClass: "small" },
            { threshold: 0.3, imagePath: "sprites/herb.png", sizeClass: "medium" },
            { threshold: 0.7, imagePath: "sprites/carrot.png", sizeClass: "large" },
            { threshold: 1, imagePath: "sprites/carrot.png", sizeClass: "xlarge" }
        ]
    },
    "tomato": {
        price: 50,
        growTime: 45 * 1000, // 45 seconds
        baseSellPrice: 600, // Adjusted for smaller profit margins (from previous conversation)
        minWeight: 0.15,   // Realistic min weight for a tomato (0.15 kg = 150g)
        maxWeight: 0.6,    // Realistic max weight for a tomato (0.6 kg = 600g)
        name: "Tomato",
        seedIcon: "sprites/seed_box.png", // Generic seed box icon
        stages: [
            { threshold: 0, imagePath: "sprites/seedling.png", sizeClass: "small" },
            { threshold: 0.25, imagePath: "sprites/herb.png", sizeClass: "medium" }, // Using herb for early growth
            { threshold: 0.6, imagePath: "sprites/tomato.png", sizeClass: "large" },
            { threshold: 1, imagePath: "sprites/tomato.png", sizeClass: "xlarge" }
        ]
    },
    "corn": {
        price: 200,
        growTime: 2 * 60 * 1000, // 2 minutes
        baseSellPrice: 1750, // Adjusted for smaller profit margins (from previous conversation)
        minWeight: 0.2,    // Realistic min weight for corn (0.2 kg = 200g per cob)
        maxWeight: 0.5,    // Realistic max weight for corn (0.5 kg = 500g per cob)
        name: "Corn",
        seedIcon: "sprites/seed_box.png", // Generic seed box icon
        stages: [
            { threshold: 0, imagePath: "sprites/seedling.png", sizeClass: "small" },
            { threshold: 0.2, imagePath: "sprites/herb.png", sizeClass: "medium" }, // Using corn for early growth as well
            { threshold: 0.5, imagePath: "sprites/corn.png", sizeClass: "large" },
            { threshold: 1, imagePath: "sprites/corn.png", sizeClass: "xlarge" }
        ]
    }
};