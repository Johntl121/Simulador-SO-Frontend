import { create } from 'zustand';
import type { EstadoGlobalSO, Proceso } from '../types/simulador';

// Extendemos el estado global con memoria y swap
interface SimuladorState extends EstadoGlobalSO {
	// Nuevas propiedades
	memoria: {
		marcos: Array<{ idFrame: number; idProceso?: string; estado: 'libre' | 'ocupado' | 'swap' }>;
		tamaño: number;
	};
	swap: {
		bloques: Array<{ idBloque: number; idProceso?: string; estado: 'libre' | 'ocupado' }>;
		tamaño: number;
	};
	// Acciones existentes
	avanzarReloj: () => void;
	setEstadoSimulacion: (estado: "PAUSADO" | "EJECUTANDO") => void;
	setVelocidad: (multiplicador: number) => void;
	simularCambioContexto: (idProcesoEntrante: string) => void;
	limpiarTimeoutContexto: () => void;
	// Nueva acción
	cargarEstadoMemoria: (datos: { marcos: any[]; swap: any[] }) => void;
}

// Variable para el timeout del context switch (usando tipo compatible con navegador)
let timeoutContexto: ReturnType<typeof setTimeout> | null = null;

export const useSimuladorStore = create<SimuladorState>((set, get) => ({
	// --- Estado Inicial Mockeado (Datos falsos para probar) ---
	simulacion: {
		relojGlobal: 0,
		estado: "PAUSADO",
		metricaThrashing: 0,
		velocidadMultiplicador: 1,
	},
	procesador: {
		cpuActiva: { idProceso: "P1", estado: "EJECUTANDO", burstTimeTotal: 10, burstTimeRestante: 5, programCounter: 1024 },
		estadoDispatcher: "IDLE",
	},
	colas: {
		nuevos: [
			{ idProceso: "P5", estado: "NUEVO", burstTimeTotal: 8 },
			{ idProceso: "P6", estado: "NUEVO", burstTimeTotal: 15 },
		],
		listos: [
			{ idProceso: "P2", estado: "LISTO", burstTimeTotal: 5 },
			{ idProceso: "P3", estado: "LISTO", burstTimeTotal: 12 },
			{ idProceso: "P4", estado: "LISTO", burstTimeTotal: 3 },
		],
		bloqueadosES: [
			{ idProceso: "P7", estado: "BLOQUEADO", burstTimeTotal: 20 },
		],
		terminados: [
			{ idProceso: "P0", estado: "TERMINADO", burstTimeTotal: 6 },
		],
	},

	// --- Nuevo estado de memoria y swap ---
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

	// --- Acciones existentes (con comentarios originales) ---

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

	limpiarTimeoutContexto: () => {
		if (timeoutContexto) {
			clearTimeout(timeoutContexto);
			timeoutContexto = null;
		}
	},

	// Fase 3: Simulación de cambio de contexto del Dispatcher (corregido)
	simularCambioContexto: (idProcesoEntrante: string) => {
		// Limpiar cualquier timeout pendiente
		get().limpiarTimeoutContexto();

		// 1. Cambiar estado del Dispatcher a "CAMBIANDO_CONTEXTO"
		set((state) => ({
			procesador: { ...state.procesador, estadoDispatcher: "CAMBIANDO_CONTEXTO" }
		}));

		// 2. Después de 1 segundo, completar el cambio de contexto
		timeoutContexto = setTimeout(() => {
			// Limpiar la referencia
			timeoutContexto = null;

			set((state) => {
				// Obtener el proceso actual en CPU (si existe)
				const procesoActual = state.procesador.cpuActiva;

				// Buscar el proceso entrante en la cola de listos
				const procesoEntrante = state.colas.listos.find(
					(p) => p.idProceso === idProcesoEntrante
				);

				// Si no se encuentra, volver a IDLE y mover el actual a listos (si existe)
				if (!procesoEntrante) {
					let nuevasListos = [...state.colas.listos];
					if (procesoActual) {
						nuevasListos.push({
							...procesoActual,
							estado: "LISTO",
						});
					}
					return {
						procesador: {
							cpuActiva: null,
							estadoDispatcher: "IDLE",
						},
						colas: {
							...state.colas,
							listos: nuevasListos,
						},
					};
				}

				// Construir nueva cola de listos: sacar el entrante y añadir el actual
				let nuevasListos = state.colas.listos.filter(
					(p) => p.idProceso !== idProcesoEntrante
				);
				if (procesoActual) {
					nuevasListos.push({
						...procesoActual,
						estado: "LISTO",
					});
				}

				return {
					procesador: {
						cpuActiva: {
							...procesoEntrante,
							estado: "EJECUTANDO",
							burstTimeRestante: procesoEntrante.burstTimeRestante ?? procesoEntrante.burstTimeTotal,
							programCounter: procesoEntrante.programCounter ?? 0,
						},
						estadoDispatcher: "IDLE",
					},
					colas: {
						...state.colas,
						listos: nuevasListos,
					},
				};
			});
		}, 1000);
	},

	// --- Nueva acción para cargar datos de memoria ---
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
}));