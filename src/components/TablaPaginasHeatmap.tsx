import React, { useState, useEffect } from 'react';
import { useSimuladorStore } from '../store/useSimuladorStore';

// Sub-componente para la animación de la fila (Página unificada)
const FilaPagina: React.FC<{ pagina: any }> = ({ pagina }) => {
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    // Si la página se monta o cambia de ubicación, activamos la animación
    setHighlight(true);
    const timer = setTimeout(() => setHighlight(false), 800);
    return () => clearTimeout(timer);
  }, [pagina.ubicacion]);

  const isSwap = pagina.ubicacion === 'SWAP';

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
        {pagina.idProceso}
      </td>
      <td className={`font-mono px-2 py-1 transition-colors duration-700 ${highlight ? 'text-yellow-300 font-bold' : 'text-slate-300'}`}>
        {pagina.pagina}
      </td>
      <td className={`font-mono px-2 py-1 font-bold transition-colors duration-700 
        ${highlight ? 'text-yellow-300' : isSwap ? 'text-amber-500' : 'text-emerald-400'}`}>
        {pagina.ubicacion}
      </td>
    </tr>
  );
};

export const TablaPaginasHeatmap: React.FC = () => {
  const { backendData } = useSimuladorStore();
  if (!backendData) return <p className="text-slate-500">Sin datos</p>;

  const { marcosRAM, areaSwap } = backendData.gestionMemoria;

  const paginasUnificadas = [
    // Marcos ocupados de RAM
    ...marcosRAM
      .filter((m) => m.idProcesoAsignado !== null)
      .map((m) => ({
        idProceso: m.idProcesoAsignado,
        pagina: m.numeroPaginaAsignada,
        ubicacion: `Marco ${m.idMarco}`,
      })),
    // Páginas en SWAP
    ...(areaSwap?.paginas || []).map((p) => ({
      idProceso: p.idProceso,
      pagina: p.numeroPagina,
      ubicacion: 'SWAP',
    })),
  ];

  // Ordenar alfabéticamente por idProceso, luego numéricamente por pagina
  paginasUnificadas.sort((a, b) => {
    if (a.idProceso === b.idProceso) {
      return a.pagina - b.pagina;
    }
    return a.idProceso!.localeCompare(b.idProceso!);
  });

  return (
    <div className="w-full mt-6 pt-4 border-t border-slate-800/60">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-3">
        Tabla de Páginas (RAM + SWAP)
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse relative">
          <thead>
            <tr>
              <th className="text-left text-slate-400 font-medium px-2 py-1 sticky left-0 bg-slate-800 z-30">
                Proceso
              </th>
              <th className="text-left text-slate-400 font-medium px-2 py-1">Página Lógica</th>
              <th className="text-left text-slate-400 font-medium px-2 py-1">Ubicación</th>
            </tr>
          </thead>
          <tbody>
            {paginasUnificadas.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center text-slate-500 py-4 italic">
                  No hay procesos en memoria
                </td>
              </tr>
            ) : (
              paginasUnificadas.map((pagina) => (
                <FilaPagina key={`${pagina.idProceso}-P${pagina.pagina}`} pagina={pagina} />
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-[10px] text-slate-400">
        Total de páginas en memoria: {paginasUnificadas.length}
      </div>
    </div>
  );
};