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
        isMultiHarvest: false, // Carrots are not multi-harvest
        stages: [
            { threshold: 0, imagePath: "sprites/seedling.png", sizeClass: "small" },
            { threshold: 0.3, imagePath: "sprites/herb.png", sizeClass: "medium" },
            { threshold: 0.7, imagePath: "sprites/carrot.png", sizeClass: "large" },
            { threshold: 1, imagePath: "sprites/carrot.png", sizeClass: "xlarge" }
        ]
    },
    "strawberry": {
        price: 50,
        minStock: 1,
        maxStock: 6,
        initialGrowTime: 10 * 1000, 
        growTime: 8 * 1000, 
        initialGrowTime: 6500, // Corrected to 6.5 seconds (within 5-8s range)
        growTime: 10 * 1000, // Corrected to 10 seconds subsequent
        minWeight: 0.20,
        maxWeight: 0.50,
        minSellPrice: 14,
        maxSellPrice: 22,
        name: "Strawberry",
        seedIcon: "sprites/seed_box.png",
        stockRate: 1.0,
        isMultiHarvest: true,
        harvestsLeft: -1, // -1 for infinite harvests
        stages: [
            { threshold: 0, imagePath: "sprites/seedling.png", sizeClass: "small" },
            { threshold: 0.3, imagePath: "sprites/herb.png", sizeClass: "medium" },
            { threshold: 0.6, imagePath: "sprites/strawberry.png", sizeClass: "large" },
            { threshold: 1, imagePath: "sprites/strawberry.png", sizeClass: "xlarge" }
        ]
    },
    "blueberry": {
        price: 400,
        minStock: 1,
        maxStock: 5,
        initialGrowTime: 105 * 1000, 
        growTime: 22 * 1000, 
        minWeight: 0.20,
        maxWeight: 0.40,
        minSellPrice: 20,
        maxSellPrice: 42,
        name: "Blueberry",
        seedIcon: "sprites/seed_box.png",
        stockRate: 1.0,
        isMultiHarvest: true,
        harvestsLeft: -1, // -1 for infinite harvests
        stages: [
            { threshold: 0, imagePath: "sprites/seedling.png", sizeClass: "small" },
            { threshold: 0.3, imagePath: "sprites/herb.png", sizeClass: "medium" },
            { threshold: 0.6, imagePath: "sprites/blueberry.png", sizeClass: "large" },
            { threshold: 1, imagePath: "sprites/blueberry.png", sizeClass: "xlarge" }
        ]
    },
    "tulip": {
        price: 600,
        minStock: 5,
        maxStock: 25,
        growTime: 6 * 1000,
        minWeight: 0.1,
        maxWeight: 0.75,
        minSellPrice: 767,
        maxSellPrice: 1000,
        name: "Tulip",
        seedIcon: "sprites/seed_box.png",
        stockRate: 0.333, // Updated to 33.3%
        isMultiHarvest: false,
        stages: [
            { threshold: 0, imagePath: "sprites/seedling.png", sizeClass: "small" },
            { threshold: 0.3, imagePath: "sprites/herb.png", sizeClass: "medium" },
            { threshold: 0.7, imagePath: "sprites/tulip.png", sizeClass: "large" },
            { threshold: 1, imagePath: "sprites/tulip.png", sizeClass: "xlarge" }
        ]
    },
    "tomato": {
        price: 800,
        minStock: 1,
        maxStock: 3,
        initialGrowTime: 300 * 1000, // 1200 seconds initial
        growTime: 120 * 1000, // 120 seconds subsequent
        minWeight: 0.25,
        maxWeight: 1.02,
        minSellPrice: 100,
        maxSellPrice: 250,
        name: "Tomato",
        seedIcon: "sprites/seed_box.png",
        stockRate: 1.0,
        isMultiHarvest: true,
        harvestsLeft: -1, // -1 for infinite harvests
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
        initialGrowTime: 390 * 1000, // 1800 seconds initial
        growTime: 175 * 1000, // 175 seconds subsequent
        minWeight: 2.0,
        maxWeight: 2.8,
        minSellPrice: 200,
        maxSellPrice: 400,
        name: "Corn",
        seedIcon: "sprites/seed_box.png",
        stockRate: 0.17, // Updated to 17%
        isMultiHarvest: false, // Corn is not multi-harvest
        stages: [
            { threshold: 0, imagePath: "sprites/seedling.png", sizeClass: "small" },
            { threshold: 0.3, imagePath: "sprites/herb.png", sizeClass: "medium" },
            { threshold: 0.7, imagePath: "sprites/corn_stalk.png", sizeClass: "large" },
            { threshold: 1, imagePath: "sprites/corn.png", sizeClass: "xlarge" }
        ]
    }
};