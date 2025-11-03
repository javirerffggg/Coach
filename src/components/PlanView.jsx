import React from 'react';
import useStore from '../store/useStore';
import { PHASE_DATES } from '../utils/phaseLogic';
import { format } from 'date-fns';

const PlanView = ({ onNavigate }) => {
  const currentPhase = useStore((state) => state.currentPhase);
  const user = useStore((state) => state.user);

  const phases = [
    {
      phase: 1,
      name: 'FASE 1: Transición y Mantenimiento',
      duration: '4 Nov - 1 Dic 2024 (4 semanas)',
      subPhases: [
        {
          name: 'Semanas 1-2: Descarga Metabólica',
          calories: user.endHypertrophyCalories || 'Calorías fin hipertrofia',
          protein: `${Math.round(user.bodyWeight * 1.8)}g`,
          description: 'Transición desde volumen. Reducir calorías gradualmente.',
          cardio: '2 sesiones LISS (30-40 min)',
          training: 'Intensidad Moderada (RIR 2-3)',
        },
        {
          name: 'Semanas 3-4: Búsqueda de Mantenimiento',
          calories: user.maintenanceCalories,
          protein: `${Math.round(user.bodyWeight * 1.8)}g`,
          description: 'Establecer calorías de mantenimiento real.',
          cardio: '2 sesiones LISS (30-40 min)',
          training: 'Intensidad Moderada (RIR 2-3)',
        },
      ],
    },
    {
      phase: 2,
      name: 'FASE 2: Definición Principal',
      duration: '2 Dic 2024 - 30 Mar 2025 (16 semanas)',
      subPhases: [
        {
          name: 'Dic-Ene: Inicio del Déficit',
          calories: `${user.maintenanceCalories - 400} kcal (-400)`,
          protein: `${Math.round(user.bodyWeight * 2.2)}g`,
          fat: `${Math.round(user.bodyWeight * 0.9)}g`,
          description: 'Déficit moderado para iniciar pérdida de grasa.',
          cardio: '3 sesiones LISS (40-45 min)',
          training: 'Intensidad Alta (RIR 1-2)',
        },
        {
          name: 'Febrero: Descanso de Dieta',
          calories: user.maintenanceCalories,
          protein: `${Math.round(user.bodyWeight * 1.8)}g`,
          description: 'Recuperación metabólica. Volver a mantenimiento.',
          cardio: '2 sesiones LISS (30 min)',
          training: 'Intensidad Moderada (RIR 2-3)',
        },
        {
          name: 'Marzo: Continuación del Déficit',
          calories: `${user.maintenanceCalories - 550} kcal (-550)`,
          protein: `${Math.round(user.bodyWeight * 2.2)}g`,
          fat: `${Math.round(user.bodyWeight * 0.9)}g`,
          description: 'Profundizar déficit tras recuperación.',
          cardio: '3 sesiones LISS (40-45 min)',
          training: 'Intensidad Alta (RIR 1-2)',
        },
      ],
    },
    {
      phase: 3,
      name: 'FASE 3: Pulido Final',
      duration: '1 Abr - 15 Jun 2025 (10 semanas)',
      subPhases: [
        {
          name: 'Pulido y Definición Máxima',
          calories: `${user.maintenanceCalories - 700} kcal (-700)`,
          protein: `${Math.round(user.bodyWeight * 2.2)}g`,
          fat: `${Math.round(user.bodyWeight * 0.9)}g`,
          description: 'Máximo déficit para alcanzar objetivo estético.',
          cardio: '4 sesiones LISS (45-50 min)',
          training: 'Intensidad Muy Alta (RIR 0-1)',
        },
      ],
    },
    {
      phase: 4,
      name: 'FASE 4: Mantenimiento de Verano',
      duration: '16 Jun 2025 en adelante',
      subPhases: [
        {
          name: 'Semana 1: Descarga',
          calories: user.maintenanceCalories,
          protein: `${Math.round(user.bodyWeight * 1.8)}g`,
          description: 'Vuelta a mantenimiento para estabilizar.',
          cardio: '2 sesiones LISS (30 min)',
          training: 'Intensidad Moderada (RIR 2-3)',
        },
        {
          name: 'Semana 2+: Dieta Inversa',
          calories: '+150 kcal cada semana',
          protein: `${Math.round(user.bodyWeight * 1.8)}g`,
          description: 'Incremento calórico progresivo hacia nuevo mantenimiento.',
          cardio: '2 sesiones LISS (30 min)',
          training: 'Intensidad Moderada-Alta (RIR 1-2)',
        },
      ],
    },
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
        <h1 className="text-2xl font-bold text-white">Plan de Definición</h1>
        <p className="text-blue-200">Tu hoja de ruta completa</p>
      </div>

      {/* Fase Actual Destacada */}
      {currentPhase && (
        <div className="px-6 mt-6">
          <div className="card bg-gradient-to-br from-blue-900 to-blue-700 border-2 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-wide">
                📍 Estás aquí
              </span>
              <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                FASE {currentPhase.phase}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white">{currentPhase.name}</h3>
            <p className="text-sm text-blue-100 mt-1">{currentPhase.description}</p>
          </div>
        </div>
      )}

      {/* Timeline de Fases */}
      <div className="px-6 mt-6 space-y-6">
        {phases.map((phase, index) => (
          <div key={index} className="relative">
            {/* Línea de conexión */}
            {index < phases.length - 1 && (
              <div className="absolute left-8 top-20 bottom-0 w-0.5 bg-gray-700 -mb-6" />
            )}

            <div className={`card ${
              currentPhase && currentPhase.phase === phase.phase
                ? 'border-2 border-blue-600'
                : ''
            }`}>
              {/* Número de Fase */}
              <div className="flex items-start mb-4">
                <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                  currentPhase && currentPhase.phase === phase.phase
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}>
                  {phase.phase}
                </div>
                
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-bold text-white">{phase.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{phase.duration}</p>
                </div>
              </div>

              {/* Sub-fases */}
              <div className="space-y-4 mt-4">
                {phase.subPhases.map((subPhase, subIndex) => (
                  <div key={subIndex} className="bg-gray-700/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">{subPhase.name}</h4>
                    <p className="text-sm text-gray-300 mb-3">{subPhase.description}</p>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-400">Calorías</p>
                        <p className="text-white font-semibold">{subPhase.calories}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Proteína</p>
                        <p className="text-white font-semibold">{subPhase.protein}</p>
                      </div>
                      {subPhase.fat && (
                        <div>
                          <p className="text-xs text-gray-400">Grasa</p>
                          <p className="text-white font-semibold">{subPhase.fat}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-400">Cardio</p>
                        <p className="text-white font-semibold">{subPhase.cardio}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <p className="text-xs text-gray-400">Entrenamiento</p>
                      <p className="text-sm text-white">{subPhase.training}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Notas Importantes */}
      <div className="px-6 mt-6 mb-8">
        <div className="card bg-yellow-900/20 border border-yellow-700">
          <h3 className="text-lg font-semibold text-yellow-300 mb-3">
            💡 Notas Importantes
          </h3>
          <ul className="space-y-2 text-sm text-yellow-100">
            <li>• El cardio es opcional pero recomendado para maximizar resultados</li>
            <li>• Los macros se ajustan automáticamente según tu peso actual</li>
            <li>• El descanso de dieta en Febrero es crucial para la salud metabólica</li>
            <li>• La dieta inversa evita rebote y prepara para la próxima etapa</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PlanView;
