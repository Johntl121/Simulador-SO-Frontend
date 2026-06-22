import { useEffect } from 'react';
import { useSimuladorStore } from '../store/useSimuladorStore';

export const useRelojGlobal = () => {
  // Extraemos estado, velocidadMultiplicador y la función para avanzar el reloj
  const estado = useSimuladorStore(state => state.estadoSimulacionLocal);
  const velocidadMultiplicador = useSimuladorStore(state => state.velocidadMultiplicador);
  const estadoConexionWS = useSimuladorStore(state => state.estadoConexionWS);
  const avanzarReloj = useSimuladorStore(state => state.avanzarReloj);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    // Si está conectado al WS, el reloj lo dicta el backend, no simulamos localmente.
    if (estado === "EJECUTANDO" && estadoConexionWS !== "CONECTADO") {
      // El tick base es de 1000ms (1 segundo). Calculamos el intervalo actual.
      // Ej: velocidad 1 -> 1000ms, velocidad 2 -> 500ms, velocidad 5 -> 200ms.
      const intervalo = 1000 / velocidadMultiplicador;

      intervalId = setInterval(() => {
        avanzarReloj();
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
  }, [estado, velocidadMultiplicador, estadoConexionWS, avanzarReloj]); // Dependencias del hook
};
