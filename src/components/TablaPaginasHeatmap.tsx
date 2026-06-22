import React from 'react';
import { useSimuladorStore } from '../store/useSimuladorStore';

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
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="text-left text-slate-400 font-medium px-2 py-1 sticky left-0 bg-slate-800 z-10">
                Marco
              </th>
              <th className="text-left text-slate-400 font-medium px-2 py-1">Proceso</th>
              <th className="text-left text-slate-400 font-medium px-2 py-1">Página</th>
            </tr>
          </thead>
          <tbody>
            {marcos.slice(0, 64).map((marco) => (
              <tr key={marco.idMarco} className="border-t border-slate-700/40">
                <td className="font-mono text-slate-300 px-2 py-1 sticky left-0 bg-slate-800">
                  {marco.idMarco}
                </td>
                <td className="font-mono text-slate-300 px-2 py-1">
                  {marco.idProcesoAsignado || <span className="text-slate-500">—</span>}
                </td>
                <td className="font-mono text-slate-300 px-2 py-1">
                  {marco.idProcesoAsignado !== null
                    ? marco.numeroPaginaAsignada
                    : <span className="text-slate-500">—</span>}
                </td>
              </tr>
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