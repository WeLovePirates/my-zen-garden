export const seedShopData = {
    "carrot": {
        price: 10,
        stock: 10,
        growTime: 6.5 * 1000,
        minWeight: 0.1,
        maxWeight: 0.4,
        basePrice: 324.2123300206823,
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
        minWeight: 0.15,
        maxWeight: 0.65,
        basePrice: 45.85,  // Updated base price
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
        basePrice: 4.8,
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