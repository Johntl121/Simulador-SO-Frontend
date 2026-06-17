import { create } from 'zustand';
import type { EstadoGlobalSO } from '../types/simulador';

interface SimuladorStore extends EstadoGlobalSO {
    avanzarReloj: () => void;
}

export const useSimuladorStore = create<SimuladorStore>((set) => ({
    // Estado Inicial Mockeado (Datos falsos para probar)
    simulacion: { relojGlobal: 0, estado: "PAUSADO", metricaThrashing: 0 },
    procesador: {
        cpuActiva: { idProceso: "P1", estado: "EJECUTANDO", burstTimeTotal: 10, burstTimeRestante: 5, programCounter: 1024 }
    },

    // Acción de prueba para ver si React actualiza
    avanzarReloj: () => set((state) => ({
        simulacion: { ...state.simulacion, relojGlobal: state.simulacion.relojGlobal + 1 }
    }))
}));