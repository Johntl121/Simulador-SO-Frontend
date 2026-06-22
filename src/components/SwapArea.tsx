import React from 'react';
import { useSimuladorStore } from '../store/useSimuladorStore';

export const SwapArea: React.FC = () => {
	const { swap } = useSimuladorStore();
	const columnas = 4;

	return (
		<div className="w-full mt-6">
			<h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-3">
				Área de Swap ({swap.tamaño} bloques)
			</h3>
			<div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${columnas}, 1fr)` }}>
				{swap.bloques.map((bloque) => (
					<div
						key={bloque.idBloque}
						className={`aspect-square rounded border 
									${bloque.estado === 'libre' ? 'bg-slate-700/30 border-slate-700/20' : 'bg-orange-700/50 border-orange-700/30'}
									flex items-center justify-center text-[8px] text-white/50`}
						title={`Bloque ${bloque.idBloque}: ${bloque.estado}${bloque.idProceso ? ' (P: ' + bloque.idProceso + ')' : ''}`}
					>
						{bloque.idProceso?.slice(-2)}
					</div>
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