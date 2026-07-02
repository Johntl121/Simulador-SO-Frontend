import React, { useMemo } from 'react';
import { useSimuladorStore } from '../store/useSimuladorStore';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';

interface ModalEstadisticasProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLORS = {
  NUEVO: '#94a3b8', // slate-400
  LISTO: '#3b82f6', // blue-500
  EJECUTANDO: '#10b981', // emerald-500
  BLOQUEADO: '#f43f5e', // rose-500
  TERMINADO: '#334155' // slate-700
};

export const ModalEstadisticas: React.FC<ModalEstadisticasProps> = ({ isOpen, onClose }) => {
  const diccionarioProcesos = useSimuladorStore(state => state.backendData?.diccionarioProcesos);
  const gestionMemoria = useSimuladorStore(state => state.backendData?.gestionMemoria);

  const datosProcesos = useMemo(() => {
    if (!diccionarioProcesos) return [];
    
    const conteo = { NUEVO: 0, LISTO: 0, EJECUTANDO: 0, BLOQUEADO: 0, TERMINADO: 0 };
    Object.values(diccionarioProcesos).forEach(p => {
      if (conteo[p.estado as keyof typeof conteo] !== undefined) {
        conteo[p.estado as keyof typeof conteo]++;
      }
    });

    return Object.entries(conteo)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [diccionarioProcesos]);

  const datosMemoria = useMemo(() => {
    if (!gestionMemoria) return [];
    
    const totalAccesos = gestionMemoria.totalAccesos || 0;
    const pageFaults = gestionMemoria.pageFaultsTotales || 0;
    const aciertos = Math.max(0, totalAccesos - pageFaults);

    return [
      { name: 'Aciertos (Hits)', valor: aciertos, fill: '#10b981' }, // emerald-500
      { name: 'Fallos (Faults)', valor: pageFaults, fill: '#f43f5e' } // rose-500
    ];
  }, [gestionMemoria]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Estadísticas del Sistema
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-600 rounded-lg p-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Content Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto">
          
          {/* Chart 1: Estados de Procesos */}
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 flex flex-col">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4 text-center">
              Distribución de Procesos
            </h3>
            <div className="flex-1 min-h-[300px]">
              {datosProcesos.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={datosProcesos}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                      stroke="none"
                    >
                      {datosProcesos.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }}
                      itemStyle={{ color: '#f8fafc' }}
                    />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '20px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 italic">No hay procesos en el sistema</div>
              )}
            </div>
          </div>

          {/* Chart 2: Rendimiento de Memoria */}
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 flex flex-col">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4 text-center">
              Rendimiento de Memoria (MMU)
            </h3>
            <div className="flex-1 min-h-[300px]">
              {gestionMemoria && gestionMemoria.totalAccesos > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={datosMemoria} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                    <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                    <Tooltip 
                      cursor={{ fill: '#334155', opacity: 0.4 }}
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }}
                    />
                    <Bar dataKey="valor" radius={[4, 4, 0, 0]} maxBarSize={60}>
                      {datosMemoria.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 italic">No hay accesos a memoria registrados</div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
