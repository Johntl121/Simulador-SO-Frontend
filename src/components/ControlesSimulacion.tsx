import React, { useRef, useState } from "react";
import { useSimuladorStore } from "../store/useSimuladorStore";
import { useRelojGlobal } from "../hooks/useRelojGlobal";
import { ModalEstadisticas } from "./ModalEstadisticas";


export const ControlesSimulacion: React.FC = () => {
  useRelojGlobal(); // <== AQUÍ ESTABA EL BUG SILENCIOSO (nunca se invocó)
  const {
    estadoSimulacionLocal,
    velocidadMultiplicador,
    setEstadoSimulacion,
    setVelocidad,
    estadoConexionWS,
    conectarWebSocket,
    desconectarWebSocket,
    enviarComandoWS
  } = useSimuladorStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (file.name.endsWith('.json')) {
        try {
          const data = JSON.parse(text);
          data.forEach((proc: any) => {
            if (!proc.id || isNaN(Number(proc.instrucciones))) return;
            
            enviarComandoWS({
              action: "admitir",
              id: proc.id,
              totalInstrucciones: Number(proc.instrucciones),
              bytesStack: Number(proc.stack) || 0,
              bytesHeap: Number(proc.heap) || 0,
              tickLlegada: proc.tickLlegada !== undefined && proc.tickLlegada !== "" && !isNaN(Number(proc.tickLlegada)) 
                           ? Number(proc.tickLlegada) 
                           : -1
            });
          });
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      } else if (file.name.endsWith('.csv')) {
        const lines = text.split('\n');
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const [idStr, instrucciones, stack, heap, tickLlegada] = line.split(',');
          
          if (!idStr || !idStr.trim() || isNaN(Number(instrucciones))) continue;

          enviarComandoWS({
            action: "admitir",
            id: idStr.trim(),
            totalInstrucciones: Number(instrucciones),
            bytesStack: Number(stack) || 0,
            bytesHeap: Number(heap) || 0,
            tickLlegada: tickLlegada !== undefined && tickLlegada.trim() !== "" && !isNaN(Number(tickLlegada)) 
                         ? Number(tickLlegada.trim()) 
                         : -1
          });
        }
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleAgregarProcesoPrueba = () => {
    enviarComandoWS({
      action: "admitir",
      id: `P-TEMP`,
      totalInstrucciones: 15,
      bytesStack: 131072,
      bytesHeap: 131072
    });
  };

  const isEjecutando = estadoSimulacionLocal === "EJECUTANDO";
  const isPausado = estadoSimulacionLocal === "PAUSADO";
  const isConectado = estadoConexionWS === "CONECTADO";

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 shadow-lg w-full flex items-center justify-between gap-4">

      {/* ── Sección Izquierda: Play / Pausa ── */}
      <div className="flex flex-col items-center shrink-0">
        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
          Simulación
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEstadoSimulacion("EJECUTANDO")}
            disabled={isEjecutando}
            className={`flex items-center justify-center w-10 h-10 rounded-lg font-bold transition-all
              ${isEjecutando
                ? "bg-emerald-500/20 text-emerald-500/50 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-400 text-white shadow-md shadow-emerald-500/20 cursor-pointer"
              }`}
            title="Play"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
          <button
            onClick={() => setEstadoSimulacion("PAUSADO")}
            disabled={isPausado}
            className={`flex items-center justify-center w-10 h-10 rounded-lg font-bold transition-all
              ${isPausado
                ? "bg-rose-500/20 text-rose-500/50 cursor-not-allowed"
                : "bg-rose-500 hover:bg-rose-400 text-white shadow-md shadow-rose-500/20 cursor-pointer"
              }`}
            title="Pausa"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Sección Centro: Panel de Control ── */}
      <div className="flex flex-col items-center flex-1 min-w-0">
        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
          Panel de Control
        </span>
        <div className="flex items-center gap-2">
          <input type="file" accept=".csv,.json" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={!isConectado}
            className="bg-teal-600 hover:bg-teal-500 text-white disabled:bg-teal-600/30 disabled:text-teal-400/50 disabled:cursor-not-allowed cursor-pointer text-xs px-3 py-2 rounded-lg font-bold transition-colors shadow-md whitespace-nowrap"
          >
            📂 Cargar Lote
          </button>
          <button
            onClick={handleAgregarProcesoPrueba}
            disabled={!isConectado}
            className="bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-indigo-600/30 disabled:text-indigo-400/50 disabled:cursor-not-allowed cursor-pointer text-xs px-3 py-2 rounded-lg font-bold transition-colors shadow-md whitespace-nowrap"
          >
            + 1 Proceso
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white cursor-pointer text-xs px-3 py-2 rounded-lg font-bold transition-colors shadow-md whitespace-nowrap"
          >
            📊 Estadísticas
          </button>
        </div>
      </div>

      {/* ── Sección Derecha: Velocidad ── */}
      <div className="flex flex-col items-center shrink-0">
        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
          Velocidad
        </span>
        <div className="inline-flex rounded-lg shadow-sm" role="group">
          {[1, 2, 5].map((velocidad, index, array) => {
            const isActive = velocidadMultiplicador === velocidad;
            const isFirst = index === 0;
            const isLast = index === array.length - 1;

            return (
              <button
                key={`vel-${velocidad}`}
                type="button"
                onClick={() => setVelocidad(velocidad)}
                className={`
                  px-4 py-2 text-sm font-bold border-y border-slate-600 transition-colors cursor-pointer
                  ${isFirst ? "rounded-l-lg border-l" : ""}
                  ${isLast ? "rounded-r-lg border-r" : "border-r"}
                  ${isActive
                    ? "bg-blue-600 text-white border-blue-500 z-10"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"
                  }
                `}
              >
                x{velocidad}
              </button>
            );
          })}
        </div>
      </div>

      <ModalEstadisticas isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
