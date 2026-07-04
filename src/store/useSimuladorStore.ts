import { create } from 'zustand';
import type { EstadoGlobalSO, PayloadBackend } from '../types/simulador';

interface SimuladorStore extends EstadoGlobalSO {
    // Memoria y Swap de la rama dev
    memoria: {
        marcos: Array<{ idFrame: number; idProceso?: string; estado: 'libre' | 'ocupado' | 'swap' }>;
        tamaño: number;
    };
    swap: {
        bloques: Array<{ idBloque: number; idProceso?: string; estado: 'libre' | 'ocupado' }>;
        tamaño: number;
    };

    // Acciones generales
    avanzarReloj: () => void;
    setEstadoSimulacion: (estado: "PAUSADO" | "EJECUTANDO") => void;
    setVelocidad: (multiplicador: number) => void;
    simularCambioContexto: (idProcesoEntrante: string) => void;
    limpiarTimeoutContexto: () => void;
    
    // Acción de memoria
    cargarEstadoMemoria: (datos: { marcos: any[]; swap: any[] }) => void;

    // WebSockets
    conectarWebSocket: (url: string) => void;
    desconectarWebSocket: () => void;
    enviarTickWS: () => void;
    enviarComandoWS: (payload: Record<string, unknown>) => void;

    // Configuración aplicada
    configuracionAplicada: boolean;
    setConfiguracionAplicada: (valor: boolean) => void;

    // Historial de resultados
    historialResultados: Array<{ 
        id: string; 
        algoritmo: string; 
        ticksTotales: number; 
        pageFaults: number; 
        thrashing: number; 
        fragmentacion: number;
        tiempoEspera: number;
        tiempoRespuesta: number;
        estrategiaAsignacion: string;
    }>;
    guardarResultadoActual: () => void;
    limpiarHistorial: () => void;
}

// Variable externa para mantener la instancia de WebSocket sin problemas de reactividad
let wsInstance: WebSocket | null = null;

// Variable para el timeout del context switch
let timeoutContexto: ReturnType<typeof setTimeout> | null = null;

const initialBackendData: PayloadBackend = {
    tickActual: 0,
    configuracion: {
        algoritmoPlanificacion: "RR",
        quantum: 4,
        tamanoPaginaBytes: 32768,
        asignacionMemoria: "FIRST_FIT",
        reemplazoPaginas: "FIFO"
    },
    estadoCPU: {
        ejecutandoProcesoId: null,
        programCounter: 0,
        limite32Bits: "0x00000000"
    },
    colasProcesos: {
        nuevos: [],
        listos: [],
        bloqueados: []
    },
    diccionarioProcesos: {},
    gestionMemoria: {
        algoritmoReemplazo: "FIFO",
        totalAccesos: 0,
        pageFaultsTotales: 0,
        porcentajeThrashing: 0,
        marcosRAM: [],
        areaSwap: { totalPaginasEnDisco: 0, paginas: [] }
    },
    dispositivosES: [],
    sistema: {
        toleranciaFallosExcedida: false,
        logs: []
    }
};

export const useSimuladorStore = create<SimuladorStore>((set, get) => ({
    // Estado local (combinado de HEAD y la necesidad visual de memoria en dev)
    estadoConexionWS: "DESCONECTADO",
    estadoSimulacionLocal: "PAUSADO",
    velocidadMultiplicador: 1,
    estadoDispatcher: "IDLE",
    configuracionAplicada: false,

    // Estado de memoria de dev
    memoria: {
        marcos: Array.from({ length: 64 }, (_, i) => ({
            idFrame: i,
            estado: 'libre' as const,
        })),
        tamaño: 64,
    },
    swap: {
        bloques: Array.from({ length: 16 }, (_, i) => ({
            idBloque: i,
            estado: 'libre' as const,
        })),
        tamaño: 16,
    },

    // Estado del backend de HEAD
    backendData: initialBackendData,

    avanzarReloj: () => set((state) => {
        if (!state.backendData) return state;
        return {
            backendData: {
                ...state.backendData,
                tickActual: state.backendData.tickActual + 1
            }
        };
    }),

    setEstadoSimulacion: (estado: "PAUSADO" | "EJECUTANDO") => set({ estadoSimulacionLocal: estado }),

    setConfiguracionAplicada: (valor: boolean) => set({ configuracionAplicada: valor }),

    setVelocidad: (multiplicador: number) => set({ velocidadMultiplicador: multiplicador }),

    // Historial
    historialResultados: [],
    limpiarHistorial: () => set({ historialResultados: [] }),
    guardarResultadoActual: () => {
        const state = get();
        if (!state.backendData) return;

        const procesos = Object.values(state.backendData.diccionarioProcesos);
        const totalProcesos = procesos.length;
        
        let sumEspera = 0;
        let sumRespuesta = 0;
        
        if (totalProcesos > 0) {
            for (const p of procesos) {
                sumEspera += p.ticksEsperando || 0;
                const llegada = p.tickLlegada || 0;
                const primeraEjecucion = p.tickPrimeraEjecucion || 0;
                if (primeraEjecucion >= llegada) {
                    sumRespuesta += (primeraEjecucion - llegada);
                }
            }
        }

        const tiempoEsperaPromedio = totalProcesos > 0 ? Number((sumEspera / totalProcesos).toFixed(2)) : 0;
        const tiempoRespuestaPromedio = totalProcesos > 0 ? Number((sumRespuesta / totalProcesos).toFixed(2)) : 0;

        const estrategia = state.backendData.configuracion.asignacionMemoria || "FIRST_FIT";
        const etiqueta = state.backendData.configuracion.algoritmoPlanificacion + ' + ' + state.backendData.configuracion.reemplazoPaginas;
        
        const nuevoResultado = {
            id: Date.now().toString(),
            algoritmo: etiqueta,
            ticksTotales: state.backendData.tickActual,
            pageFaults: state.backendData.gestionMemoria.pageFaultsTotales,
            thrashing: state.backendData.gestionMemoria.porcentajeThrashing || 0,
            fragmentacion: state.backendData.gestionMemoria.porcentajeFragmentacion || 0,
            tiempoEspera: tiempoEsperaPromedio,
            tiempoRespuesta: tiempoRespuestaPromedio,
            estrategiaAsignacion: estrategia
        };

        set({ historialResultados: [...state.historialResultados, nuevoResultado] });
    },

    limpiarTimeoutContexto: () => {
        if (timeoutContexto) {
            clearTimeout(timeoutContexto);
            timeoutContexto = null;
        }
    },

    simularCambioContexto: (idProcesoEntrante: string) => {
        // Limpiar cualquier timeout pendiente de dev
        get().limpiarTimeoutContexto();

        set({ estadoDispatcher: "CAMBIANDO_CONTEXTO" });

        timeoutContexto = setTimeout(() => {
            timeoutContexto = null;
            set((state) => {
                if (!state.backendData) return { estadoDispatcher: "IDLE" };
                return {
                    estadoDispatcher: "IDLE",
                    backendData: {
                        ...state.backendData,
                        estadoCPU: {
                            ...state.backendData.estadoCPU,
                            ejecutandoProcesoId: idProcesoEntrante
                        },
                        colasProcesos: {
                            ...state.backendData.colasProcesos,
                            listos: state.backendData.colasProcesos.listos.filter(id => id !== idProcesoEntrante)
                        }
                    }
                };
            });
        }, 1000);
    },

    cargarEstadoMemoria: (datos) => set((state) => ({
        memoria: {
            ...state.memoria,
            marcos: datos.marcos.map((m: any, idx: number) => ({
                idFrame: idx,
                idProceso: m.proceso || undefined,
                estado: m.estado || 'libre',
            })),
        },
        swap: {
            ...state.swap,
            bloques: (datos.swap || []).map((s: any, idx: number) => ({
                idBloque: idx,
                idProceso: s.proceso || undefined,
                estado: s.estado || 'libre',
            })),
        },
    })),

    // --- WebSockets de HEAD ---
    conectarWebSocket: (url: string) => {
        set({ estadoConexionWS: "CONECTANDO" });

        if (wsInstance) {
            wsInstance.close();
        }

        wsInstance = new WebSocket(url);

        wsInstance.onopen = () => {
            set({ estadoConexionWS: "CONECTADO" });
        };

        wsInstance.onerror = (error) => {
            console.error("WebSocket error:", error);
            set({ estadoConexionWS: "ERROR" });
        };

        wsInstance.onclose = () => {
            set({ estadoConexionWS: "DESCONECTADO" });
            wsInstance = null;
        };

        wsInstance.onmessage = (event) => {
            try {
                const payload = JSON.parse(event.data);
                if (payload.error) {
                    console.error("Error desde el backend:", payload.error);
                    return;
                }
                // Sobreescribir masivamente el estado con el payload del backend
                set({ backendData: payload as PayloadBackend });
            } catch (error) {
                console.error("Error al parsear el mensaje del WebSocket", error);
            }
        };
    },

    desconectarWebSocket: () => {
        if (wsInstance) {
            wsInstance.close();
            wsInstance = null;
        }
        set({ estadoConexionWS: "DESCONECTADO" });
    },

    enviarTickWS: () => {
        if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
            wsInstance.send(JSON.stringify({ action: "tick" }));
        }
    },

    enviarComandoWS: (payload: Record<string, unknown>) => {
        if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
            wsInstance.send(JSON.stringify(payload));
        }
    }
}));