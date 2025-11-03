import React, { useState } from 'react';
import useStore from '../store/useStore';

const WeeklyReportButton = () => {
  const exportWeeklyReport = useStore((state) => state.exportWeeklyReport);
  const generateWeeklyReport = useStore((state) => state.generateWeeklyReport);
  const [showPreview, setShowPreview] = useState(false);
  const [preview, setPreview] = useState('');

  const handlePreview = () => {
    const report = generateWeeklyReport();
    setPreview(report);
    setShowPreview(true);
  };

  const handleExport = () => {
    exportWeeklyReport();
    setShowPreview(false);
  };

  return (
    <>
      <div className="flex space-x-3">
        <button
          onClick={handlePreview}
          className="btn-secondary flex-1 flex items-center justify-center space-x-2"
        >
          <span>👁️</span>
          <span>Vista Previa</span>
        </button>
        
        <button
          onClick={handleExport}
          className="btn-primary flex-1 flex items-center justify-center space-x-2"
        >
          <span>📤</span>
          <span>Exportar Reporte</span>
        </button>
      </div>

      {/* Modal de Vista Previa */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-4xl p-6 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Vista Previa del Reporte</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-900 rounded p-4 mb-4">
              <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                {preview}
              </pre>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowPreview(false)}
                className="btn-secondary flex-1"
              >
                Cerrar
              </button>
              <button
                onClick={handleExport}
                className="btn-primary flex-1"
              >
                Descargar Reporte
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WeeklyReportButton;
