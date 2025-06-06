export const seedShopData = {
    "carrot": {
        price: 10,
        stock: 10,
        growTime: 16.5 * 1000,
        minWeight: 0.1,
        maxWeight: 0.4,
        basePrice: 85.5,
        name: "Carrot",
        seedIcon: "sprites/seed_box.png",
        stages: [
            { threshold: 0, imagePath: "sprites/seedling.png", sizeClass: "small" },
            { threshold: 0.3, imagePath: "sprites/herb.png", sizeClass: "medium" },
            { threshold: 0.7, imagePath: "sprites/carrot.png", sizeClass: "large" },
            { threshold: 1, imagePath: "sprites/carrot.png", sizeClass: "xlarge" }
        ]
    },
    "tomato": {
        price: 800,
        stock: 10,
        growTime: 1.5 * 60 * 1000,
        minWeight: 0.25,
        maxWeight: 1.02,
        basePrice: 105.85,  // Updated base price
        name: "Tomato",
        seedIcon: "sprites/seed_box.png",
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
        stock: 10,
        growTime: 2 * 60 * 1000,
        minWeight: 2.0,
        maxWeight: 2.8,
        basePrice: 15.8,
        name: "Corn",
        seedIcon: "sprites/seed_box.png",
        stages: [
            { threshold: 0, imagePath: "sprites/seedling.png", sizeClass: "small" },
            { threshold: 0.3, imagePath: "sprites/herb.png", sizeClass: "medium" },
            { threshold: 0.6, imagePath: "sprites/corn.png", sizeClass: "large" },
            { threshold: 1, imagePath: "sprites/corn.png", sizeClass: "xlarge" }
        ]
    }
};