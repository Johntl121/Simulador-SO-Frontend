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
            enviarComandoWS({ 
              action: "admitir", 
              id: proc.id, 
              totalInstrucciones: Number(proc.instrucciones), 
              bytesStack: Number(proc.stack), 
              bytesHeap: Number(proc.heap) 
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
          const [idStr, instrucciones, stack, heap] = line.split(',');
          if (idStr && instrucciones && stack && heap) {
            enviarComandoWS({ 
              action: "admitir", 
              id: idStr.trim(), 
              totalInstrucciones: Number(instrucciones.trim()), 
              bytesStack: Number(stack.trim()), 
              bytesHeap: Number(heap.trim()) 
            });
          }
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
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg w-full flex flex-col sm:flex-row items-center justify-between gap-6">

      {/* ── Sección Izquierda: Estado (Play / Pausa) ── */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
            Estado de Simulación
          </span>
          <div className="flex items-center gap-3">
            {/* Botón Play */}
            <button
              onClick={() => setEstadoSimulacion("EJECUTANDO")}
              disabled={isEjecutando}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-bold transition-all
                ${isEjecutando
                  ? "bg-emerald-500/20 text-emerald-500/50 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-400 text-white shadow-md shadow-emerald-500/20"
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Play
            </button>

            {/* Botón Pausa */}
            <button
              onClick={() => setEstadoSimulacion("PAUSADO")}
              disabled={isPausado}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-bold transition-all
                ${isPausado
                  ? "bg-rose-500/20 text-rose-500/50 cursor-not-allowed"
                  : "bg-rose-500 hover:bg-rose-400 text-white shadow-md shadow-rose-500/20"
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
              Pausa
            </button>
          </div>
        </div>
      </div>

      {/* ── Sección Centro: Conexión y Pruebas ── */}
      <div className="flex flex-col items-center">
        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
          Conexión (WS: {estadoConexionWS})
        </span>
        <div className="flex gap-2">
          {estadoConexionWS === "DESCONECTADO" || estadoConexionWS === "ERROR" ? (
            <button
              onClick={() => conectarWebSocket("ws://localhost:7070/simulador")}
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-1.5 rounded-md font-medium transition-colors shadow-md shadow-blue-500/20"
            >
              Conectar WS
            </button>
          ) : (
            <button
              onClick={() => desconectarWebSocket()}
              className="bg-red-600 hover:bg-red-500 text-white text-sm px-3 py-1.5 rounded-md font-medium transition-colors shadow-md shadow-red-500/20"
            >
              Desconectar
            </button>
          )}
        </div>
        <div className="flex gap-2 mt-2">
          <input type="file" accept=".csv,.json" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={!isConectado}
            className="text-sm px-3 py-1.5 rounded-md font-medium transition-colors shadow-md bg-teal-600 hover:bg-teal-500 text-white disabled:bg-teal-600/30 disabled:text-teal-400/50"
            title={isConectado ? "Cargar procesos desde un archivo" : "Conecta el WebSocket primero"}
          >
            📂 Cargar Lote
          </button>
          <button
            onClick={handleAgregarProcesoPrueba}
            disabled={!isConectado}
            className={`text-sm px-3 py-1.5 rounded-md font-medium transition-colors shadow-md
              ${isConectado
                ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20"
                : "bg-indigo-600/30 text-indigo-400/50 cursor-not-allowed shadow-none"
              }`}
            title={isConectado ? "Envía un proceso nuevo al backend" : "Conecta el WebSocket primero"}
          >
            + Añadir Proceso
          </button>
          <button onClick={() => setIsModalOpen(true)} className="text-sm px-3 py-1.5 rounded-md font-medium transition-colors shadow-md bg-fuchsia-600 hover:bg-fuchsia-500 text-white">
            📊 Estadísticas
          </button>
        </div>
      </div>

      {/* ── Sección Derecha: Velocidad (Multiplicador) ── */}
      <div className="flex flex-col items-end">
        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
          Velocidad
        </span>
        <div className="inline-flex rounded-lg shadow-sm" role="group">
          {[1, 2, 5].map((velocidad, index, array) => {
            const isActive = velocidadMultiplicador === velocidad;
            // Estilos para los bordes del grupo de botones
            const isFirst = index === 0;
            const isLast = index === array.length - 1;

            return (
              <button
                key={`vel-${velocidad}`}
                type="button"
                onClick={() => setVelocidad(velocidad)}
                className={`
                  px-4 py-2 text-sm font-bold border-y border-slate-600 transition-colors
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
