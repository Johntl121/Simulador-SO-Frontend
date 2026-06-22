import React, { useState, useEffect } from 'react';
import { useSimuladorStore } from '../store/useSimuladorStore';

// Sub-componente para la animación de la fila (Marco de RAM)
const FilaMarcoRAM: React.FC<{ marco: any }> = ({ marco }) => {
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    // Si el marco recibe un proceso, activamos la animación
    if (marco.idProcesoAsignado) {
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 800);
      return () => clearTimeout(timer); // Limpieza de timeout para evitar problemas al desmontar
    }
  }, [marco.idProcesoAsignado, marco.numeroPaginaAsignada]);

  return (
    <tr
      className={`border-t transition-all duration-700
        ${highlight 
          ? 'border-yellow-500/50 bg-yellow-500/20 scale-[1.02] relative z-20 shadow-lg shadow-yellow-500/10' 
          : 'border-slate-700/40 bg-transparent'
        }`}
    >
      <td
        className={`font-mono px-2 py-1 sticky left-0 transition-colors duration-700
          ${highlight ? 'bg-yellow-600 text-white font-bold' : 'bg-slate-800 text-slate-300'}
        `}
      >
        {marco.idMarco}
      </td>
      <td className={`font-mono px-2 py-1 transition-colors duration-700 ${highlight ? 'text-yellow-300 font-bold' : 'text-slate-300'}`}>
        {marco.idProcesoAsignado || <span className="text-slate-500">—</span>}
      </td>
      <td className={`font-mono px-2 py-1 transition-colors duration-700 ${highlight ? 'text-yellow-300 font-bold' : 'text-slate-300'}`}>
        {marco.idProcesoAsignado !== null
          ? marco.numeroPaginaAsignada
          : <span className="text-slate-500">—</span>}
      </td>
    </tr>
  );
};

export const TablaPaginasHeatmap: React.FC = () => {
  const { backendData } = useSimuladorStore();
  if (!backendData) return <p className="text-slate-500">Sin datos</p>;

  const { marcosRAM } = backendData.gestionMemoria;

  // Asegurar que tenemos 64 marcos (rellenar con libres si faltan)
  const marcos = marcosRAM.length >= 64
    ? marcosRAM
    : [
        ...marcosRAM,
        ...Array(64 - marcosRAM.length)
          .fill(null)
          .map((_, i) => ({
            idMarco: marcosRAM.length + i,
            idProcesoAsignado: null,
            numeroPaginaAsignada: 0,
          })),
      ];

  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-3">
        Tabla de Páginas (Marcos de RAM)
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse relative">
          <thead>
            <tr>
              <th className="text-left text-slate-400 font-medium px-2 py-1 sticky left-0 bg-slate-800 z-30">
                Marco
              </th>
              <th className="text-left text-slate-400 font-medium px-2 py-1">Proceso</th>
              <th className="text-left text-slate-400 font-medium px-2 py-1">Página</th>
            </tr>
          </thead>
          <tbody>
            {marcos.slice(0, 64).map((marco) => (
              <FilaMarcoRAM key={marco.idMarco} marco={marco} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-[10px] text-slate-400">
        Mostrando {marcos.slice(0, 64).filter((m) => m.idProcesoAsignado !== null).length} marcos ocupados de 64.
      </div>
    </div>
  );
};