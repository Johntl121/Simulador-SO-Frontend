import React from "react";
import { useSimuladorStore } from "../store/useSimuladorStore";
import { useRelojGlobal } from "../hooks/useRelojGlobal";
import type { PayloadBackend } from "../types/simulador";

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

  const inyectarMockData = () => {
    const mockPayload: PayloadBackend = {
      tickActual: 18,
      configuracion: { algoritmoPlanificacion: "RR", quantum: 4, tamanoPaginaBytes: 4096 },
      estadoCPU: { ejecutandoProcesoId: "P-01", programCounter: 10, limite32Bits: "0x0000000A" },
      colasProcesos: { nuevos: ["P-04"], listos: ["P-02", "P-03"], bloqueados: [] },
      diccionarioProcesos: {
        "P-01": { id: "P-01", estado: "EJECUTANDO", burstTimeRestante: 8 },
        "P-02": { id: "P-02", estado: "LISTO", burstTimeRestante: 5 },
        "P-03": { id: "P-03", estado: "LISTO", burstTimeRestante: 12 },
        "P-04": { id: "P-04", estado: "NUEVO", burstTimeRestante: 20 }
      },
      gestionMemoria: {
        algoritmoReemplazo: "FIFO", totalAccesos: 150, pageFaultsTotales: 12, porcentajeThrashing: 8.0,
        marcosRAM: [], areaSwap: { totalPaginasEnDisco: 0, paginas: [] }
      },
      dispositivosES: [],
      sistema: { toleranciaFallosExcedida: false, logs: [] }
    };
    useSimuladorStore.setState({ backendData: mockPayload });
  };

  const handleAgregarProcesoPrueba = () => {
    enviarComandoWS({
      action: "admitir",
      id: `P-${Math.floor(Math.random() * 1000)}`,
      totalInstrucciones: 15,
      bytesStack: 1024,
      bytesHeap: 2048
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
          <button
            onClick={inyectarMockData}
            className="bg-purple-600 hover:bg-purple-500 text-white text-sm px-3 py-1.5 rounded-md font-medium transition-colors shadow-md shadow-purple-500/20"
            title="Inyecta datos de prueba para ver la UI"
          >
            Datos Prueba
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

    </div>
  );
};
