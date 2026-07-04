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

  // Estados para modal de Generación Aleatoria
  const [isRandomModalOpen, setIsRandomModalOpen] = useState(false);
  const [randomCount, setRandomCount] = useState<number>(5);

  // Estados para modal de Proceso Manual
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualId, setManualId] = useState<string>("");
  const [manualBurst, setManualBurst] = useState<number>(15);
  const [manualSize, setManualSize] = useState<number>(4096);

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

  const handleGenerarAleatorios = (e: React.FormEvent) => {
    e.preventDefault();
    if (randomCount <= 0) return;
    
    enviarComandoWS({
      action: "generar_aleatorios",
      cantidad: Number(randomCount)
    });
    setIsRandomModalOpen(false);
  };

  const handleAgregarManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBurst <= 0 || manualSize <= 0) return;

    // Distribuir equitativamente el tamaño entre Stack y Heap
    const bytesStack = Math.floor(manualSize / 2);
    const bytesHeap = manualSize - bytesStack;

    enviarComandoWS({
      action: "admitir",
      id: manualId.trim() || "",
      totalInstrucciones: Number(manualBurst),
      bytesStack,
      bytesHeap
    });

    // Limpiar estados y cerrar
    setManualId("");
    setManualBurst(15);
    setManualSize(4096);
    setIsManualModalOpen(false);
  };

  const isEjecutando = estadoSimulacionLocal === "EJECUTANDO";
  const isPausado = estadoSimulacionLocal === "PAUSADO";
  const isConectado = estadoConexionWS === "CONECTADO";

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 shadow-lg w-full flex flex-col gap-3">

      {/* ── Fila Superior: Botones de Acción ── */}
      <div className="flex flex-col items-center">
        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
          Panel de Control
        </span>
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <input type="file" accept=".csv,.json" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={!isConectado}
            className="bg-teal-600 hover:bg-teal-500 text-white disabled:bg-teal-600/30 disabled:text-teal-400/50 disabled:cursor-not-allowed cursor-pointer text-xs px-3 py-2 rounded-lg font-bold transition-colors shadow-md whitespace-nowrap"
          >
            📂 Cargar Lote
          </button>
          <button
            onClick={() => setIsRandomModalOpen(true)}
            disabled={!isConectado}
            className="bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-indigo-600/30 disabled:text-indigo-400/50 disabled:cursor-not-allowed cursor-pointer text-xs px-3 py-2 rounded-lg font-bold transition-colors shadow-md whitespace-nowrap"
          >
            🎲 Generar Aleatorios
          </button>
          <button
            onClick={() => setIsManualModalOpen(true)}
            disabled={!isConectado}
            className="bg-sky-600 hover:bg-sky-500 text-white disabled:bg-sky-600/30 disabled:text-sky-400/50 disabled:cursor-not-allowed cursor-pointer text-xs px-3 py-2 rounded-lg font-bold transition-colors shadow-md whitespace-nowrap"
          >
            ➕ Proceso Manual
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white cursor-pointer text-xs px-3 py-2 rounded-lg font-bold transition-colors shadow-md whitespace-nowrap"
          >
            📊 Estadísticas
          </button>
        </div>
      </div>

      {/* ── Separador ── */}
      <div className="border-t border-slate-700/60" />

      {/* ── Fila Inferior: Simulación (izquierda) + Velocidad (derecha) ── */}
      <div className="flex items-center justify-between gap-4">

        {/* Play / Pausa */}
        <div className="flex flex-col items-center">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
            Simulación
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEstadoSimulacion("EJECUTANDO")}
              disabled={isEjecutando}
              className={`flex items-center justify-center w-9 h-9 rounded-lg font-bold transition-all
                ${isEjecutando
                  ? "bg-emerald-500/20 text-emerald-500/50 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-400 text-white shadow-md shadow-emerald-500/20 cursor-pointer"
                }`}
              title="Play"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <button
              onClick={() => setEstadoSimulacion("PAUSADO")}
              disabled={isPausado}
              className={`flex items-center justify-center w-9 h-9 rounded-lg font-bold transition-all
                ${isPausado
                  ? "bg-rose-500/20 text-rose-500/50 cursor-not-allowed"
                  : "bg-rose-500 hover:bg-rose-400 text-white shadow-md shadow-rose-500/20 cursor-pointer"
                }`}
              title="Pausa"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Velocidad */}
        <div className="flex flex-col items-center">
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
                    px-4 py-1.5 text-sm font-bold border-y border-slate-600 transition-colors cursor-pointer
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

      <ModalEstadisticas isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* ── MODAL 1: Generación Aleatoria de Procesos ── */}
      {isRandomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700/60 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700/40 bg-slate-900/60 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                🎲 Generar Procesos Aleatorios
              </h3>
              <button onClick={() => setIsRandomModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-xs">
                ❌
              </button>
            </div>
            <form onSubmit={handleGenerarAleatorios} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Cantidad de Procesos
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  required
                  value={randomCount}
                  onChange={(e) => setRandomCount(Number(e.target.value))}
                  className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors w-full"
                />
              </div>

              {/* Presets */}
              <div className="flex gap-2">
                {[1, 3, 5, 10, 20].map((num) => (
                  <button
                    key={`preset-rand-${num}`}
                    type="button"
                    onClick={() => setRandomCount(num)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-1 rounded text-xs transition-colors border border-slate-700"
                  >
                    {num}
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRandomModalOpen(false)}
                  className="bg-slate-700 hover:bg-slate-600 text-white text-xs px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded-lg font-bold transition-colors shadow-md cursor-pointer"
                >
                  Generar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Ingreso Manual de Procesos ── */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700/60 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700/40 bg-slate-900/60 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                ➕ Ingresar Proceso Manual
              </h3>
              <button onClick={() => setIsManualModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-xs">
                ❌
              </button>
            </div>
            <form onSubmit={handleAgregarManual} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  ID del Proceso (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. P-1 (Vacio para autogenerar)"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Tiempo de CPU / Burst Time (Instrucciones)
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={manualBurst}
                  onChange={(e) => setManualBurst(Number(e.target.value))}
                  className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Tamaño del Proceso (Bytes)
                </label>
                <input
                  type="number"
                  min={512}
                  step={512}
                  required
                  value={manualSize}
                  onChange={(e) => setManualSize(Number(e.target.value))}
                  className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors w-full"
                />
                <span className="text-[10px] text-slate-500 block mt-1">
                  * Se distribuirá 50% para Stack y 50% para Heap ({Math.floor(manualSize / 2)} B / {manualSize - Math.floor(manualSize / 2)} B).
                </span>
              </div>

              {/* Presets de Tamaño */}
              <div className="flex gap-2">
                {[1024, 4096, 8192, 16384, 32768].map((size) => (
                  <button
                    key={`preset-size-${size}`}
                    type="button"
                    onClick={() => setManualSize(size)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-1 rounded text-[10px] transition-colors border border-slate-700"
                  >
                    {size >= 1024 ? `${size / 1024} KB` : `${size} B`}
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="bg-slate-700 hover:bg-slate-600 text-white text-xs px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2 rounded-lg font-bold transition-colors shadow-md cursor-pointer"
                >
                  Agregar Proceso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
