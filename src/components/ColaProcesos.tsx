import React from "react";
import { useSimuladorStore } from "../store/useSimuladorStore";

// ── Props del componente ──────────────────────────────────────────────
interface ColaProcesosProps {
  /** Título descriptivo de la cola (ej. "Cola de Listos") */
  titulo: string;
  /** El identificador de la cola en el store */
  tipoCola: "nuevos" | "listos" | "bloqueadosES" | "terminados";
}

// ── Mapa de colores por estado ────────────────────────────────────────
// Permite que el badge de estado se coloree dinámicamente según el
// tipo de estado del proceso, manteniendo coherencia visual en todo
// el dashboard.
const COLORES_ESTADO: Record<string, { bg: string; text: string }> = {
  NUEVO:      { bg: "bg-violet-500/20", text: "text-violet-300" },
  LISTO:      { bg: "bg-amber-500/20",  text: "text-amber-300" },
  EJECUTANDO: { bg: "bg-blue-500/20",   text: "text-blue-300" },
  BLOQUEADO:  { bg: "bg-red-500/20",    text: "text-red-300" },
  TERMINADO:  { bg: "bg-emerald-500/20", text: "text-emerald-300" },
};

// ── Componente ColaProcesos ───────────────────────────────────────────
export const ColaProcesos: React.FC<ColaProcesosProps> = ({
  titulo,
  tipoCola,
}) => {
  const procesos = useSimuladorStore(state => state.colas[tipoCola]);
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
          {procesos.length}
        </span>
      </div>

      {/* Lista scrollable de procesos */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-1">
        {procesos.length === 0 ? (
          /* ── Estado vacío ── */
          <p className="text-sm italic text-slate-600 text-center py-8 select-none">
            No hay procesos en esta cola
          </p>
        ) : (
          /* ── Tarjetas de procesos ── */
          procesos.map((proceso) => {
            const color =
              COLORES_ESTADO[proceso.estado] ??
              { bg: "bg-slate-700/30", text: "text-slate-400" };

            return (
              <div
                key={proceso.idProceso}
                className="flex items-center justify-between gap-3
                           bg-slate-800 hover:bg-slate-800/80
                           border border-slate-700/50 rounded-lg
                           px-3 py-2.5 transition-colors"
              >
                {/* ID del proceso */}
                <span className="font-mono font-bold text-sm text-slate-100 truncate">
                  {proceso.idProceso}
                </span>

                {/* Estado + Burst Time */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Badge de estado */}
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full
                                border border-current/20
                                ${color.bg} ${color.text}`}
                  >
                    {proceso.estado}
                  </span>

                  {/* Burst Time */}
                  <span
                    className="text-xs font-mono text-slate-400
                               bg-slate-900/60 px-2 py-0.5 rounded"
                    title="Burst Time Total"
                  >
                    BT: {proceso.burstTimeTotal}
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
