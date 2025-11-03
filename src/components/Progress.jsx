import WeeklyReportButton from './WeeklyReportButton';
import React, { useState } from 'react';
import useStore from '../store/useStore';
import { format, subDays, parseISO } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Progress = ({ onNavigate }) => {
  const user = useStore((state) => state.user);
  const weightHistory = useStore((state) => state.weightHistory);
  const dailyMeals = useStore((state) => state.dailyMeals);
  const calculateDailyProgress = useStore((state) => state.calculateDailyProgress);
  const currentMacros = useStore((state) => state.currentMacros);

  const [viewMode, setViewMode] = useState('weight'); // 'weight' | 'calories'

  // Datos para gráfico de peso
  const weightData = weightHistory
    .slice(-30)
    .map((entry) => ({
      date: format(parseISO(entry.date), 'dd/MM'),
      weight: entry.weight,
    }));

  // Datos para gráfico de calorías (últimos 7 días)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
    const progress = calculateDailyProgress(date);
    return {
      date: format(parseISO(date), 'dd/MM'),
      calories: progress.calories,
      target: currentMacros.calories,
    };
  });

  // Calcular estadísticas
  const avgCaloriesLast7Days = Math.round(
    last7Days.reduce((sum, day) => sum + day.calories, 0) / 7
  );

  const weightChange =
    weightHistory.length >= 2
      ? (weightHistory[weightHistory.length - 1].weight - weightHistory[0].weight).toFixed(1)
      : 0;

  const adherenceRate =
    last7Days.filter((day) => day.calories >= currentMacros.calories * 0.95 &&
                               day.calories <= currentMacros.calories * 1.05).length;

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
        <h1 className="text-2xl font-bold text-white">Mi Progreso</h1>
        <p className="text-blue-200">Análisis y estadísticas</p>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="px-6 mt-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="card text-center">
            <p className="text-xs text-gray-400 uppercase">Peso Actual</p>
            <p className="text-2xl font-bold text-white mt-2">{user.bodyWeight}</p>
            <p className="text-xs text-gray-500">kg</p>
          </div>

          <div className="card text-center">
            <p className="text-xs text-gray-400 uppercase">Cambio</p>
            <p className={`text-2xl font-bold mt-2 ${
              parseFloat(weightChange) < 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {weightChange > 0 ? '+' : ''}{weightChange}
            </p>
            <p className="text-xs text-gray-500">kg</p>
          </div>

          <div className="card text-center">
            <p className="text-xs text-gray-400 uppercase">Adherencia</p>
            <p className="text-2xl font-bold text-blue-400 mt-2">{adherenceRate}/7</p>
            <p className="text-xs text-gray-500">días</p>
          </div>
        </div>
      </div>

      {/* Selector de Vista */}
      <div className="px-6 mt-6">
        <div className="flex space-x-3">
          <button
            onClick={() => setViewMode('weight')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
              viewMode === 'weight'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            📊 Peso
          </button>
          <button
            onClick={() => setViewMode('calories')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
              viewMode === 'calories'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            🔥 Calorías
          </button>
        </div>
      </div>

      {/* Gráfico */}
      <div className="px-6 mt-6">
        <div className="card">
          {viewMode === 'weight' ? (
            <>
              <h3 className="text-lg font-semibold text-white mb-4">
                Evolución del Peso (últimos 30 días)
              </h3>
              {weightData.length < 2 ? (
                <div className="text-center py-12 text-gray-400">
                  <p>Registra tu peso regularmente para ver tu progreso</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="date"
                      stroke="#9ca3af"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      style={{ fontSize: '12px' }}
                      domain={['dataMin - 1', 'dataMax + 1']}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-white mb-4">
                Ingesta Calórica (últimos 7 días)
              </h3>
              <div className="mb-3">
                <p className="text-sm text-gray-400">
                  Promedio: <span className="text-white font-semibold">{avgCaloriesLast7Days} kcal/día</span>
                </p>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={last7Days}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="date"
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="calories"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    name="Consumidas"
                    dot={{ fill: '#3b82f6', r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Objetivo"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      </div>

      {/* Historial Semanal */}
      <div className="px-6 mt-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">
            Resumen Semanal
          </h3>
          
          <div className="space-y-3">
            {last7Days.reverse().map((day, index) => {
              const isOnTarget =
                day.calories >= currentMacros.calories * 0.95 &&
                day.calories <= currentMacros.calories * 1.05;
              
              return (
                <div key={index} className="bg-gray-700 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-semibold text-white">{day.date}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {day.calories} / {day.target} kcal
                      </p>
                    </div>
                    <div className="text-2xl">
                      {day.calories === 0 ? '⚪' : isOnTarget ? '✅' : '⚠️'}
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isOnTarget ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                        style={{
                          width: `${Math.min((day.calories / day.target) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;
