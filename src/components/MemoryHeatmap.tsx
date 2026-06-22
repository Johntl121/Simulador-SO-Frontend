import React, { useRef } from 'react';
import { useSimuladorStore } from '../store/useSimuladorStore';

// Mapa de colores según estado y proceso
const getColor = (estado: string, idProceso?: string) => {
	if (estado === 'libre') return 'bg-emerald-700/30 border-emerald-700/20';
	if (estado === 'swap') return 'bg-amber-700/40 border-amber-700/30';
	// Ocupado: color basado en el ID del proceso (hash simple)
	if (idProceso) {
		const hash = idProceso.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
		const hue = (hash * 37) % 360;
		return `bg-[hsl(${hue},60%,30%)] border-[hsl(${hue},60%,20%)]`;
	}
	return 'bg-slate-700/30 border-slate-700/20';
};

export const MemoryHeatmap: React.FC = () => {
	const { memoria, cargarEstadoMemoria } = useSimuladorStore();
	const fileInputRef = useRef<HTMLInputElement>(null);

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
					// Formato CSV: cabecera "frame,proceso,estado" (frame es opcional)
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
					// Para swap, asumimos que los últimos N son swap (no se usa en este ejemplo)
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

				// Resetear input
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
					Memoria Principal ({memoria.tamaño} marcos)
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
				{marcos.map((marco) => (
					<div
						key={marco.idFrame}
						className={`aspect-square rounded border ${getColor(marco.estado, marco.idProceso)} 
									flex items-center justify-center text-[8px] text-white/50 
									hover:scale-105 transition-transform duration-100`}
						title={`Frame ${marco.idFrame}: ${marco.estado}${marco.idProceso ? ' (P: ' + marco.idProceso + ')' : ''}`}
					>
						{marco.idProceso?.slice(-2)}
					</div>
				))}
			</div>

			<div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-400">
				<span className="flex items-center gap-1">
					<span className="w-3 h-3 rounded bg-emerald-700/30 border border-emerald-700/20"></span> Libre
				</span>
				<span className="flex items-center gap-1">
					<span className="w-3 h-3 rounded bg-amber-700/40 border border-amber-700/30"></span> Swap
				</span>
				<span className="flex items-center gap-1">
					<span className="w-3 h-3 rounded bg-blue-700/40 border border-blue-700/20"></span> Ocupado (color por proceso)
				</span>
			</div>
		</div>
	);
};