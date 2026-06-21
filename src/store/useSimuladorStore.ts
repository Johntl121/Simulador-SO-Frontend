import { create } from 'zustand';
import type { EstadoGlobalSO } from '../types/simulador';

interface SimuladorStore extends EstadoGlobalSO {
    avanzarReloj: () => void;
    setEstadoSimulacion: (estado: "PAUSADO" | "EJECUTANDO") => void;
    setVelocidad: (multiplicador: number) => void;
    simularCambioContexto: (idProcesoEntrante: string) => void;
}

export const useSimuladorStore = create<SimuladorStore>((set) => ({
    // Estado Inicial Mockeado (Datos falsos para probar)
    simulacion: { 
        relojGlobal: 0, 
        estado: "PAUSADO", 
        metricaThrashing: 0,
        velocidadMultiplicador: 1
    },
    procesador: {
        cpuActiva: { idProceso: "P1", estado: "EJECUTANDO", burstTimeTotal: 10, burstTimeRestante: 5, programCounter: 1024 },
        estadoDispatcher: "IDLE"
    },
    colas: {
        nuevos: [
            { idProceso: "P5", estado: "NUEVO", burstTimeTotal: 8 },
            { idProceso: "P6", estado: "NUEVO", burstTimeTotal: 15 }
        ],
        listos: [
            { idProceso: "P2", estado: "LISTO", burstTimeTotal: 5 },
            { idProceso: "P3", estado: "LISTO", burstTimeTotal: 12 },
            { idProceso: "P4", estado: "LISTO", burstTimeTotal: 3 }
        ],
        bloqueadosES: [
            { idProceso: "P7", estado: "BLOQUEADO", burstTimeTotal: 20 }
        ],
        terminados: [
            { idProceso: "P0", estado: "TERMINADO", burstTimeTotal: 6 }
        ]
    },

    // Acción de prueba para ver si React actualiza
    avanzarReloj: () => set((state) => ({
        simulacion: { ...state.simulacion, relojGlobal: state.simulacion.relojGlobal + 1 }
    })),

    setEstadoSimulacion: (estado: "PAUSADO" | "EJECUTANDO") => set((state) => ({
        simulacion: { ...state.simulacion, estado }
    })),

    setVelocidad: (multiplicador: number) => set((state) => ({
        simulacion: { ...state.simulacion, velocidadMultiplicador: multiplicador }
    })),

    // Fase 3: Simulación de cambio de contexto del Dispatcher
    simularCambioContexto: (idProcesoEntrante: string) => {
        // 1. Cambiar estado del Dispatcher a "CAMBIANDO_CONTEXTO"
        set((state) => ({
            procesador: { ...state.procesador, estadoDispatcher: "CAMBIANDO_CONTEXTO" }
        }));

        // 2. Después de 1 segundo, completar el cambio de contexto
        setTimeout(() => {
            set((state) => {
                // Buscar el proceso entrante en la cola de listos
                const procesoEntrante = state.colas.listos.find(
                    (p) => p.idProceso === idProcesoEntrante
                );

                // Si no se encuentra en la cola, solo volver a IDLE
                if (!procesoEntrante) {
                    return { procesador: { ...state.procesador, estadoDispatcher: "IDLE" } };
                }

                return {
                    procesador: {
                        cpuActiva: {
                            ...procesoEntrante,
                            estado: "EJECUTANDO" as const,
                            burstTimeRestante: procesoEntrante.burstTimeRestante ?? procesoEntrante.burstTimeTotal,
                            programCounter: procesoEntrante.programCounter ?? 0
                        },
                        estadoDispatcher: "IDLE"
                    },
                    colas: {
                        ...state.colas,
                        listos: state.colas.listos.filter(
                            (p) => p.idProceso !== idProcesoEntrante
                        )
                    }
                };
            });
        }, 1000);
    }
}));