import React, { useState } from 'react';
import useStore from '../store/useStore';
import { format } from 'date-fns';
import WeeklyReportButton from './WeeklyReportButton';

const Profile = ({ onNavigate }) => {
  const user = useStore((state) => state.user);
  const currentPhase = useStore((state) => state.currentPhase);
  const updateBodyWeight = useStore((state) => state.updateBodyWeight);
  const incrementReverseWeek = useStore((state) => state.incrementReverseWeek);
  const setPhaseOverride = useStore((state) => state.setPhaseOverride);
  const resetApp = useStore((state) => state.resetApp);

  const [showWeightUpdate, setShowWeightUpdate] = useState(false);
  const [newWeight, setNewWeight] = useState(user.bodyWeight.toString());
  const [showDevMode, setShowDevMode] = useState(false);

  const handleUpdateWeight = () => {
    const weight = parseFloat(newWeight);
    if (weight > 0) {
      updateBodyWeight(weight);
      setShowWeightUpdate(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('¿Estás seguro? Se borrarán todos tus datos.')) {
      resetApp();
      window.location.reload();
    }
  };

  const phaseOptions = [
    { value: null, label: 'Automático (Recomendado)' },
    { value: { phase: 1, subPhase: 'descarga' }, label: 'Fase 1 - Descarga' },
    { value: { phase: 1, subPhase: 'mantenimiento' }, label: 'Fase 1 - Mantenimiento' },
    { value: { phase: 2, subPhase: 'inicio_deficit' }, label: 'Fase 2 - Inicio Déficit' },
    { value: { phase: 2, subPhase: 'descanso_dieta' }, label: 'Fase 2 - Descanso' },
    { value: { phase: 2, subPhase: 'continuacion_deficit' }, label: 'Fase 2 - Continuación' },
    { value: { phase: 3, subPhase: 'pulido' }, label: 'Fase 3 - Pulido' },
    { value: { phase: 4, subPhase: 'descarga_verano' }, label: 'Fase 4 - Descarga Verano' },
    { value: { phase: 4, subPhase: 'dieta_inversa' }, label: 'Fase 4 - Dieta Inversa' },
  ];

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
        <h1 className="text-2xl font-bold text-white">Mi Perfil</h1>
        <p className="text-blue-200">Configuración y datos</p>
      </div>

      {/* Información del Usuario */}
      <div className="px-6 mt-6">
        <div className="card">
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-white">{user.name}</h2>
              <p className="text-sm text-gray-400">
                Miembro desde {format(new Date(), 'MMMM yyyy')}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-700">
              <div>
                <p className="text-sm text-gray-400">Peso Actual</p>
                <p className="text-xl font-semibold text-white">{user.bodyWeight} kg</p>
              </div>
              <button
                onClick={() => setShowWeightUpdate(true)}
                className="text-blue-400 hover:text-blue-300 font-semibold"
              >
                Actualizar
              </button>
            </div>

            <div className="py-3 border-b border-gray-700">
              <p className="text-sm text-gray-400">Mantenimiento</p>
              <p className="text-xl font-semibold text-white">{user.maintenanceCalories} kcal</p>
            </div>

            <div className="py-3 border-b border-gray-700">
              <p className="text-sm text-gray-400">Fase Actual</p>
              <p className="text-xl font-semibold text-white">
                {currentPhase ? currentPhase.name : 'Cargando...'}
              </p>
            </div>

            {currentPhase?.phase === 4 && currentPhase?.subPhase === 'dieta_inversa' && (
              <div className="py-3 border-b border-gray-700">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-400">Semana de Dieta Inversa</p>
                    <p className="text-xl font-semibold text-white">Semana {user.reverseWeek}</p>
                  </div>
                  <button
                    onClick={incrementReverseWeek}
                    className="text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    Siguiente Semana
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exportar Reporte */}
      <div className="px-6 mt-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-3">
            📤 Exportar Datos
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Genera un reporte semanal completo para análisis
          </p>
          <WeeklyReportButton />
        </div>
      </div>

      {/* Modo Desarrollador */}
      <div className="px-6 mt-6">
        <button
          onClick={() => setShowDevMode(!showDevMode)}
          className="w-full card hover:bg-gray-700 transition-colors text-left"
        >
          <div className="flex justify-between items-center">
            <span className="text-white font-semibold">⚙️ Modo Desarrollador</span>
            <span className="text-gray-400">{showDevMode ? '▼' : '▶'}</span>
          </div>
        </button>

        {showDevMode && (
          <div className="card mt-3 bg-gray-800/50 border border-yellow-700">
            <p className="text-yellow-300 text-sm mb-4">
              ⚠️ Solo para pruebas. Cambia la fase manualmente.
            </p>
            
            <label className="label">Forzar Fase</label>
            <select
              onChange={(e) => {
                const index = parseInt(e.target.value);
                setPhaseOverride(phaseOptions[index].value);
              }}
              className="input-field"
            >
              {phaseOptions.map((option, index) => (
                <option key={index} value={index}>
                  {option.label}
                </option>
              ))}
            </select>

            <p className="text-xs text-gray-400 mt-3">
              La app calculará automáticamente los macros según la fase seleccionada.
            </p>
          </div>
        )}
      </div>

      {/* Zona Peligrosa */}
      <div className="px-6 mt-6 mb-8">
        <div className="card bg-red-900/20 border border-red-700">
          <h3 className="text-lg font-semibold text-red-300 mb-3">🚨 Zona Peligrosa</h3>
          <p className="text-sm text-gray-300 mb-4">
            Esta acción eliminará todos tus datos y no se puede deshacer.
          </p>
          <button
            onClick={handleReset}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Reiniciar Aplicación
          </button>
        </div>
      </div>

      {/* Modal Actualizar Peso */}
      {showWeightUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-white mb-4">Actualizar Peso</h3>
            
            <div className="mb-4">
              <label className="label">Nuevo peso (kg)</label>
              <input
                type="number"
                step="0.1"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="input-field"
                placeholder="Ej: 75.5"
              />
              <p className="text-xs text-gray-400 mt-2">
                El cambio de peso afectará automáticamente tus macros de proteína y grasa.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowWeightUpdate(false)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateWeight}
                className="btn-primary flex-1"
              >
                Guardar
              Warning:
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
