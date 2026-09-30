# Andamiaje

![Banner Andamiaje](banner-readme.png)

![version](https://img.shields.io/badge/version-0.1.0-334155?style=flat-square) ![svelte](https://img.shields.io/badge/svelte-5-475569?style=flat-square) ![vite](https://img.shields.io/badge/vite-6-64748b?style=flat-square) ![vitest](https://img.shields.io/badge/vitest-3-64748b?style=flat-square) ![local-first](https://img.shields.io/badge/local--first-privacidad-475569?style=flat-square) ![español](https://img.shields.io/badge/idioma-espa%C3%B1ol_neutro-334155?style=flat-square)

Un andamio amable para tu atención y tu día. Organiza tu día con anclas, bloques y un primer paso claro.

## Qué es

Andamiaje es un planificador de rutinas diarias local-first, pensado para acompañar la atención sin exigencias ni culpa. Está dirigido a personas que buscan estructura suave: puntos de apoyo a lo largo del día, una sola tarea a la vez y un cierre tranquilo.


## Funciones principales

- **Vista Día:** 4 anclas independientes (Despertar, Primera tarea, Movimiento, Apagado), 3 bloques amplios (Mañana, Mediodía, Tarde) y lista de tareas por bloque.
- **Vista Enfoque:** primer paso de menos de dos minutos, temporizador con tramos de 20, 30 y 45 minutos más duración personalizada, pausa y reanudación, y mensaje de recompensa sin exigencias.
- **Vista Semana:** ritual semanal en 4 pasos (Revisar, Elegir, Programar, Preparar) con un máximo de 3 prioridades y distribución sugerida sin horas rígidas.
- **Captura rápida:** modal global con atajo Ctrl+K (o Cmd+K) para vaciar la mente y asignar la nota a un bloque.
- **Ajustes tranquilos:** horarios de anclas y bloques, orden de bloques, duración de enfoque por defecto, exportación e importación de respaldo en JSON y borrado de datos locales.
- **Puerta de bienvenida:** aviso de salud explícito en el primer uso y recordatorio permanente en el pie de página.

## Diseño

Tipografía Outfit para titulares e Inter para el cuerpo, ambas autohospedadas como fuentes variables sin red externa. Iconografía con Material Symbols Outlined. Paleta clara y calmada con superficies suaves, acento azul pizarra y señales cálidas no punitivas. Tono de voz neutro y amable en español, sin contadores, rachas ni lenguaje clínico.

## Inicio rápido

```bash
npm install
npm run dev
```

```bash
npm run build
npm test
```

La aplicación se abre en el navegador en la dirección que indique Vite. `npm test` ejecuta la suite de Vitest (lógica pura en entorno Node).

## Estructura del proyecto

```text
src/
  App.svelte            # Contenedor principal y puerta de bienvenida
  main.js               # Montaje y carga de fuentes
  components/
    day/                # Vista del día: anclas, bloques, tareas, apagado
    focus/              # Vista de enfoque: primer paso, temporizador
    week/               # Ritual semanal y prioridades
    layout/             # Navegación, captura rápida y pie
    settings/           # Ajustes y privacidad
  lib/
    store/              # Estado de la aplicación y captura
    logic/              # Temporizador y recuperación sin culpa
    i18n-copy/es.js     # Textos de la interfaz en español neutro
    storage.js          # Persistencia local versionada
```

## Privacidad local-first

Todos los datos viven exclusivamente en el `localStorage` de este navegador, con guardado versionado y con retardo. No hay cuentas, nube ni rastreo. Es posible exportar una copia en JSON o borrar todos los datos desde Ajustes. La aplicación no sustituye la evaluación de un profesional de la salud.


<a href="https://github.com/Gentleman-Programming/gentle-ai">
  <img width="220" src="https://raw.githubusercontent.com/Gentleman-Programming/gentle-ai/main/docs/assets/brand/built-with-gentle-ai.png" alt="Built with Gentle-AI" />
</a>
