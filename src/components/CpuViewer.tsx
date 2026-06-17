import React from 'react';
import { useSimuladorStore } from '../store/useSimuladorStore';

export const CpuViewer = () => {
    // Conectamos el componente al store de Zustand
    const { simulacion, procesador, avanzarReloj } = useSimuladorStore();

    return (
        <div className="p-6 bg-slate-800 text-white rounded-xl shadow-lg border border-slate-700 max-w-sm">
            <h2 className="text-2xl font-bold text-blue-400 mb-4">Procesador (CPU)</h2>

            <div className="mb-4">
                <p className="text-sm text-slate-400">Reloj Global</p>
                <p className="text-3xl font-mono text-green-400">Tick: {simulacion.relojGlobal}</p>
            </div>

            <div className="bg-slate-900 p-4 rounded border border-slate-600">
                {procesador.cpuActiva ? (
                    <>
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-lg text-yellow-400">{procesador.cpuActiva.idProceso}</span>
                            <span className="bg-blue-600 px-2 py-1 rounded text-xs font-bold">{procesador.cpuActiva.estado}</span>
                        </div>
                        <p className="font-mono text-sm">PC: {procesador.cpuActiva.programCounter}</p>
                        <p className="font-mono text-sm">Burst Restante: {procesador.cpuActiva.burstTimeRestante}</p>
                    </>
                ) : (
                    <p className="text-slate-500 italic">CPU Inactiva (IDLE)</p>
                )}
            </div>

            <button
                onClick={avanzarReloj}
                className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
            >
                Simular Tick de Reloj
            </button>
        </div>
    );
};