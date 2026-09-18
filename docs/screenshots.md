# Capturas de pantalla (solo desarrollo)

1. Cargar datos de ejemplo: `npm run dev` y abrir `http://localhost:5173/?mock=1` (puerta de bienvenida ya aceptada, vista Día con anclas, 3 bloques con tareas, Semana con 3 prioridades y Ajustes con valores).
2. Alternativa sin flag: `npm run seed:mock` genera `docs/mock-state.json`; restaurarlo en Ajustes → Restaurar desde archivo JSON.
3. Capturar en orden: Día (`#/day`), Enfoque (elegir la primera tarea para ver el primer paso y el temporizador), Semana (`#/week`), Ajustes (`#/settings`) y Ctrl+K para la captura rápida.
4. Validar la semilla: `node scripts/seed-mock.mjs --check`.
5. Limpiar: Ajustes → Limpiar datos locales (acción `clearLocalData`, mantiene la versión de persistencia). Nunca commitear `docs/mock-state.json`.
