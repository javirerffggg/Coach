import React, { useEffect, useState } from 'react';
import useStore from '../store/useStore';
import { getPhaseContext } from '../utils/phaseLogic';
import { format } from 'date-fns';
import MacroRing from './MacroRing';

const Dashboard = ({ onNavigate }) => {
  const user = useStore((state) => state.user);
  const currentPhase = useStore((state) => state.currentPhase);
  const currentMacros = useStore((state) => state.currentMacros);
  const calculateDailyProgress = useStore((state) => state.calculateDailyProgress);
  const refreshMacros = useStore((state) => state.refreshMacros);

  const [todayProgress, setTodayProgress] = useState({
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  });

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    refreshMacros();
  }, [refreshMacros]);

  useEffect(() => {
    const progress = calculateDailyProgress(today);
    setTodayProgress(progress);
  }, [calculateDailyProgress, today]);

  if (!currentPhase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Cargando fase actual...</p>
      </div>
    );
  }

  const phaseContext = getPhaseContext(currentPhase);

  const calculatePercentage = (current, target) => {
    if (!target) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-1">
          Hola, {user.name} 👋
        </h1>
        <p className="text-blue-200">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
      </div>

      {/* Fase Actual */}
      <div className="px-6 -mt-4">
        <div className="card bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-400 uppercase tracking-wide">Fase Actual</p>
              <h2 className="text-xl font-bold text-white mt-1">
                {currentPhase.name}
              </h2>
              <p className="text-sm text-gray-300 mt-1">{currentPhase.description}</p>
            </div>
            <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold">
              {currentPhase.phase}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-700">
            <div>
              <p className="text-xs text-gray-400">Cardio</p>
              <p className="text-sm font-semibold text-white mt-1">
                {phaseContext.cardio.sessions}x semana
              </p>
              <p className="text-xs text-gray-300">{phaseContext.cardio.type}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Entrenamiento</p>
              <p className="text-sm font-semibold text-white mt-1">
                {phaseContext.training}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Macros Objetivo */}
      <div className="px-6 mt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Objetivos de Hoy</h3>
        
        <div className="card">
          <div className="grid grid-cols-2 gap-6">
            <MacroRing
              label="Calorías"
              current={todayProgress.calories}
              target={currentMacros.calories}
              unit="kcal"
              color="#3b82f6"
            />
            <MacroRing
              label="Proteínas"
              current={todayProgress.protein}
              target={currentMacros.protein}
              unit="g"
              color="#10b981"
            />
            <MacroRing
              label="Grasas"
              current={todayProgress.fat}
              target={currentMacros.fat}
              unit="g"
              color="#f59e0b"
            />
            <MacroRing
              label="Carbohidratos"
              current={todayProgress.carbs}
              target={currentMacros.carbs}
              unit="g"
              color="#8b5cf6"
            />
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="px-6 mt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Acciones Rápidas</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onNavigate('tracker')}
            className="card hover:bg-gray-700 transition-colors text-center py-6"
          >
            <div className="text-4xl mb-2">🍽️</div>
            <p className="text-white font-semibold">Registrar Comida</p>
          </button>

          <button
            onClick={() => onNavigate('foods')}
            className="card hover:bg-gray-700 transition-colors text-center py-6"
          >
            <div className="text-4xl mb-2">📝</div>
            <p className="text-white font-semibold">Mis Alimentos</p>
          </button>

          <button
            onClick={() => onNavigate('progress')}
            className="card hover:bg-gray-700 transition-colors text-center py-6"
          >
            <div className="text-4xl mb-2">📊</div>
            <p className="text-white font-semibold">Mi Progreso</p>
          </button>

          <button
            onClick={() => onNavigate('plan')}
            className="card hover:bg-gray-700 transition-colors text-center py-6"
          >
            <div className="text-4xl mb-2">📅</div>
            <p className="text-white font-semibold">Ver Plan</p>
          </button>
        </div>
      </div>

      {/* Peso Actual */}
      <div className="px-6 mt-6">
        <div className="card bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Peso Actual</p>
              <p className="text-3xl font-bold text-white mt-1">
                {user.bodyWeight} kg
              </p>
            </div>
            <button
              onClick={() => onNavigate('profile')}
              className="text-blue-400 hover:text-blue-300 text-sm font-semibold"
            >
              Actualizar →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
