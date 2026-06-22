import React, { useRef } from 'react';
import { useSimuladorStore } from '../store/useSimuladorStore';

export const MemoryHeatmap: React.FC = () => {
  const { memoria, cargarEstadoMemoria } = useSimuladorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getEstadoMarco = (index: number, marco: any) => {
    if (marco.estado === 'swap') return 'swap';
    if (marco.estado === 'libre') {
      const marcos = memoria.marcos;
      const prev = index > 0 ? marcos[index - 1] : null;
      const next = index < marcos.length - 1 ? marcos[index + 1] : null;
      const tieneVecinoOcupado = (prev && prev.estado === 'ocupado') || (next && next.estado === 'ocupado');
      return tieneVecinoOcupado ? 'fragmentado' : 'libre';
    }
    return 'ocupado';
  };

  const getColor = (index: number, marco: any) => {
    const estado = getEstadoMarco(index, marco);
    switch (estado) {
      case 'libre': return 'bg-emerald-600/70 border-emerald-500/30';
      case 'ocupado': return 'bg-rose-600/70 border-rose-500/30';
      case 'fragmentado': return 'bg-amber-500/70 border-amber-400/30';
      case 'swap': return 'bg-orange-600/70 border-orange-500/30';
      default: return 'bg-slate-700/30 border-slate-600/20';
    }
  };

  const getTooltip = (index: number, marco: any) => {
    const estado = getEstadoMarco(index, marco);
    const base = `Frame ${marco.idFrame}: ${estado}`;
    if (marco.idProceso) return `${base} (P: ${marco.idProceso})`;
    return base;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const contenido = ev.target?.result as string;
        let datos: any;
        if (file.name.endsWith('.json')) {
          datos = JSON.parse(contenido);
        } else if (file.name.endsWith('.csv')) {
          const lineas = contenido.split('\n').filter((l) => l.trim());
          if (lineas.length < 2) throw new Error('CSV vacío');
          const cabeceras = lineas[0].split(',').map((h) => h.trim());
          const idxProceso = cabeceras.indexOf('proceso');
          const idxEstado = cabeceras.indexOf('estado');
          if (idxProceso === -1 || idxEstado === -1) {
            throw new Error('CSV debe tener columnas "proceso" y "estado"');
          }
          const marcos = lineas.slice(1).map((linea) => {
            const valores = linea.split(',').map((v) => v.trim());
            return {
              proceso: valores[idxProceso] || undefined,
              estado: valores[idxEstado] || 'libre',
            };
          });
          datos = { marcos, swap: [] };
        } else {
          alert('Formato no soportado. Use .json o .csv');
          return;
        }
        if (!datos.marcos || !Array.isArray(datos.marcos)) {
          throw new Error('El archivo debe contener un array "marcos"');
        }
        cargarEstadoMemoria({
          marcos: datos.marcos,
          swap: datos.swap || [],
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (error) {
        alert('Error al leer el archivo: ' + (error as Error).message);
      }
    };
    reader.readAsText(file);
  };

  const columnas = 8;
  const marcos = memoria.marcos;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
          Mapa de Memoria ({memoria.tamaño} marcos)
        </h3>
        <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors">
          Cargar CSV/JSON
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${columnas}, 1fr)` }}>
        {marcos.map((marco, idx) => (
          <div
            key={marco.idFrame}
            className={`aspect-square rounded border ${getColor(idx, marco)} 
                        flex items-center justify-center text-[8px] text-white/50 
                        hover:scale-105 transition-transform duration-100`}
            title={getTooltip(idx, marco)}
          >
            {marco.idProceso?.slice(-2)}
          </div>
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
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-orange-600/70 border border-orange-500/30"></span> Swap
        </span>
      </div>
    </div>
  );
};