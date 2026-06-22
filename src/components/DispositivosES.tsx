import React from 'react';
import { useSimuladorStore } from '../store/useSimuladorStore';

export const DispositivosES: React.FC = () => {
  const dispositivos = useSimuladorStore(state => state.backendData?.dispositivosES || []);

  if (dispositivos.length === 0) {
    return (
      <div className="text-sm text-slate-500 italic p-4 text-center">
        No hay dispositivos de E/S configurados.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      {dispositivos.map((disp) => (
        <div
          key={disp.nombre}
          className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-md"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-300">
              {disp.nombre}
            </h4>
            <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full text-slate-300">
              Cola: {disp.colaEspera.length}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-2 text-xs">
            <span className="text-slate-400">Ejecutando:</span>
            {disp.procesoActualId ? (
              <span className="font-mono font-bold text-yellow-400">
                {disp.procesoActualId}
                <span className="ml-2 text-slate-400">
                  (t={disp.tiempoRestanteTick})
                </span>
              </span>
            ) : (
              <span className="text-slate-500 italic">IDLE</span>
            )}
          </div>

          {disp.colaEspera.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {disp.colaEspera.map((pid) => (
                <span
                  key={pid}
                  className="bg-slate-700/60 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded"
                >
                  {pid}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-slate-500 italic">Cola vacía</p>
          )}
        </div>
      ))}
    </div>
  );
};