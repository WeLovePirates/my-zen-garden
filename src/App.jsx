import React, { useState, useEffect, useCallback } from 'react';

// Seed data for the game
const SEEDS = [
  { id: 'carrot', name: 'Carrot Seed', price: 10, growTime: 30 * 1000, sellPrice: 25, emoji: '🥕' }, // 30 seconds
  { id: 'tomato', name: 'Tomato Seed', price: 20, growTime: 60 * 1000, sellPrice: 45, emoji: '🍅' }, // 60 seconds
  { id: 'corn', name: 'Corn Seed', price: 30, growTime: 90 * 1000, sellPrice: 70, emoji: '🌽' },   // 90 seconds
];

// Helper function to calculate growth stage
const calculateGrowthStage = (plantedTime, growTime) => {
  if (!plantedTime) return 0;
  const now = Date.now();
  const elapsed = now - plantedTime;
  return Math.min(1, elapsed / growTime); // Returns a value between 0 and 1
};

// Main App component
const App = () => {
  // Initialize state from local storage or set default values
  const [money, setMoney] = useState(() => {
    try {
      const savedMoney = localStorage.getItem('myZenGarden_money');
      return savedMoney ? JSON.parse(savedMoney) : 100; // Starting money
    } catch (error) {
      console.error("Error loading money from local storage:", error);
      return 100;
    }
  });

  const [garden, setGarden] = useState(() => {
    try {
      const savedGarden = localStorage.getItem('myZenGarden_garden');
      return savedGarden ? JSON.parse(savedGarden) : Array(9).fill(null); // 3x3 grid
    } catch (error) {
      console.error("Error loading garden from local storage:", error);
      return Array(9).fill(null);
    }
  });

  const [inventory, setInventory] = useState(() => {
    try {
      const savedInventory = localStorage.getItem('myZenGarden_inventory');
      return savedInventory ? JSON.parse(savedInventory) : {};
    } catch (error) {
      console.error("Error loading inventory from local storage:", error);
      return {};
    }
  });

  const [selectedSeed, setSelectedSeed] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // No loading state needed for local storage init

  // Effect to save game data to local storage whenever money, garden, or inventory changes
  useEffect(() => {
    try {
      localStorage.setItem('myZenGarden_money', JSON.stringify(money));
      localStorage.setItem('myZenGarden_garden', JSON.stringify(garden));
      localStorage.setItem('myZenGarden_inventory', JSON.stringify(inventory));
      console.log("Game data saved to local storage.");
    } catch (error) {
      console.error("Error saving data to local storage:", error);
      setMessage("Failed to save game progress locally.");
    }
  }, [money, garden, inventory]); // Dependencies for saving

  // Handle planting a seed
  const handlePlant = (plotIndex) => {
    if (!selectedSeed) {
      setMessage("Please select a seed to plant first!");
      return;
    }
    if (garden[plotIndex]) {
      setMessage("This plot is already occupied!");
      return;
    }
    if (money < selectedSeed.price) {
      setMessage("Not enough money to buy this seed!");
      return;
    }

    const newGarden = [...garden];
    newGarden[plotIndex] = {
      seedId: selectedSeed.id,
      plantedTime: Date.now(),
      growTime: selectedSeed.growTime,
      sellPrice: selectedSeed.sellPrice,
      emoji: selectedSeed.emoji,
    };
    const newMoney = money - selectedSeed.price;

    setGarden(newGarden);
    setMoney(newMoney);
    setSelectedSeed(null); // Deselect after planting
    setMessage(`${selectedSeed.name} planted!`);
  };

  // Handle harvesting a plant
  const handleHarvest = (plotIndex) => {
    const plant = garden[plotIndex];
    if (!plant) {
      setMessage("Nothing to harvest here!");
      return;
    }
    const growth = calculateGrowthStage(plant.plantedTime, plant.growTime);
    if (growth < 1) {
      setMessage("Plant is not fully grown yet!");
      return;
    }

    const newGarden = [...garden];
    newGarden[plotIndex] = null; // Clear the plot

    const newMoney = money + plant.sellPrice;
    setGarden(newGarden);
    setMoney(newMoney);
    setMessage(`Harvested ${plant.emoji} and earned ${plant.sellPrice} coins!`);
  };

  // Render the game UI
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p className="text-xl">Loading Zen Garden...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 to-green-900 text-white p-4 sm:p-8 flex flex-col items-center font-inter">
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <script src="https://cdn.tailwindcss.com"></script>

      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        body {
          font-family: 'Inter', sans-serif;
        }
        .plant-animation {
          animation: pulse 1s infinite alternate;
        }
        @keyframes pulse {
          from { transform: scale(1); }
          to { transform: scale(1.05); }
        }
        `}
      </style>

      <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-yellow-300 drop-shadow-lg text-center italic">My Zen Garden</h1>

      <div className="bg-green-800 bg-opacity-70 rounded-xl p-4 sm:p-6 mb-6 shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <p className="text-xl font-semibold">💰 Money: <span className="text-yellow-400">{money}</span></p>
        </div>
        {message && (
          <div className="bg-blue-600 text-white p-3 rounded-lg mb-4 text-center font-medium">
            {message}
          </div>
        )}
      </div>

      {/* Garden Grid */}
      <div className="grid grid-cols-3 gap-4 bg-green-800 bg-opacity-70 rounded-xl p-4 sm:p-6 shadow-lg mb-8 max-w-lg w-full">
        {garden.map((plant, index) => {
          const growthStage = plant ? calculateGrowthStage(plant.plantedTime, plant.growTime) : 0;
          const isReady = plant && growthStage >= 1;

          return (
            <div
              key={index}
              className={`relative w-full h-28 sm:h-32 rounded-lg flex items-center justify-center text-5xl sm:text-6xl cursor-pointer transition-all duration-200
                ${plant ? (isReady ? 'bg-yellow-500 hover:bg-yellow-400' : 'bg-green-600 hover:bg-green-500') : 'bg-gray-700 hover:bg-gray-600'}
                ${selectedSeed && !plant ? 'border-4 border-blue-400' : ''}
              `}
              onClick={() => plant ? handleHarvest(index) : handlePlant(index)}
            >
              {plant ? (
                <>
                  <span className={`block ${isReady ? 'plant-animation' : ''}`}>{plant.emoji}</span>
                  {!isReady && (
                    <div className="absolute bottom-2 w-4/5 h-2 bg-gray-300 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-400 rounded-full"
                        style={{ width: `${growthStage * 100}%` }}
                      ></div>
                    </div>
                  )}
                </>
              ) : (
                <span className="text-gray-400 text-2xl">Empty</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Seed Shop */}
      <div className="bg-green-800 bg-opacity-70 rounded-xl p-4 sm:p-6 shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center text-yellow-300">Seed Shop</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SEEDS.map((seed) => (
            <button
              key={seed.id}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200
                ${selectedSeed && selectedSeed.id === seed.id ? 'bg-blue-500 border-blue-400' : 'bg-green-700 border-green-600 hover:bg-green-600'}
              `}
              onClick={() => setSelectedSeed(seed)}
            >
              <span className="text-4xl mb-1">{seed.emoji}</span>
              <span className="font-semibold text-lg">{seed.name}</span>
              <span className="text-sm text-gray-200">Price: {seed.price} 💰</span>
              <span className="text-xs text-gray-300">Grows in: {seed.growTime / 1000}s</span>
            </button>
          ))}
        </div>
        {selectedSeed && (
          <p className="text-center mt-4 text-lg text-blue-300">
            Selected: {selectedSeed.name}. Click an empty plot to plant!
          </p>
        )}
      </div>
    </div>
  );
};

export default App;