import React, { useState } from 'react';
import { useSimuladorStore } from '../store/useSimuladorStore';

export const PanelConfiguracion: React.FC = () => {
  const [algoritmo, setAlgoritmo] = useState("RR");
  const [quantum, setQuantum] = useState(4);
  const [tamanoPagina, setTamanoPagina] = useState(32768);
  const [tamanoRam, setTamanoRam] = useState(2097152);
  const [asignacionMemoria, setAsignacionMemoria] = useState("FIRST_FIT");
  const [reemplazoPaginas, setReemplazoPaginas] = useState("FIFO");

  const {
    estadoConexionWS,
    conectarWebSocket,
    enviarComandoWS,
    configuracionAplicada,
    setConfiguracionAplicada,
  } = useSimuladorStore();

  const isConectado = estadoConexionWS === "CONECTADO";
  const isConectando = estadoConexionWS === "CONECTANDO";

  const handleConectar = () => {
    conectarWebSocket("ws://localhost:7070/simulador");
  };

  const handleConfigurar = () => {
    enviarComandoWS({
      action: "configurar",
      algoritmo,
      quantum: algoritmo === "RR" ? Number(quantum) : 0,
      tamanoPagina: Number(tamanoPagina),
      tamanoRam: Number(tamanoRam),
      asignacionMemoria,
      reemplazoPaginas,
    });
    setConfiguracionAplicada(true);
  };

  /* ---------- helpers para el badge de estado ---------- */
  const estadoBadge = () => {
    switch (estadoConexionWS) {
      case "CONECTADO":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Conectado
          </span>
        );
      case "CONECTANDO":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            Conectando…
          </span>
        );
      case "ERROR":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Error de conexión
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <span className="h-2 w-2 rounded-full bg-slate-600" />
            Desconectado
          </span>
        );
    }
  };

  /* ---------- estilos reutilizables ---------- */
  const selectClass =
    "bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors w-full";
  const labelClass = "text-xs font-semibold text-slate-400 uppercase tracking-wider";

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 min-h-screen p-4 transition-opacity ${configuracionAplicada ? 'hidden opacity-0 pointer-events-none' : 'opacity-100'}`}
      style={{ display: configuracionAplicada ? 'none' : 'flex' }}
    >
      {/* ── Cabecera decorativa ── */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">
          Simulador de Sistema Operativo
        </h1>
        <p className="text-sm text-slate-400 max-w-md text-center">
          Configura los parámetros iniciales del sistema antes de comenzar la simulación.
        </p>
      </div>

      {/* ── Tarjeta principal ── */}
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
        {/* ── Barra de conexión WS ── */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-700/40 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            <span className="text-sm font-medium text-slate-300">WebSocket</span>
            {estadoBadge()}
          </div>

          <button
            onClick={handleConectar}
            disabled={isConectado || isConectando}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all
              ${isConectado
                ? "bg-emerald-600/20 text-emerald-400 cursor-default border border-emerald-500/30"
                : isConectando
                  ? "bg-amber-600/20 text-amber-400 cursor-wait border border-amber-500/30"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20"
              }`}
          >
            {isConectado ? "Conectado ✓" : isConectando ? "Conectando…" : "Conectar al Servidor"}
          </button>
        </div>

        {/* ── Formulario de configuración ── */}
        <div className="p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-5 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Configuración Inicial del Sistema
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {/* Algoritmo */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Algoritmo de Planificación</label>
              <select value={algoritmo} onChange={(e) => setAlgoritmo(e.target.value)} className={selectClass}>
                <option value="RR">Round Robin (RR)</option>
                <option value="FCFS">First Come First Served (FCFS)</option>
                <option value="SJF">Shortest Job First (SJF)</option>
                <option value="SRTF">Shortest Remaining Time First (SRTF)</option>
              </select>
            </div>

            {/* Quantum */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Quantum (Ticks)</label>
              <input
                type="number"
                value={quantum}
                onChange={(e) => setQuantum(Number(e.target.value))}
                disabled={algoritmo !== "RR"}
                min={1}
                className={`${selectClass} ${algoritmo !== "RR" ? "opacity-40 cursor-not-allowed" : ""}`}
              />
            </div>

            {/* Tamaño Página */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Tamaño Página</label>
              <select value={tamanoPagina} onChange={(e) => setTamanoPagina(Number(e.target.value))} className={selectClass}>
                <option value={16384}>16 KB (16 384 B)</option>
                <option value={32768}>32 KB (32 768 B)</option>
              </select>
            </div>

            {/* Tamaño RAM */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Memoria RAM</label>
              <select value={tamanoRam} onChange={(e) => setTamanoRam(Number(e.target.value))} className={selectClass}>
                <option value={1048576}>1 MB (1 048 576 B)</option>
                <option value={2097152}>2 MB (2 097 152 B)</option>
                <option value={4194304}>4 MB (4 194 304 B)</option>
              </select>
            </div>

            {/* Estrategia de Memoria */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Estrategia de Memoria</label>
              <select value={asignacionMemoria} onChange={(e) => setAsignacionMemoria(e.target.value)} className={selectClass}>
                <option value="FIRST_FIT">First-Fit</option>
                <option value="BEST_FIT">Best-Fit</option>
                <option value="WORST_FIT">Worst-Fit</option>
              </select>
            </div>

            {/* Reemplazo de Páginas */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Reemplazo de Páginas</label>
              <select value={reemplazoPaginas} onChange={(e) => setReemplazoPaginas(e.target.value)} className={selectClass}>
                <option value="FIFO">FIFO</option>
                <option value="LRU">LRU</option>
              </select>
            </div>
          </div>

          {/* ── Botón enviar ── */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleConfigurar}
              disabled={!isConectado}
              className={`px-6 py-2.5 rounded-lg font-bold transition-all shadow-md text-sm
                ${isConectado
                  ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20"
                  : "bg-blue-600/30 text-blue-400/50 cursor-not-allowed shadow-none"
                }`}
              title={isConectado ? "Enviar configuración al backend" : "Conecta el WebSocket primero"}
            >
              Aplicar Configuración Inicial
            </button>
          </div>
        </div>
      </div>

      {/* ── Pie informativo ── */}
      <p className="mt-6 text-xs text-slate-600 select-none">
        Una vez aplicada la configuración, el dashboard se desbloqueará automáticamente.
      </p>
    </div>
  );
};
