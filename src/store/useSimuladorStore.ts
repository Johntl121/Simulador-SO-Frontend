import { create } from 'zustand';
import type { EstadoGlobalSO, PayloadBackend } from '../types/simulador';

interface SimuladorStore extends EstadoGlobalSO {
    avanzarReloj: () => void;
    setEstadoSimulacion: (estado: "PAUSADO" | "EJECUTANDO") => void;
    setVelocidad: (multiplicador: number) => void;
    simularCambioContexto: (idProcesoEntrante: string) => void;
    conectarWebSocket: (url: string) => void;
    desconectarWebSocket: () => void;
}

// Variable externa para mantener la instancia de WebSocket sin problemas de reactividad
let wsInstance: WebSocket | null = null;

const initialBackendData: PayloadBackend = {
    tickActual: 0,
    configuracion: {
        algoritmoPlanificacion: "RR",
        quantum: 4,
        tamanoPaginaBytes: 4096
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

export const useSimuladorStore = create<SimuladorStore>((set) => ({
    // Estado local
    estadoConexionWS: "DESCONECTADO",
    estadoSimulacionLocal: "PAUSADO",
    velocidadMultiplicador: 1,
    estadoDispatcher: "IDLE",

    // Estado del backend
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

    setVelocidad: (multiplicador: number) => set({ velocidadMultiplicador: multiplicador }),

    simularCambioContexto: (idProcesoEntrante: string) => {
        set({ estadoDispatcher: "CAMBIANDO_CONTEXTO" });
        setTimeout(() => {
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

    // --- WebSockets ---
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
                const payload = JSON.parse(event.data) as PayloadBackend;
                // Sobreescribir masivamente el estado con el payload del backend
                set({ backendData: payload });
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
    }
}));