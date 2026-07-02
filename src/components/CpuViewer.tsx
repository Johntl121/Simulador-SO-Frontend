import React, { useState, useEffect, useRef } from 'react';
import { useSimuladorStore } from '../store/useSimuladorStore';

export const CpuViewer = () => {
    // Conectamos el componente al store de Zustand
    const { backendData, avanzarReloj, enviarComandoWS } = useSimuladorStore();

    const tickActual = backendData?.tickActual ?? 0;
    const cpuActivaId = backendData?.estadoCPU.ejecutandoProcesoId ?? null;
    const programCounter = backendData?.estadoCPU.programCounter;

    const [isAnimating, setIsAnimating] = useState(false);
    const prevCpuId = useRef(cpuActivaId);

  useEffect(() => {
    // Si hay un proceso en CPU y es diferente al anterior, animamos
    if (cpuActivaId && cpuActivaId !== prevCpuId.current) {
      setIsAnimating(true);
      prevCpuId.current = cpuActivaId;
      
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 600);
      
      return () => clearTimeout(timer); // Limpieza para evitar bugs
    } 
    // Si la CPU se vacía (terminaron todos los procesos), forzamos apagado
    else if (!cpuActivaId) {
      setIsAnimating(false);
      prevCpuId.current = null;
    }
  }, [cpuActivaId]);

    return (
        <div className="p-6 bg-slate-800 text-white rounded-xl shadow-lg border border-slate-700 max-w-sm">
            <h2 className="text-2xl font-bold text-blue-400 mb-4">Procesador (CPU)</h2>

            <div className="mb-4">
                <p className="text-sm text-slate-400">Reloj Global</p>
                <p className="text-3xl font-mono text-green-400">Tick: {tickActual}</p>
            </div>

            <div className="bg-slate-900 p-4 rounded border border-slate-600 relative overflow-hidden">
                {isAnimating ? (
                    /* ── Overlay de Context Switch ── */
                    <div className="animate-pulse flex flex-col items-center justify-center gap-3 py-4">
                        {/* Spinner SVG */}
                        <svg
                            className="animate-spin h-10 w-10 text-amber-400"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                        </svg>

                        <div className="text-center">
                            <p className="text-amber-400 font-bold text-sm tracking-wide uppercase">
                                Dispatcher Activo
                            </p>
                            <p className="text-slate-400 text-xs mt-1">
                                Guardando PCB / Cargando nuevo proceso...
                            </p>
                        </div>

                        {/* Barra de progreso animada */}
                        <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2 overflow-hidden">
                            <div
                                className="bg-amber-400 h-1.5 rounded-full animate-[progress_1s_ease-in-out]"
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>
                ) : cpuActivaId ? (
                    <>
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-lg text-yellow-400">{cpuActivaId}</span>
                            <span className="bg-blue-600 px-2 py-1 rounded text-xs font-bold">EJECUTANDO</span>
                        </div>
                        <p className="font-mono text-sm">PC: {programCounter}</p>
                    </>
                ) : (
                    <p className="text-slate-500 italic">CPU Inactiva (IDLE)</p>
                )}
            </div>

            {/* Indicador de estado del Dispatcher */}
            <div className="mt-3 flex items-center gap-2">
                <span className={`inline-block w-2 h-2 rounded-full ${isAnimating ? 'bg-amber-400 animate-pulse' : 'bg-green-500'}`} />
                <span className="text-xs text-slate-400">
                    Dispatcher: {isAnimating ? 'Cambio de contexto...' : 'IDLE'}
                </span>
            </div>

            <div className="mt-4 flex gap-2">
                <button
                    onClick={avanzarReloj}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                    Simular Tick
                </button>

                {/* Botón de prueba para desarrollo */}
                <button
                    onClick={() => enviarComandoWS({ action: "io", idProceso: cpuActivaId, nombreDispositivo: "Teclado" })}
                    disabled={!cpuActivaId || isAnimating}
                    className={`flex-1 font-bold py-2 px-4 rounded transition-colors text-sm ${
                        !cpuActivaId || isAnimating
                            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-500/20'
                    }`}
                >
                    ⌨️ Forzar Teclado
                </button>
            </div>
            <p className="text-[10px] text-slate-600 mt-1 text-right italic">* Botón de prueba para inyectar E/S</p>
        </div>
    );
};