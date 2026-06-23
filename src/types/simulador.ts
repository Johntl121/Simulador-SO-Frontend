export type EstadoConexionWS = "DESCONECTADO" | "CONECTANDO" | "CONECTADO" | "ERROR";

export interface Configuracion {
  algoritmoPlanificacion: string;
  quantum: number;
  tamanoPaginaBytes: number;
  asignacionMemoria: string;
  reemplazoPaginas: string;
}

export interface EstadoCPU {
  ejecutandoProcesoId: string | null;
  programCounter: number;
  limite32Bits: string;
}

export interface ColasProcesos {
  nuevos: string[];
  listos: string[];
  bloqueados: string[];
}

export interface MarcoRAM {
  idMarco: number;
  idProcesoAsignado: string | null;
  numeroPaginaAsignada: number;
}

export interface PaginaSwap {
  idProceso: string;
  numeroPagina: number;
}

export interface AreaSwap {
  totalPaginasEnDisco: number;
  paginas: PaginaSwap[];
}

export interface GestionMemoria {
  algoritmoReemplazo: string;
  totalAccesos: number;
  pageFaultsTotales: number;
  porcentajeThrashing: number;
  marcosRAM: MarcoRAM[];
  areaSwap: AreaSwap;
}

export interface DispositivoES {
  nombre: string;
  procesoActualId: string | null;
  tiempoRestanteTick: number;
  colaEspera: string[];
}

export interface Sistema {
  toleranciaFallosExcedida: boolean;
  logs: string[];
}

export interface ProcesoDetalle {
  id: string;
  estado: string;
  burstTimeRestante: number;
}

export interface PayloadBackend {
  tickActual: number;
  configuracion: Configuracion;
  estadoCPU: EstadoCPU;
  colasProcesos: ColasProcesos;
  diccionarioProcesos: Record<string, ProcesoDetalle>;
  gestionMemoria: GestionMemoria;
  dispositivosES: DispositivoES[];
  sistema: Sistema;
}

export interface EstadoGlobalSO {
  // Estado local del UI y conexión
  estadoConexionWS: EstadoConexionWS;
  estadoSimulacionLocal: "PAUSADO" | "EJECUTANDO" | "TERMINADO";
  velocidadMultiplicador: number;
  estadoDispatcher: "IDLE" | "CAMBIANDO_CONTEXTO";

  // Estado sincronizado desde el Backend
  backendData: PayloadBackend | null;
}