import React, { useState } from 'react';
import useStore from '../store/useStore';

const FoodManager = ({ onNavigate }) => {
  const foods = useStore((state) => state.foods);
  const addFood = useStore((state) => state.addFood);
  const updateFood = useStore((state) => state.updateFood);
  const deleteFood = useStore((state) => state.deleteFood);

  const [showForm, setShowForm] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    protein: '',
    fat: '',
    carbs: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const foodData = {
      name: formData.name,
      calories: parseFloat(formData.calories),
      protein: parseFloat(formData.protein),
      fat: parseFloat(formData.fat),
      carbs: parseFloat(formData.carbs),
    };

    if (editingFood) {
      updateFood(editingFood.id, foodData);
    } else {
      addFood(foodData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      calories: '',
      protein: '',
      fat: '',
      carbs: '',
    });
    setEditingFood(null);
    setShowForm(false);
  };

  const handleEdit = (food) => {
    setEditingFood(food);
    setFormData({
      name: food.name,
      calories: food.calories.toString(),
      protein: food.protein.toString(),
      fat: food.fat.toString(),
      carbs: food.carbs.toString(),
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este alimento?')) {
      deleteFood(id);
    }
  };

  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-2xl font-bold text-white">Mis Alimentos</h1>
        <p className="text-blue-200">Gestiona tu base de datos personal</p>
      </div>

      {/* Búsqueda y Crear */}
      <div className="px-6 mt-6">
        <div className="flex space-x-3">
          <input
            type="text"
            placeholder="Buscar alimento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field flex-1"
          />
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary whitespace-nowrap"
          >
            + Crear
          </button>
        </div>
      </div>

      {/* Lista de Alimentos */}
      <div className="px-6 mt-6">
        {filteredFoods.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-400 text-lg mb-2">
              {searchTerm ? 'No se encontraron alimentos' : 'No tienes alimentos guardados'}
            </p>
            <p className="text-gray-500 text-sm">
              Crea tu base de datos de alimentos personalizados
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFoods.map((food) => (
              <div key={food.id} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{food.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">Por 100g</p>
                    
                    <div className="grid grid-cols-4 gap-3 mt-3">
                      <div>
                        <p className="text-xs text-gray-400">Calorías</p>
                        <p className="text-sm font-semibold text-blue-400">
                          {food.calories} kcal
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Proteína</p>
                        <p className="text-sm font-semibold text-green-400">
                          {food.protein}g
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Grasa</p>
                        <p className="text-sm font-semibold text-yellow-400">
                          {food.fat}g
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Carbos</p>
                        <p className="text-sm font-semibold text-purple-400">
                          {food.carbs}g
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => handleEdit(food)}
                      className="text-blue-400 hover:text-blue-300 text-xl"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(food.id)}
                      className="text-red-400 hover:text-red-300 text-xl"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-6">
              {editingFood ? 'Editar Alimento' : 'Nuevo Alimento'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Nombre del alimento</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Ej: Pechuga de pollo"
                  required
                />
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-300 mb-3">Valores por 100g:</p>
                
                <div className="space-y-3">
                  <div>
                    <label className="label text-xs">Calorías (kcal)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="calories"
                      value={formData.calories}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Ej: 165"
                      required
                    />
                  </div>

                  <div>
                    <label className="label text-xs">Proteína (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="protein"
                      value={formData.protein}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Ej: 31"
                      required
                    />
                  </div>

                  <div>
                    <label className="label text-xs">Grasa (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="fat"
                      value={formData.fat}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Ej: 3.6"
                      required
                    />
                  </div>

                  <div>
                    <label className="label text-xs">Carbohidratos (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="carbs"
                      value={formData.carbs}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Ej: 0"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingFood ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodManager;
