import React, { useState } from 'react';
import useStore from '../store/useStore';

const SetupWizard = () => {
  const setUser = useStore((state) => state.setUser);
  const refreshMacros = useStore((state) => state.refreshMacros);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    bodyWeight: '',
    maintenanceCalories: '',
    endHypertrophyCalories: '',
    endDeficitCalories: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    setUser({
      name: formData.name,
      bodyWeight: parseFloat(formData.bodyWeight),
      maintenanceCalories: parseInt(formData.maintenanceCalories),
      endHypertrophyCalories: parseInt(formData.endHypertrophyCalories),
      endDeficitCalories: parseInt(formData.endDeficitCalories),
      reverseWeek: 1,
    });

    refreshMacros();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="card max-w-2xl w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Bienvenido a Mi Coach de Definición
          </h1>
          <p className="text-gray-400">
            Configuración inicial - Paso {step} de 3
          </p>
          <div className="mt-4 flex space-x-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded ${
                  s <= step ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Información Personal
              </h2>
              
              <div>
                <label className="label">Tu nombre</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Ej: Carlos"
                  required
                />
              </div>

              <div>
                <label className="label">Peso corporal actual (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  name="bodyWeight"
                  value={formData.bodyWeight}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Ej: 75.5"
                  required
                />
                <p className="text-sm text-gray-400 mt-2">
                  Este valor se usa para calcular tus proteínas y grasas
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Calorías de Mantenimiento
              </h2>
              
              <div>
                <label className="label">Calorías de mantenimiento (kcal)</label>
                <input
                  type="number"
                  name="maintenanceCalories"
                  value={formData.maintenanceCalories}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Ej: 2500"
                  required
                />
                <p className="text-sm text-gray-400 mt-2">
                  Tus calorías de mantenimiento metabólico establecidas en FASE 1
                </p>
              </div>

              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                <p className="text-sm text-blue-200">
                  💡 <strong>Recuerda:</strong> Esta cifra la estableciste en las semanas 3-4 de la Fase 1, 
                  cuando tu peso se estabilizó comiendo consistentemente alrededor de estas calorías.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Calorías de Referencia
              </h2>
              
              <div>
                <label className="label">Calorías al final de hipertrofia (kcal)</label>
                <input
                  type="number"
                  name="endHypertrophyCalories"
                  value={formData.endHypertrophyCalories}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Ej: 3000"
                  required
                />
                <p className="text-sm text-gray-400 mt-2">
                  Las calorías que comías al terminar tu etapa de volumen
                </p>
              </div>

              <div>
                <label className="label">Calorías al final del déficit (kcal)</label>
                <input
                  type="number"
                  name="endDeficitCalories"
                  value={formData.endDeficitCalories}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Ej: 1800"
                />
                <p className="text-sm text-gray-400 mt-2">
                  Opcional: Las calorías al finalizar FASE 3 (para dieta inversa en FASE 4)
                </p>
              </div>

              <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
                <p className="text-sm text-green-200">
                  ✅ <strong>¡Todo listo!</strong> La app calculará automáticamente tus macros 
                  según la fase del plan en la que te encuentres.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="btn-secondary"
              >
                Atrás
              </button>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary ml-auto"
                disabled={
                  (step === 1 && (!formData.name || !formData.bodyWeight)) ||
                  (step === 2 && !formData.maintenanceCalories)
                }
              >
                Siguiente
              </button>
            ) : (
              <button
                type="submit"
                className="btn-primary ml-auto"
                disabled={
                  !formData.name ||
                  !formData.bodyWeight ||
                  !formData.maintenanceCalories
                }
              >
                Comenzar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetupWizard;
