import React, { useState, useEffect } from 'react';
import { useSimuladorStore } from '../store/useSimuladorStore';

// Sub-componente para la animación de la tarjeta (Bloque de Swap)
const TarjetaSwap: React.FC<{ bloque: any }> = ({ bloque }) => {
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    // Si el bloque recibe un proceso, activamos la animación visual
    if (bloque.idProceso) {
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 800);
      return () => clearTimeout(timer);
    }
  }, [bloque.idProceso]);

  // Clases base dependiendo del estado (libre/ocupado)
  const baseClasses = bloque.estado === 'libre'
    ? 'bg-slate-700/30 border-slate-700/20 text-white/30'
    : 'bg-orange-700/50 border-orange-700/30 text-white/80';

  // Si está destacado (highlighted), sobrescribimos estilos temporalmente
  const activeClasses = highlight
    ? 'bg-yellow-500 border-yellow-400 scale-[1.15] z-10 shadow-[0_0_15px_rgba(234,179,8,0.6)] text-white font-bold animate-pulse'
    : baseClasses;

  return (
    <div
      className={`aspect-square rounded border flex items-center justify-center text-[9px] transition-all duration-700 ease-out ${activeClasses}`}
      title={`Bloque ${bloque.idBloque}: ${bloque.estado}${bloque.idProceso ? ' (P: ' + bloque.idProceso + ')' : ''}`}
    >
      {bloque.idProceso?.replace('P-', '')}
    </div>
  );
};

export const SwapArea: React.FC = () => {
  const paginasSwap = useSimuladorStore(state => state.backendData?.gestionMemoria?.areaSwap?.paginas || []);
  const columnas = 4;

  const bloques = Array.from({ length: 16 }, (_, i) => {
    const pagina = paginasSwap[i];
    if (pagina) {
      return { idBloque: i, estado: 'ocupado', idProceso: pagina.idProceso };
    }
    return { idBloque: i, estado: 'libre', idProceso: null };
  });

  return (
    <div className="w-full mt-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-3">
        Área de Swap (16 bloques)
      </h3>

      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${columnas}, 1fr)` }}>
        {bloques.map((bloque) => (
          <TarjetaSwap key={bloque.idBloque} bloque={bloque} />
        ))}
      </div>

      <div className="flex gap-3 mt-3 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-slate-700/30 border border-slate-700/20"></span> Libre
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-orange-700/50 border border-orange-700/30"></span> Ocupado
        </span>
      </div>
    </div>
  );
};