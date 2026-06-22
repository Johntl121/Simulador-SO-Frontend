import { useEffect } from 'react';
import { useSimuladorStore } from '../store/useSimuladorStore';

export const useRelojGlobal = () => {
  // Extraemos estado, velocidadMultiplicador y las funciones del store
  const estado = useSimuladorStore(state => state.estadoSimulacionLocal);
  const velocidadMultiplicador = useSimuladorStore(state => state.velocidadMultiplicador);
  const estadoConexionWS = useSimuladorStore(state => state.estadoConexionWS);
  const avanzarReloj = useSimuladorStore(state => state.avanzarReloj);
  const enviarTickWS = useSimuladorStore(state => state.enviarTickWS);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    // Siempre corre el reloj si la app está en modo "EJECUTANDO"
    if (estado === "EJECUTANDO") {
      // El tick base es de 1000ms (1 segundo). Calculamos el intervalo actual.
      // Ej: velocidad 1 -> 1000ms, velocidad 2 -> 500ms, velocidad 5 -> 200ms.
      const intervalo = 1000 / velocidadMultiplicador;

      intervalId = setInterval(() => {
        // Evaluamos si usamos lógica local o pedimos estado al backend remoto (WS)
        if (estadoConexionWS === "CONECTADO") {
          enviarTickWS();
        } else {
          avanzarReloj();
        }
      }, intervalo);
    }

    // Cleanup: limpia el intervalo si el estado cambia a PAUSADO,
    // si la velocidad cambia, o si el componente se desmonta.
    // Esto evita fugas de memoria (memory leaks) y múltiples ciclos solapados.
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [estado, velocidadMultiplicador, estadoConexionWS, avanzarReloj, enviarTickWS]);
};
