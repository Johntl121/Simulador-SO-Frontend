import React, { useState, useEffect } from 'react';
import { useSimuladorStore } from '../store/useSimuladorStore';

// Sub-componente para la animación de cada marco en el mapa
const CuadroMarcoRAM: React.FC<{ index: number, marco: any, getEstadoMarco: (idx: number, m: any) => string }> = ({ index, marco, getEstadoMarco }) => {
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    // Animación cuando el marco recibe un proceso
    if (marco.idProcesoAsignado) {
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 800);
      return () => clearTimeout(timer);
    }
  }, [marco.idProcesoAsignado, marco.numeroPaginaAsignada]);

  const estado = getEstadoMarco(index, marco);
  
  let baseColor = 'bg-slate-700/30 border-slate-600/20';
  if (estado === 'libre') baseColor = 'bg-emerald-600/70 border-emerald-500/30';
  else if (estado === 'ocupado') baseColor = 'bg-rose-600/70 border-rose-500/30';
  else if (estado === 'fragmentado') baseColor = 'bg-amber-500/70 border-amber-400/30';

  const activeClasses = highlight
    ? 'bg-yellow-500 border-yellow-400 scale-[1.15] z-10 shadow-[0_0_15px_rgba(234,179,8,0.6)] text-white font-bold animate-pulse'
    : `${baseColor} text-white/50`;

  const title = `Marco ${marco.idMarco}: ${estado}${marco.idProcesoAsignado ? ' (P: ' + marco.idProcesoAsignado + ')' : ''}`;

  return (
    <div
      className={`aspect-square rounded border flex items-center justify-center text-[8px] transition-all duration-700 ease-out hover:scale-105 ${activeClasses}`}
      title={title}
    >
      {marco.idProcesoAsignado?.slice(-2)}
    </div>
  );
};

export const MemoryHeatmap: React.FC = () => {
  const { backendData } = useSimuladorStore();
  const marcosRAM = backendData?.gestionMemoria?.marcosRAM || [];

  // Asegurar que tenemos 64 marcos visuales
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

  const getEstadoMarco = (index: number, marco: any) => {
    if (marco.idProcesoAsignado === null) {
      const prev = index > 0 ? marcos[index - 1] : null;
      const next = index < marcos.length - 1 ? marcos[index + 1] : null;
      const tieneVecinoOcupado = (prev && prev.idProcesoAsignado !== null) || (next && next.idProcesoAsignado !== null);
      return tieneVecinoOcupado ? 'fragmentado' : 'libre';
    }
    return 'ocupado';
  };

  const columnas = 8;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
          Mapa de Memoria (64 marcos)
        </h3>
        <span className="text-[10px] text-emerald-400 font-bold border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 rounded">
          En Vivo (WS)
        </span>
      </div>

      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${columnas}, 1fr)` }}>
        {marcos.slice(0, 64).map((marco, idx) => (
          <CuadroMarcoRAM 
            key={marco.idMarco} 
            index={idx} 
            marco={marco} 
            getEstadoMarco={getEstadoMarco} 
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-emerald-600/70 border border-emerald-500/30"></span> Libre
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-rose-600/70 border border-rose-500/30"></span> Ocupado
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-amber-500/70 border border-amber-400/30"></span> Fragmentado
        </span>
      </div>
    </div>
  );
};