# 🖥️ Simulador de Sistema Operativo — Frontend

Un panel de control visual e interactivo diseñado para emular y monitorear el comportamiento interno de un Sistema Operativo. Este frontend representa la interfaz de usuario que visualiza el ciclo de vida de los procesos, el estado de la CPU, las colas de planificación y el comportamiento del planificador y despachador (dispatcher).

El proyecto está construido con un enfoque moderno, responsivo y de alto rendimiento utilizando **Astro**, **React**, **Tailwind CSS** y **Zustand**.

---

## 🚀 Tecnologías Principales

- **[Astro](https://astro.build/)**: Framework web ultrarrápido para estructurar el dashboard e integrar componentes de forma eficiente.
- **[React](https://react.dev/)**: Encargado de la lógica y renderizado dinámico de la interfaz de usuario en el cliente (`client:load`).
- **[Zustand](https://zustand-demo.pmnd.rs/)**: Manejador de estado global ultraligero que permite una sincronización reactiva inmediata entre colas, CPU y controles de tiempo.
- **[Tailwind CSS (v4)](https://tailwindcss.com/)**: Estilos modernos y estética oscura (*dark mode*) premium, con sutiles microanimaciones y efectos visuales de alta calidad.
- **[TypeScript](https://www.typescriptlang.org/)**: Tipado estático estricto para garantizar la estabilidad de los modelos y estados del simulador.

---

## ⚙️ Características Clave

### 1. Control y Motor de Tiempo (Reloj Global)
- **Reloj del Sistema**: El simulador cuenta con un reloj centralizado que mide el tiempo en "Ticks" (unidades lógicas de tiempo).
- **Multiplicadores de Velocidad**: Los controles permiten modificar la velocidad de ejecución en tiempo real (`x1`, `x2`, `x5`). La velocidad base es de 1 Tick/segundo (1000ms), reduciéndose proporcionalmente a 500ms y 200ms respectivamente.
- **Sincronización Reactiva**: Utiliza un Custom Hook optimizado (`useRelojGlobal`) con limpieza automática de intervalos para evitar fugas de memoria (*memory leaks*).

### 2. Gestión Visual de Colas de Procesos
- **Separación de Estados**: Visualización en tiempo real de los procesos según su estado de planificación actual:
  - **Nuevos**: Procesos creados recientemente esperando a ser admitidos.
  - **Listos**: Procesos preparados para entrar a ejecución en la CPU.
  - **Bloqueados (E/S)**: Procesos que se encuentran suspendidos en espera de un evento de entrada/salida.
  - **Terminados**: Historial de procesos que han completado su ciclo de ejecución.
- **Tarjetas Dinámicas**: Cada proceso se representa con su ID, un *badge* coloreado según su estado y su tiempo de ráfaga (*Burst Time*).

### 3. Visor de Procesador (CPU)
- Muestra los datos del proceso activo en ejecución: Identificador, Program Counter (PC) y Tiempo de Ráfaga Restante.
- Simulación manual de ticks para depuración rápida.

### 4. Animación de Cambio de Contexto (Context Switch)
- **Simulación del Dispatcher**: Cuando el despachador realiza un cambio de contexto para alternar entre procesos:
  - Se activa una transición de **1 segundo (1000ms)**.
  - Se muestra una vista de carga animada (`animate-pulse`) indicando *"Dispatcher Activo: Guardando PCB / Cargando nuevo proceso..."*.
  - Se visualiza un spinner animado y una barra de progreso que simula el tiempo de latencia.
  - Al finalizar, el nuevo proceso se carga en la CPU y se extrae automáticamente de la cola de listos.

---

## 📂 Estructura del Proyecto

```text
/
├── public/                  # Favicon e imágenes estáticas
├── src/
│   ├── components/          # Componentes interactivos React
│   │   ├── ColaProcesos.tsx        # Renderiza las diferentes colas del sistema
│   │   ├── ControlesSimulacion.tsx # Panel de control de velocidad y play/pause
│   │   └── CpuViewer.tsx           # Monitor de CPU y simulación de Dispatcher
│   ├── hooks/               # Custom hooks de React
│   │   └── useRelojGlobal.ts       # Motor del intervalo del reloj del sistema
│   ├── layouts/             # Plantillas de diseño en Astro
│   ├── pages/               # Páginas y rutas del sitio
│   │   └── index.astro             # Dashboard principal con diseño de 12 columnas (Grid)
│   ├── store/               # Estado global centralizado
│   │   └── useSimuladorStore.ts    # Store de Zustand con el estado y acciones del SO
│   ├── styles/              # Archivos de estilos CSS
│   │   └── global.css              # Import de Tailwind y animaciones personalizadas
│   └── types/               # Modelos y contratos de TypeScript
│       └── simulador.ts            # Tipado de procesos, CPU y estados de simulación
├── package.json             # Dependencias y scripts de ejecución
└── tsconfig.json            # Configuración de compilación TypeScript
```

---

## 🛠️ Comandos de Ejecución

Todos los comandos deben ejecutarse desde la raíz del proyecto usando la terminal:

| Comando | Acción |
| :--- | :--- |
| `npm install` | Instala las dependencias necesarias. |
| `npm run dev` | Inicia el servidor de desarrollo local en `http://localhost:4321`. |
| `npm run build` | Compila el sitio para producción optimizando el código final. |
| `npm run preview` | Previsualiza localmente el build de producción generado. |
| `npm run astro -- --help` | Obtiene ayuda sobre la CLI de Astro. |

---

## 💻 Desarrollo

Para realizar pruebas del simulador y de las animaciones de cambio de contexto, el componente `CpuViewer` incluye un botón interactivo de desarrollo (`🔄 Context Switch (P2)`). Al pulsarlo, se activará la simulación del dispatcher moviendo el proceso **P2** de la cola de Listos a la CPU tras el correspondiente retraso de guardado de PCB.
