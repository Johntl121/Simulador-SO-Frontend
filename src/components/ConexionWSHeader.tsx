import React from "react";
import { useSimuladorStore } from "../store/useSimuladorStore";

export const ConexionWSHeader: React.FC = () => {
  const { estadoConexionWS, conectarWebSocket, desconectarWebSocket } = useSimuladorStore();

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        {estadoConexionWS === "CONECTADO" ? (
          <>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400">WS Conectado</span>
            <button
              onClick={() => desconectarWebSocket()}
              className="ml-2 cursor-pointer bg-red-600/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-xs px-2 py-1 rounded transition-colors"
            >
              Desconectar
            </button>
          </>
        ) : estadoConexionWS === "ERROR" ? (
          <>
            <span className="relative flex h-2.5 w-2.5">
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <span className="text-rose-400">Error WS</span>
            <button
              onClick={() => conectarWebSocket("ws://localhost:7070/simulador")}
              className="ml-2 cursor-pointer bg-blue-600 hover:bg-blue-500 text-white shadow-md text-xs px-2 py-1 rounded transition-colors"
            >
              Reconectar
            </button>
          </>
        ) : (
          <>
            <span className="relative flex h-2.5 w-2.5">
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-500"></span>
            </span>
            <span className="text-slate-400">WS Desconectado</span>
            <button
              onClick={() => conectarWebSocket("ws://localhost:7070/simulador")}
              className="ml-2 cursor-pointer bg-blue-600 hover:bg-blue-500 text-white shadow-md text-xs px-2 py-1 rounded transition-colors"
            >
              Conectar
            </button>
          </>
        )}
      </div>
    </div>
  );
};
