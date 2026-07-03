import React from "react";
import { useSimuladorStore } from "../store/useSimuladorStore";

// ── Props del componente ──────────────────────────────────────────────
interface ColaProcesosProps {
  /** Título descriptivo de la cola (ej. "Cola de Listos") */
  titulo: string;
  /** El identificador de la cola en el store (coincide con backendData.colasProcesos) */
  tipoCola: "nuevos" | "listos" | "bloqueados";
}

// ── Componente ColaProcesos ───────────────────────────────────────────
export const ColaProcesos: React.FC<ColaProcesosProps> = ({
  titulo,
  tipoCola,
}) => {
  // Obtenemos los IDs de procesos y el diccionario del backendData
  const procesosIds = useSimuladorStore(state => state.backendData?.colasProcesos?.[tipoCola] || []);
  const diccionarioProcesos = useSimuladorStore(state => state.backendData?.diccionarioProcesos || {});

  return (
    <div className="flex flex-col h-full">
      {/* Encabezado de la cola */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
          {titulo}
        </h3>
        <span
          className="text-xs font-mono font-medium text-slate-400
                     bg-slate-700/50 px-2 py-0.5 rounded-full"
        >
          {procesosIds.length}
        </span>
      </div>

      {/* Lista scrollable de procesos */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-1">
        {procesosIds.length === 0 ? (
          /* ── Estado vacío ── */
          <p className="text-sm italic text-slate-600 text-center py-8 select-none">
            No hay procesos en esta cola
          </p>
        ) : (
          /* ── Tarjetas de procesos (Completas) ── */
          procesosIds.map((procesoId) => {
            const proceso = diccionarioProcesos[procesoId];
            if (!proceso) return null; // Fallback de seguridad

            // Determinar color de badge según el estado
            let badgeColor = "bg-slate-600 text-slate-200 border border-slate-500/30";
            if (proceso.estado === "LISTO") badgeColor = "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
            else if (proceso.estado === "NUEVO") badgeColor = "bg-slate-500/20 text-slate-400 border border-slate-500/30";
            else if (proceso.estado === "BLOQUEADO") badgeColor = "bg-rose-500/20 text-rose-400 border border-rose-500/30";
            else if (proceso.estado === "EJECUTANDO") badgeColor = "bg-blue-500/20 text-blue-400 border border-blue-500/30";

            return (
              <div
                key={procesoId}
                className="flex flex-col gap-2
                           bg-slate-800 hover:bg-slate-800/80
                           border border-slate-700/80 shadow-md rounded-lg
                           p-3 transition-colors"
              >
                {/* Cabecera: ID y Badge de estado */}
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-slate-100 truncate">
                    {proceso.id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeColor}`}>
                    {proceso.estado}
                  </span>
                </div>
                
                {/* Detalles adicionales */}
                <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                  <span>Burst Time:</span>
                  <span className="font-mono font-medium text-slate-300">
                    {proceso.burstTimeRestante}t
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
