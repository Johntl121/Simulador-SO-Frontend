export type EstadoProceso = "NUEVO" | "LISTO" | "EJECUTANDO" | "BLOQUEADO" | "TERMINADO";

export interface Proceso {
  idProceso: string;
  estado: EstadoProceso;
  burstTimeTotal: number;
  burstTimeRestante?: number;
  programCounter?: number;
}

export interface EstadoGlobalSO {
  simulacion: {
    relojGlobal: number;
    estado: "PAUSADO" | "EJECUTANDO" | "TERMINADO";
    metricaThrashing: number;
    velocidadMultiplicador: number;
  };
  procesador: {
    cpuActiva: Proceso | null;
  };
  colas: {
    nuevos: Proceso[];
    listos: Proceso[];
    bloqueadosES: Proceso[];
    terminados: Proceso[];
  };
}