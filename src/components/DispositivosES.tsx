import React from 'react';
import { useSimuladorStore } from '../store/useSimuladorStore';

export const DispositivosES: React.FC = () => {
  const { backendData, enviarComandoWS } = useSimuladorStore();
  const dispositivos = backendData?.dispositivosES || [];

  const renderDispositivo = (disp: any, index: number) => {
    return (
      <div key={index} className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-md relative overflow-hidden shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-sm uppercase tracking-wider text-slate-300">{disp.nombre}</h4>
          <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full text-slate-300">
            Cola: {disp.colaEspera?.length || 0}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2 text-xs">
          <span className="text-slate-400">Ejecutando:</span>
          {disp.procesoActualId ? (
            <span className="font-mono font-bold text-yellow-400">
              {disp.procesoActualId}
              <span className="ml-2 text-slate-400">(t={disp.tiempoRestanteTick})</span>
            </span>
          ) : (
            <span className="text-slate-500 italic">IDLE</span>
          )}
        </div>

        {disp.colaEspera?.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {disp.colaEspera.map((pid: string) => (
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

        {/* Prompt Interactivo para el Teclado */}
        {disp.nombre.toLowerCase() === 'teclado' && disp.procesoActualId && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm p-3">
            <p className="text-green-400 font-mono text-xs font-bold text-center mb-2">
              {`> PROMPT: El proceso ${disp.procesoActualId} requiere entrada.`}
            </p>
            <div className="flex flex-row gap-2">
              <button
                onClick={() => enviarComandoWS({ action: "teclado", idProceso: disp.procesoActualId, input: "C" })}
                className="bg-green-600/20 text-green-400 border border-green-500 hover:bg-green-500 hover:text-white px-3 py-1 rounded font-mono text-[10px] transition-colors cursor-pointer"
              >
                [C] Continuar
              </button>
              <button
                onClick={() => enviarComandoWS({ action: "teclado", idProceso: disp.procesoActualId, input: "X" })}
                className="bg-red-600/20 text-red-400 border border-red-500 hover:bg-red-500 hover:text-white px-3 py-1 rounded font-mono text-[10px] transition-colors cursor-pointer"
              >
                [X] Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-250px)] pr-2 custom-scrollbar">
      {dispositivos.map((disp, index) => renderDispositivo(disp, index))}
    </div>
  );
};