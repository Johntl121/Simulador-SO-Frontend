import React from 'react';
import { useSimuladorStore } from '../store/useSimuladorStore';

export const DispositivosES: React.FC = () => {
  const { backendData, enviarComandoWS } = useSimuladorStore();
  const dispositivos = backendData?.dispositivosES || [];

  const findDispositivo = (nombre: string) => {
    return dispositivos.find((d) => d.nombre.toLowerCase() === nombre.toLowerCase());
  };

  const renderDispositivo = (nombre: string) => {
    const disp = findDispositivo(nombre);
    if (!disp) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-md">
          <h4 className="font-bold text-sm uppercase tracking-wider text-slate-300 mb-2">{nombre}</h4>
          <p className="text-xs text-slate-500 italic">No configurado</p>
        </div>
      );
    }

    const requiresKeyboardInput = nombre === 'Teclado' && disp.procesoActualId;

    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-sm uppercase tracking-wider text-slate-300">{disp.nombre}</h4>
          <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full text-slate-300">
            Cola: {disp.colaEspera.length}
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

        {/* Prompt Interactivo para el Teclado */}
        {requiresKeyboardInput && (
          <div className="absolute inset-0 bg-slate-950/95 z-10 flex flex-col items-center justify-center p-2 text-center border border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)] backdrop-blur-sm">
            <div className="text-green-400 font-mono text-[10px] sm:text-xs mb-3 leading-relaxed">
              &gt; PROMPT DE TECLADO<br />
              El proceso <span className="font-bold text-white">{disp.procesoActualId}</span> requiere entrada.<br />
              Presione [C] para Continuar o [X] para Cancelar.
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  console.log('Comando enviado: C');
                  enviarComandoWS({ action: "teclado_input", idProceso: disp.procesoActualId, input: "C" });
                }}
                className="bg-green-900/40 hover:bg-green-600/60 text-green-400 hover:text-white border border-green-600/50 font-mono text-[10px] px-3 py-1.5 rounded transition-colors shadow-lg"
              >
                [C] Continuar
              </button>
              <button
                onClick={() => {
                  console.log('Comando enviado: X');
                  enviarComandoWS({ action: "teclado_input", idProceso: disp.procesoActualId, input: "X" });
                }}
                className="bg-red-900/40 hover:bg-red-600/60 text-red-400 hover:text-white border border-red-600/50 font-mono text-[10px] px-3 py-1.5 rounded transition-colors shadow-lg"
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
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      {renderDispositivo('Impresora')}
      {renderDispositivo('Disco')}
      {renderDispositivo('Teclado')}
    </div>
  );
};