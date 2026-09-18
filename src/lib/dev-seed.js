// DEV-ONLY mock seed for screenshot capture. Never imported by production
// code paths: main.js loads this module dynamically behind `import.meta.env.DEV`
// plus the `?mock=1` query flag, and scripts/seed-mock.mjs uses it to emit
// docs/mock-state.json (importable via Settings restore). Pure module: no
// Svelte runes, no localStorage access, safe to import from Node.
import { copy } from './i18n-copy/es.js';
import { STATE_VERSION } from './storage.js';

function todayKey(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Realistic, calm demo content (neutral Spanish). Stable ids keep screenshots
// deterministic across runs.
export function buildMockState() {
  return {
    version: STATE_VERSION,
    disclaimerAccepted: true,
    view: 'day',
    settings: {
      wakeTime: '07:00',
      anchorTimes: {
        despertar: '08:00',
        primera_tarea: '12:30',
        movimiento: '19:00',
        apagado: '22:30',
      },
      blockTimes: {
        manana: '09:00',
        mediodia: '14:00',
        tarde: '18:00',
      },
      blockOrder: ['manana', 'mediodia', 'tarde'],
      defaultTimerMin: 30,
    },
    day: {
      dateKey: todayKey(),
      anchors: [
        { id: 'despertar', time: '08:00', checked: true },
        { id: 'primera_tarea', time: '12:30', checked: false },
        { id: 'movimiento', time: '19:00', checked: false },
        {
          id: 'apagado',
          time: '22:30',
          checked: false,
          apagadoChecklist: copy.day.apagadoChecklist.map((hint, i) => ({
            id: `apagado-${i + 1}`,
            checked: i < 2,
            hint,
          })),
        },
      ],
      blocks: [
        {
          id: 'manana',
          label: copy.day.blocks.manana,
          time: '09:00',
          tasks: [
            { id: 'mock-task-1', title: 'Ordenar el escritorio en 5 minutos', done: true },
            { id: 'mock-task-2', title: 'Responder el mensaje pendiente del curso', done: false },
            { id: 'mock-task-3', title: 'Preparar la lista de compras', done: false },
          ],
        },
        {
          id: 'mediodia',
          label: copy.day.blocks.mediodia,
          time: '14:00',
          tasks: [
            { id: 'mock-task-4', title: 'Caminar 15 minutos sin pantallas', done: false },
            { id: 'mock-task-5', title: 'Llamar para confirmar la cita médica', done: false },
          ],
        },
        {
          id: 'tarde',
          label: copy.day.blocks.tarde,
          time: '18:00',
          tasks: [
            { id: 'mock-task-6', title: 'Leer 10 páginas del libro actual', done: false },
          ],
        },
      ],
      captured: [
        { id: 'mock-captured-1', title: 'Idea: regalar las plantas del balcón', done: false },
      ],
    },
    week: {
      // Step 2 shows the resume banner plus the priorities section populated.
      ritualStep: 2,
      reviewAnswers: [
        'Caminar después de comer ayudó a despejar la mente.',
        'Ajustar el bloque de tarde para dejar espacio libre.',
      ],
      priorities: [
        { id: 'mock-priority-1', title: 'Terminar el informe del curso', done: false },
        { id: 'mock-priority-2', title: 'Organizar los documentos del hogar', done: false },
        { id: 'mock-priority-3', title: 'Planear el menú de la semana', done: false },
      ],
      schedule: [
        { priorityId: 'mock-priority-1', day: 'Lunes', blockId: 'manana' },
        { priorityId: 'mock-priority-2', day: 'Martes', blockId: 'mediodia' },
        { priorityId: 'mock-priority-3', day: 'Miércoles', blockId: 'tarde' },
      ],
    },
  };
}
