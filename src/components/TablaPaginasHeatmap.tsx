import React from 'react';
import { useSimuladorStore } from '../store/useSimuladorStore';

export const TablaPaginasHeatmap: React.FC = () => {
  const { backendData } = useSimuladorStore();
  if (!backendData) return <p className="text-slate-500">Sin datos</p>;

  const { marcosRAM, areaSwap } = backendData.gestionMemoria;
  const { diccionarioProcesos } = backendData;

  // Agrupar páginas en RAM: { idProceso: Set<numeroPagina> }
  const paginasEnRAM: Record<string, Set<number>> = {};
  marcosRAM.forEach((marco) => {
    if (marco.idProcesoAsignado !== null) {
      if (!paginasEnRAM[marco.idProcesoAsignado]) {
        paginasEnRAM[marco.idProcesoAsignado] = new Set();
      }
      paginasEnRAM[marco.idProcesoAsignado].add(marco.numeroPaginaAsignada);
    }
  });

  // Agrupar páginas en Swap: { idProceso: Set<numeroPagina> }
  const paginasEnSwap: Record<string, Set<number>> = {};
  areaSwap.paginas.forEach((pag) => {
    if (!paginasEnSwap[pag.idProceso]) {
      paginasEnSwap[pag.idProceso] = new Set();
    }
    paginasEnSwap[pag.idProceso].add(pag.numeroPagina);
  });

  // Obtener conjunto de procesos que tienen al menos una página en RAM o Swap
  const procesosConPaginas = new Set([
    ...Object.keys(paginasEnRAM),
    ...Object.keys(paginasEnSwap),
  ]);

  if (procesosConPaginas.size === 0) {
    return <p className="text-slate-500 italic">No hay páginas mapeadas para ningún proceso.</p>;
  }

  // Para cada proceso, obtener el conjunto de páginas (unión de RAM y Swap)
  const paginasPorProceso: Record<string, Set<number>> = {};
  procesosConPaginas.forEach((pid) => {
    const ram = paginasEnRAM[pid] || new Set();
    const swap = paginasEnSwap[pid] || new Set();
    const union = new Set([...ram, ...swap]);
    paginasPorProceso[pid] = union;
  });

  // Ordenar procesos alfabéticamente
  const procesosOrdenados = Array.from(procesosConPaginas).sort();

  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-3">
        Tabla de Páginas Mapeadas por Proceso
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="text-left text-slate-400 font-medium px-1 py-1 sticky left-0 bg-slate-800 z-10">
                Proceso
              </th>
              <th className="text-left text-slate-400 font-medium px-1 py-1">
                Páginas en RAM
              </th>
              <th className="text-left text-slate-400 font-medium px-1 py-1">
                Páginas en Swap
              </th>
              <th className="text-left text-slate-400 font-medium px-1 py-1">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {procesosOrdenados.map((pid) => {
              const ramPages = paginasEnRAM[pid] || new Set();
              const swapPages = paginasEnSwap[pid] || new Set();
              const total = ramPages.size + swapPages.size;
              // Mostrar números de página en orden
              const ramList = Array.from(ramPages).sort((a, b) => a - b);
              const swapList = Array.from(swapPages).sort((a, b) => a - b);

              return (
                <tr key={pid} className="border-b border-slate-700/40">
                  <td className="font-mono font-bold text-slate-200 px-1 py-1 sticky left-0 bg-slate-800 z-10">
                    {pid}
                  </td>
                  <td className="px-1 py-1">
                    {ramList.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {ramList.map((np) => (
                          <span
                            key={np}
                            className="bg-emerald-600/70 text-emerald-100 px-1.5 py-0.5 rounded text-[10px] font-mono"
                            title={`Página ${np} en RAM`}
                          >
                            {np}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">—</span>
                    )}
                  </td>
                  <td className="px-1 py-1">
                    {swapList.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {swapList.map((np) => (
                          <span
                            key={np}
                            className="bg-amber-600/70 text-amber-100 px-1.5 py-0.5 rounded text-[10px] font-mono"
                            title={`Página ${np} en Swap`}
                          >
                            {np}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">—</span>
                    )}
                  </td>
                  <td className="font-mono font-medium text-slate-300 px-1 py-1">
                    {total}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex gap-4 mt-3 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-emerald-600/70 border border-emerald-500/30"></span> RAM
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-amber-600/70 border border-amber-500/30"></span> Swap
        </span>
      </div>
    </div>
  );
};