import React from 'react';
import { useSimuladorStore } from '../store/useSimuladorStore';

export const TablaPaginasHeatmap: React.FC = () => {
  const { backendData } = useSimuladorStore();
  if (!backendData) return <p className="text-slate-500">Sin datos</p>;

  const { marcosRAM, areaSwap } = backendData.gestionMemoria;
  const { diccionarioProcesos } = backendData;

  // Agrupar páginas en RAM
  const paginasEnRAM: Record<string, Set<number>> = {};
  marcosRAM.forEach((marco) => {
    if (marco.idProcesoAsignado !== null) {
      if (!paginasEnRAM[marco.idProcesoAsignado]) {
        paginasEnRAM[marco.idProcesoAsignado] = new Set();
      }
      paginasEnRAM[marco.idProcesoAsignado].add(marco.numeroPaginaAsignada);
    }
  });

  // Agrupar páginas en Swap
  const paginasEnSwap: Record<string, Set<number>> = {};
  areaSwap.paginas.forEach((pag) => {
    if (!paginasEnSwap[pag.idProceso]) {
      paginasEnSwap[pag.idProceso] = new Set();
    }
    paginasEnSwap[pag.idProceso].add(pag.numeroPagina);
  });

  const procesosIds = Object.keys(diccionarioProcesos);
  if (procesosIds.length === 0) {
    return <p className="text-slate-500 italic">No hay procesos para mostrar.</p>;
  }

  // Número máximo de páginas
  let maxPagina = 0;
  Object.keys(paginasEnRAM).forEach((pid) => {
    paginasEnRAM[pid].forEach((np) => { if (np > maxPagina) maxPagina = np; });
  });
  Object.keys(paginasEnSwap).forEach((pid) => {
    paginasEnSwap[pid].forEach((np) => { if (np > maxPagina) maxPagina = np; });
  });
  const numColumnas = Math.max(4, maxPagina + 1);

  const getColor = (pid: string, np: number): string => {
    const enRAM = paginasEnRAM[pid]?.has(np);
    const enSwap = paginasEnSwap[pid]?.has(np);
    if (enRAM) return 'bg-emerald-600/70 border-emerald-500/30';
    if (enSwap) return 'bg-amber-600/70 border-amber-500/30';
    return 'bg-slate-700/30 border-slate-600/20';
  };

  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-3">
        Tabla de Páginas por Proceso
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="text-left text-slate-400 font-medium px-1 py-1 sticky left-0 bg-slate-800 z-10">
                Proceso
              </th>
              {Array.from({ length: numColumnas }, (_, i) => (
                <th key={i} className="text-center text-slate-400 font-medium px-1 py-1">
                  P{i}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {procesosIds.map((pid) => (
              <tr key={pid}>
                <td className="font-mono font-bold text-slate-200 px-1 py-1 sticky left-0 bg-slate-800 z-10">
                  {pid}
                </td>
                {Array.from({ length: numColumnas }, (_, np) => (
                  <td
                    key={np}
                    className={`border border-slate-700/40 w-6 h-6 text-center rounded-sm ${getColor(pid, np)}`}
                    title={`${pid} - Página ${np}: ${paginasEnRAM[pid]?.has(np) ? 'RAM' : paginasEnSwap[pid]?.has(np) ? 'Swap' : 'No cargada'}`}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-4 mt-2 text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-emerald-600/70 border border-emerald-500/30"></span> RAM
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-amber-600/70 border border-amber-500/30"></span> Swap
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-slate-700/30 border border-slate-600/20"></span> No cargada
        </span>
      </div>
    </div>
  );
};