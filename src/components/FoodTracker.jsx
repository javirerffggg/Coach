import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { format } from 'date-fns';

const FoodTracker = ({ onNavigate }) => {
  const foods = useStore((state) => state.foods);
  const dailyMeals = useStore((state) => state.dailyMeals);
  const currentMacros = useStore((state) => state.currentMacros);
  const addMealEntry = useStore((state) => state.addMealEntry);
  const removeMealEntry = useStore((state) => state.removeMealEntry);
  const calculateDailyProgress = useStore((state) => state.calculateDailyProgress);

  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [showFoodSelector, setShowFoodSelector] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayMeals = dailyMeals[today] || {
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: [],
  };

  const todayProgress = calculateDailyProgress(today);

  const mealTypes = [
    { id: 'breakfast', label: 'Desayuno', icon: '🌅' },
    { id: 'lunch', label: 'Comida', icon: '☀️' },
    { id: 'dinner', label: 'Cena', icon: '🌙' },
    { id: 'snacks', label: 'Snacks', icon: '🍎' },
  ];

  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddFood = () => {
    if (!selectedFood || quantity <= 0) return;

    const multiplier = quantity / 100;
    const entry = {
      foodName: selectedFood.name,
      quantity: quantity,
      calories: Math.round(selectedFood.calories * multiplier),
      protein: Math.round(selectedFood.protein * multiplier * 10) / 10,
      fat: Math.round(selectedFood.fat * multiplier * 10) / 10,
      carbs: Math.round(selectedFood.carbs * multiplier * 10) / 10,
    };

    addMealEntry(today, selectedMeal, entry);
    setShowFoodSelector(false);
    setSelectedFood(null);
    setQuantity(100);
    setSearchTerm('');
  };

  const handleRemoveEntry = (entryId) => {
    removeMealEntry(today, selectedMeal, entryId);
  };

  const calculatePercentage = (current, target) => {
    if (!target) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-6">
        <button
          onClick={() => onNavigate('dashboard')}
          className="text-blue-200 hover:text-white mb-4 flex items-center"
        >
          ← Volver
        </button>
        <h1 className="text-2xl font-bold text-white">Seguimiento Diario</h1>
        <p className="text-blue-200">{format(new Date(), 'd MMMM yyyy')}</p>
      </div>

      {/* Resumen de Macros */}
      <div className="px-6 mt-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Resumen del Día</h3>
          
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {Math.round(todayProgress.calories)}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                de {currentMacros.calories}
              </div>
              <div className="text-xs text-gray-500">kcal</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {Math.round(todayProgress.protein)}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                de {currentMacros.protein}
              </div>
              <div className="text-xs text-gray-500">proteína</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {Math.round(todayProgress.fat)}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                de {currentMacros.fat}
              </div>
              <div className="text-xs text-gray-500">grasa</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {Math.round(todayProgress.carbs)}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                de {currentMacros.carbs}
              </div>
              <div className="text-xs text-gray-500">carbos</div>
            </div>
          </div>

          {/* Barra de Progreso de Calorías */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>Progreso Calórico</span>
              <span>{calculatePercentage(todayProgress.calories, currentMacros.calories)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${calculatePercentage(todayProgress.calories, currentMacros.calories)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Selector de Comida */}
      <div className="px-6 mt-6">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {mealTypes.map((meal) => (
            <button
              key={meal.id}
              onClick={() => setSelectedMeal(meal.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedMeal === meal.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span className="mr-2">{meal.icon}</span>
              {meal.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Alimentos de la Comida Seleccionada */}
      <div className="px-6 mt-6">
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">
              {mealTypes.find((m) => m.id === selectedMeal)?.label}
            </h3>
            <button
              onClick={() => setShowFoodSelector(true)}
              className="text-blue-400 hover:text-blue-300 text-2xl"
            >
              +
            </button>
          </div>

          {todayMeals[selectedMeal].length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No has registrado ningún alimento aún
            </p>
          ) : (
            <div className="space-y-3">
              {todayMeals[selectedMeal].map((entry) => (
                <div
                  key={entry.id}
                  className="bg-gray-700 rounded-lg p-4 flex justify-between items-start"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-white">{entry.foodName}</p>
                    <p className="text-sm text-gray-400 mt-1">{entry.quantity}g</p>
                    <div className="flex space-x-4 mt-2 text-xs">
                      <span className="text-blue-400">{entry.calories} kcal</span>
                      <span className="text-green-400">P: {entry.protein}g</span>
                      <span className="text-yellow-400">G: {entry.fat}g</span>
                      <span className="text-purple-400">C: {entry.carbs}g</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveEntry(entry.id)}
                    className="text-red-400 hover:text-red-300 ml-4"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Selector de Alimentos */}
      {showFoodSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-end justify-center z-50">
          <div className="bg-gray-800 rounded-t-3xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Seleccionar Alimento</h3>
              <button
                onClick={() => {
                  setShowFoodSelector(false);
                  setSelectedFood(null);
                  setSearchTerm('');
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            {!selectedFood ? (
              <>
                <input
                  type="text"
                  placeholder="Buscar alimento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field mb-4"
                />

                {filteredFoods.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">No tienes alimentos guardados</p>
                    <button
                      onClick={() => {
                        setShowFoodSelector(false);
                        onNavigate('foods');
                      }}
                      className="btn-primary"
                    >
                      Crear Alimento
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredFoods.map((food) => (
                      <button
                        key={food.id}
                        onClick={() => setSelectedFood(food)}
                        className="w-full bg-gray-700 hover:bg-gray-600 rounded-lg p-4 text-left transition-colors"
                      >
                        <p className="font-semibold text-white">{food.name}</p>
                        <div className="flex space-x-4 mt-2 text-xs text-gray-300">
                          <span>{food.calories} kcal</span>
                          <span>P: {food.protein}g</span>
                          <span>G: {food.fat}g</span>
                          <span>C: {food.carbs}g</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="bg-gray-700 rounded-lg p-4 mb-4">
                  <p className="font-semibold text-white text-lg">{selectedFood.name}</p>
                  <p className="text-sm text-gray-400 mt-1">Por 100g</p>
                </div>

                <div>
                  <label className="label">Cantidad (gramos)</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    className="input-field"
                    min="1"
                  />
                </div>

                <div className="bg-gray-700 rounded-lg p-4 mt-4">
                  <p className="text-sm text-gray-400 mb-3">Valores nutricionales:</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-400">Calorías:</span>
                      <span className="text-white font-semibold ml-2">
                        {Math.round(selectedFood.calories * (quantity / 100))} kcal
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Proteína:</span>
                      <span className="text-white font-semibold ml-2">
                        {Math.round(selectedFood.protein * (quantity / 100) * 10) / 10}g
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Grasa:</span>
                      <span className="text-white font-semibold ml-2">
                        {Math.round(selectedFood.fat * (quantity / 100) * 10) / 10}g
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Carbohidratos:</span>
                      <span className="text-white font-semibold ml-2">
                        {Math.round(selectedFood.carbs * (quantity / 100) * 10) / 10}g
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setSelectedFood(null)}
                    className="btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddFood}
                    className="btn-primary flex-1"
                    disabled={quantity <= 0}
                  >
                    Añadir
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodTracker;
