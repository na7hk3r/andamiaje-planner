// Central UI copy — neutral Spanish (design D5).
// This module is the copy-gate source: every user-facing string lives here
// and mirrors the library vocabulary (Anclas, Bloques, Primer paso,
// Recompensa, Temporizador, Prioridades, "Retomar en la próxima ancla",
// "El progreso cuenta"). No shame-based, counter-based or clinical wording.
// Components import strings from here; no literal copy belongs in views.

export const copy = {
  app: {
    title: 'Andamiaje',
    tagline: 'Organiza tu día con anclas, bloques y un primer paso claro.',
  },

  common: {
    save: 'Guardar',
    cancel: 'Cancelar',
    close: 'Cerrar',
    edit: 'Editar',
    add: 'Agregar',
    next: 'Siguiente',
    confirm: 'Confirmar',
    done: 'Hecho',
    remove: 'Quitar',
    back: 'Atrás',
    moveUp: 'Subir',
    moveDown: 'Bajar',
  },

  nav: {
    day: 'Día',
    focus: 'Enfoque',
    week: 'Semana',
    settings: 'Ajustes',
  },

  day: {
    title: 'Tu día',
    anchorsTitle: 'Anclas',
    anchorsHint:
      'Cuatro momentos clave para apoyar tu rutina. Cada ancla es independiente.',
    anchors: {
      despertar: 'Despertar',
      primera_tarea: 'Primera tarea',
      movimiento: 'Movimiento',
      apagado: 'Apagado',
    },
    anchorTimeLabel: 'Hora de la ancla',
    anchorEditHint: 'Toca la hora para ajustarla.',
    blocksTitle: 'Bloques',
    blocks: {
      manana: 'Mañana',
      mediodia: 'Mediodía',
      tarde: 'Tarde',
    },
    swapBlocks: 'Intercambiar bloques',
    swapKeepsTasks: 'Las tareas se mantienen en su bloque.',
    tasksPlaceholder: 'Nueva tarea…',
    taskDoneLabel: 'Tarea terminada',
    apagadoChecklistTitle: 'Antes de cerrar el día',
    apagadoChecklist: [
      'Teléfono fuera',
      'Ropa y mochila listas',
      'Una sola lista',
      'Agua y snacks listos',
      'Temporizador a la vista',
      'Primer paso de la tarea n.º 1',
    ],
    unassigned: 'Sin asignar',
    emptyBlock: 'Todavía no hay tareas aquí.',
    emptyCaptures: 'Todavía no hay capturas.',
  },

  focus: {
    title: 'Enfoque',
    oneTaskHint: 'Una sola tarea a la vez.',
    primerPasoTitle: 'Primer paso',
    primerPasoPrompt: '¿Cuál es el primer paso?',
    primerPasoHint: 'Que te tome menos de dos minutos.',
    primerPasoTooBig: 'El paso parece grande.',
    primerPasoSplit: 'Dividir la tarea en tramos de 20 a 45 minutos.',
    timerTitle: 'Temporizador',
    timerPresets: {
      '20': '20 minutos',
      '30': '30 minutos',
      '45': '45 minutos',
    },
    timerCustom: 'Personalizado',
    timerStart: 'Iniciar',
    timerReset: 'Reiniciar',
    timerVisibleNote:
      'El temporizador cuenta solo mientras la app está visible.',
    timerDone: 'Tiempo completo',
    timerCustomMinutes: 'Minutos',
    noTasks: 'Todavía no hay tareas para enfocar.',
    chooseTaskHint: 'Elige una tarea y ocúpate solo de ella.',
    nextTask: 'Siguiente tarea',
    backToDay: 'Volver al día',
    rewardTitle: 'Recompensa',
    rewardTaskDone: 'Tarea marcada como hecha.',
    rewardSuggestions:
      'Sugerencias: un snack, un paseo corto, un episodio o un juego breve.',
  },

  week: {
    title: 'Semana',
    ritualTitle: 'Ritual semanal',
    steps: [
      {
        name: 'Revisar',
        questions: [
          '¿Qué te funcionó esta semana?',
          '¿Qué ajustarías la próxima?',
        ],
      },
      { name: 'Elegir', hint: 'Hasta 3 prioridades para la semana.' },
      {
        name: 'Programar',
        hint: 'Asigna cada prioridad a un día y a un bloque.',
      },
      { name: 'Preparar', hint: 'Deja el entorno listo de antemano.' },
    ],
    prioritiesMax: 'Máximo 3 prioridades.',
    resumeRitual: 'Retomar el ritual donde lo dejaste.',
    nudgeWeekly: 'Un momento semanal fijo ayuda a mantener el ritmo.',
    days: [
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
      'Domingo',
    ],
    scheduleDay: 'Día',
    scheduleBlock: 'Bloque',
    scheduled: 'Programada',
    noPriorities: 'Elige al menos una prioridad antes de programar.',
    ritualComplete: 'Ritual semanal listo.',
    startNewReview: 'Iniciar una nueva revisión.',
  },

  recovery: {
    resumeNextAnchor: 'Retomar en la próxima ancla',
    progressCounts: 'El progreso cuenta.',
    noCounters: 'Nada se acumula ni se descuenta: cada ancla es independiente.',
  },

  quickCapture: {
    label: 'Captura rápida',
    placeholder: '¿Qué tienes en mente?',
    assignToBlock: 'Asignar a un bloque',
    unassigned: 'Sin asignar',
  },

  settings: {
    title: 'Ajustes',
    wakeTime: 'Hora de despertar',
    anchorTimes: 'Horas de las anclas',
    blockTimes: 'Horas de los bloques',
    blockOrder: 'Orden de los bloques',
    defaultTimer: 'Temporizador por defecto',
    export: 'Exportar datos',
    import: 'Importar datos',
    exportHint: 'Guarda una copia de tu plan en un archivo JSON.',
    importHint: 'Reemplaza el plan actual con el archivo importado.',
    importError: 'El archivo no es un plan válido.',
  },

  disclaimer: {
    title: 'Antes de empezar',
    body:
      'Esta app organiza rutinas diarias y acompaña tu plan. ' +
      'No sustituye la evaluación de un profesional de la salud ' +
      'ni reemplaza un plan de apoyo profesional.',
    acknowledge: 'Entiendo y quiero continuar',
  },

  footer: {
    disclaimer:
      'Organiza rutinas; no sustituye la evaluación de un profesional de la salud.',
  },
};