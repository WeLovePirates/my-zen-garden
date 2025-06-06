export const seedShopData = {
    "carrot": {
        price: 10,
        minStock: 5,
        maxStock: 25,
        growTime: 10 * 1000, // 10 seconds
        minWeight: 0.1,
        maxWeight: 0.4,
        minSellPrice: 15,
        maxSellPrice: 35,
        name: "Carrot",
        seedIcon: "sprites/seed_box.png",
        stockRate: 1.0,
        stages: [
            { threshold: 0, imagePath: "sprites/seedling.png", sizeClass: "small" },
            { threshold: 0.3, imagePath: "sprites/herb.png", sizeClass: "medium" },
            { threshold: 0.7, imagePath: "sprites/carrot.png", sizeClass: "large" },
            { threshold: 1, imagePath: "sprites/carrot.png", sizeClass: "xlarge" }
        ]
    },
    "tomato": {
        price: 800,
        minStock: 1,
        maxStock: 3,
        initialGrowTime: 1200 * 1000, // 1200 seconds initial
        growTime: 120 * 1000, // 120 seconds subsequent
        minWeight: 0.25,
        maxWeight: 1.02,
        minSellPrice: 100,
        maxSellPrice: 250,
        name: "Tomato",
        seedIcon: "sprites/seed_box.png",
        stockRate: 1.0,
        isMultiHarvest: true,
        harvestsLeft: -1,
        stages: [
            { threshold: 0, imagePath: "sprites/seedling.png", sizeClass: "small" },
            { threshold: 0.3, imagePath: "sprites/herb.png", sizeClass: "medium" },
            { threshold: 0.6, imagePath: "sprites/tomato.png", sizeClass: "large" },
            { threshold: 1, imagePath: "sprites/tomato.png", sizeClass: "xlarge" }
        ]
    },
    "corn": {
        price: 1300,
        minStock: 1,
        maxStock: 4,
        initialGrowTime: 1800 * 1000, // 1800 seconds initial
        growTime: 175 * 1000, // 175 seconds subsequent
        minWeight: 2.0,
        maxWeight: 2.8,
        minSellPrice: 200,
        maxSellPrice: 400,
        name: "Corn",
        seedIcon: "sprites/seed_box.png",
        stockRate: 0.17,
        isMultiHarvest: true,
        harvestsLeft: -1,
        stages: [
            { threshold: 0, imagePath: "sprites/seedling.png", sizeClass: "small" },
            { threshold: 0.3, imagePath: "sprites/herb.png", sizeClass: "medium" },
            { threshold: 0.6, imagePath: "sprites/corn.png", sizeClass: "large" },
            { threshold: 1, imagePath: "sprites/corn.png", sizeClass: "xlarge" }
        ]
    }
};