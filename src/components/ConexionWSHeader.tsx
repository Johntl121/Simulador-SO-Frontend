import React from "react";
import { useSimuladorStore } from "../store/useSimuladorStore";

export const ConexionWSHeader: React.FC = () => {
  const { 
    estadoConexionWS, 
    conectarWebSocket, 
    desconectarWebSocket,
    enviarComandoWS,
    setEstadoSimulacion,
    setConfiguracionAplicada
  } = useSimuladorStore();

  const handleReiniciarSimulacion = () => {
    enviarComandoWS({ action: "reset" });
    setEstadoSimulacion("PAUSADO");
    setConfiguracionAplicada(false);
  };

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
        ) : (
          <button
            onClick={() => conectarWebSocket("ws://localhost:7070/simulador")}
            className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs px-3 py-1.5 rounded-md transition-colors shadow-sm"
          >
            Conectar al Backend
          </button>
        )}
      </div>
      
      {/* Botón de reinicio de simulación en el header (más discreto) */}
      <div className="border-l border-slate-700/50 pl-4">
        <button
          onClick={handleReiniciarSimulacion}
          disabled={estadoConexionWS !== "CONECTADO"}
          className="text-slate-400 hover:text-amber-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center p-1 rounded hover:bg-slate-800"
          title="Reiniciar Simulación y cambiar Algoritmos"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.097.078.16.208.173.316.03.245.05.49.06.738.012.112-.051.242-.148.32L3.6 12.923a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.31.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.675-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.098-.078-.16-.208-.173-.316a7.486 7.486 0 0 0-.06-.738c-.013-.112.05-.242.148-.32l.84-.692c.108-.09.152-.23.11-.365a1.874 1.874 0 0 0-.542-1.02l-.923-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};
