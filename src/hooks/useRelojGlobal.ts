import { useEffect } from 'react';
import { useSimuladorStore } from '../store/useSimuladorStore';

export const useRelojGlobal = () => {
  // Extraemos estado, velocidadMultiplicador y la función para avanzar el reloj
  const estado = useSimuladorStore(state => state.simulacion.estado);
  const velocidadMultiplicador = useSimuladorStore(state => state.simulacion.velocidadMultiplicador);
  const avanzarReloj = useSimuladorStore(state => state.avanzarReloj);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (estado === "EJECUTANDO") {
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
  }, [estado, velocidadMultiplicador, avanzarReloj]); // Dependencias del hook
};
