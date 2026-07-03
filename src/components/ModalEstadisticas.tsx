import React from 'react';
import { useSimuladorStore } from '../store/useSimuladorStore';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

interface ModalEstadisticasProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalEstadisticas: React.FC<ModalEstadisticasProps> = ({ isOpen, onClose }) => {
  const { historialResultados, guardarResultadoActual, limpiarHistorial } = useSimuladorStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-700/50 pb-4">
          <h2 className="text-2xl font-bold text-slate-100">Resultados del Benchmarking</h2>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => guardarResultadoActual()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-md cursor-pointer"
            >
              💾 Guardar Corrida Actual
            </button>
            <button
              onClick={() => limpiarHistorial()}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-md cursor-pointer"
            >
              🗑️ Limpiar Historial
            </button>
            <button
              onClick={onClose}
              className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-md cursor-pointer"
            >
              ❌ Cerrar
            </button>
          </div>
        </header>

        {historialResultados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-lg font-medium">No hay datos en el historial.</p>
            <p className="text-sm mt-1">Por favor, presiona "Guardar Corrida Actual" para comenzar a comparar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
            {/* Gráfico 1: Tiempos de Ejecución */}
            <div className="bg-slate-900 border border-slate-700/60 rounded-xl p-5 shadow-lg h-80 flex flex-col">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4 text-center">
                Tiempos de Ejecución (Ticks)
              </h3>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historialResultados} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="algoritmo" stroke="#94a3b8" fontSize={11} tickMargin={10} angle={-15} textAnchor="end" />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#f8fafc', borderRadius: '0.5rem' }} cursor={{ fill: '#334155', opacity: 0.4 }} />
                    <Bar dataKey="ticksTotales" name="Ticks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico 2: Fragmentación Interna */}
            <div className="bg-slate-900 border border-slate-700/60 rounded-xl p-5 shadow-lg h-80 flex flex-col">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4 text-center">
                Fragmentación Interna
              </h3>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historialResultados} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="algoritmo" stroke="#94a3b8" fontSize={11} tickMargin={10} angle={-15} textAnchor="end" />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#f8fafc', borderRadius: '0.5rem' }} cursor={{ fill: '#334155', opacity: 0.4 }} />
                    <Bar dataKey="fragmentacion" name="Fragmentación" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico 3: Hiperpaginación (Page Faults) */}
            <div className="bg-slate-900 border border-slate-700/60 rounded-xl p-5 shadow-lg h-80 flex flex-col">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4 text-center">
                Hiperpaginación (Page Faults)
              </h3>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historialResultados} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="algoritmo" stroke="#94a3b8" fontSize={11} tickMargin={10} angle={-15} textAnchor="end" />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#f8fafc', borderRadius: '0.5rem' }} cursor={{ fill: '#334155', opacity: 0.4 }} />
                    <Bar dataKey="pageFaults" name="Page Faults" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
