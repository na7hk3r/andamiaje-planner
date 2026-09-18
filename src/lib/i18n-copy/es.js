// Central UI copy — neutral Spanish (design D5).
// This module is the copy-gate source: every user-facing string lives here
// and mirrors the library vocabulary (Anclas, Bloques, Primer paso,
// Recompensa, Temporizador, Prioridades, "Retomar en la próxima ancla",
// "El progreso cuenta"). No shame-based, counter-based or clinical wording.
// Components import strings from here; no literal copy belongs in views.

export const copy = {
  app: {
    title: 'Andamiaje',
    subtitle: 'Un andamio amable para tu atención y tu día',
    tagline: 'Organiza tu día con anclas, bloques y un primer paso claro.',
  },

  welcome: {
    intro:
      'Una herramienta pensada para acompañar tu mente sin exigencias, sin cadenas que cuidar ni notificaciones urgentes.',
    healthTitle: 'Aviso de salud',
    healthBody:
      'No sustituye la evaluación de un profesional de la salud ni reemplaza un plan de apoyo profesional. Es únicamente un andamio personal para facilitar tu organización.',
    privacyBody:
      'Tus datos viven exclusivamente en este navegador. Sin cuentas, sin nube, sin rastreo.',
    cta: 'Comenzar mi día',
    microcopy: 'Paso 1 de 1 · Sin compromisos ni configuración obligatoria',
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
    sectionLabel: 'Secciones',
    day: 'Día',
    focus: 'Enfoque',
    week: 'Semana',
    settings: 'Ajustes',
  },

  topnav: {
    navLabel: 'Navegación principal',
    captureLabel: 'Abrir captura rápida (Ctrl+K)',
    capturePlaceholder: 'Buscar o capturar…',
    shortcut: 'Ctrl K',
    privacyButton: 'Privacidad local activa',
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
    anchorCheckedLabel: 'Marcar ancla {label} como completada',
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
    deleteTaskAria: 'Quitar tarea {task}',
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

    // Stitch "Vista Día" copy — calm, neutral, non-punitive.
    pageTitle: 'Soporte del Día',
    paceOpen: 'Ritmo abierto',
    calmBanner:
      'Cada momento cuenta. Si una tarea queda pendiente, simplemente se retoma cuando sea oportuno.',
    anchorsPageTitle: 'Anclas del Día',
    anchorsSubtitle: 'Puntos de apoyo sin penalización',
    statusDone: 'Completado a tu ritmo',
    statusActive: 'En marcha',
    statusResume: 'Retomar en la próxima ancla (sin culpa)',
    statusScheduled: 'Programado',
    blocksPageTitle: 'Bloques de Tiempo',
    blocksSubtitle: 'Contexto amplio · Sin micro-presión',
    blockEnds: { manana: '13:00', mediodia: '18:00', tarde: '20:00' },
    blockRest: 'Descanso',
    taskOne: 'tarea',
    taskMany: 'tareas',
    emptyBlockGentle:
      'Sin tareas asignadas aún. El descanso también es parte del andamio.',
    startFocus: 'Iniciar enfoque',
    apagadoTitle: 'Ritual de Apagado',
    apagadoSubtitle:
      'Descompresión para cerrar la jornada con tranquilidad y mente despejada.',
    apagadoProgressOf: 'de',
    apagadoProgressDone: 'completado',
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

    // Stitch "Vista Enfoque" copy — calm, neutral, non-punitive.
    sustainedFocus: 'Enfoque sostenido',
    recommended: 'Recomendado',
    durationLabel: 'Duración del tramo',
    timerPresetShort: {
      '20': '20 min',
      '30': '30 min',
      '45': '45 min',
    },
    blockChip: 'Bloque: {label}',
    oneThingAtATime: 'Una sola cosa a la vez',
    pause: 'Pausar',
    resume: 'Reanudar',
    completeTramo: 'Completar tramo',
    exitCalmly: 'Salir con calma al día',
    shortcutsLead: 'Presiona',
    shortcutsPause: 'para pausar o reanudar',
    shortcutsExit: 'para salir al día',
    shortcutsSep: '·',
    keys: {
      space: 'Espacio',
      escape: 'Esc',
    },
    startedAnnounce: 'Temporizador iniciado',
    pausedAnnounce: 'Temporizador en pausa',
    resumedAnnounce: 'Temporizador en marcha',
    rewardStaticTitle:
      '¡Tramo completado! Tómate un respiro, bebe agua o estira la espalda.',
    rewardStaticBody:
      'Tu esfuerzo ya sumó. Sin apresurarte ni evaluarte con exigencia.',
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

    // Stitch "Vista Semana" copy — calm stepper, gentle review, priorities
    // with a protective limit, and a suggested (never enforced) distribution.
    pageTitle: 'Ritual Semanal de Descarga y Planificación',
    pageSubtitle:
      'Un momento tranquilo para cerrar la semana y preparar el terreno de la siguiente, sin autoexigencias.',
    resumeBanner:
      'Retomar el ritual semanal cuando tengas 10 minutos de calma. Puedes pausar en cualquier momento.',
    pauseForToday: 'Pausar por hoy',
    stepperLabel: 'Progreso del ritual semanal',
    stepNumber: 'Paso {n}',
    stepInProgress: 'En curso',
    reviewTitle: 'Revisión amable de la semana',
    reviewSubtitle:
      'Espacio seguro para registrar lo que funcionó, sin métricas ni castigos.',
    savedLocally: 'Guardado localmente',
    prioritiesTitle: '3 Prioridades de la semana',
    prioritiesSubtitle: 'Para no sobrecargar la memoria de trabajo.',
    prioritiesProtection:
      'Máximo 3 prioridades seleccionadas. Esto protege tu capacidad de atención y reduce la sensación de agobio.',
    prioritiesCalmLimit: 'Límite de 3 alcanzado con calma',
    removePriorityAria: 'Quitar prioridad {n}',
    distributionTitle: 'Distribución sugerida en la semana',
    distributionSubtitle:
      'Tus prioridades ancladas en bloques amplios y realistas, sin horas fijas.',
    weekRange: '{start} — {end}',
    priorityTag: 'Prioridad {n}',
    bufferFree: 'Buffer libre',
    bufferFreeBody: 'Espacio sin compromisos y cierre suave',
    softBuffer: 'Espacio suave de descarga',
    completeBanner: 'Ritual semanal listo. Gracias por cuidar tu ritmo.',
    completeBody:
      'No hay cadenas que cuidar ni puntajes que mantener. Solo un soporte constante para tu mente.',
    noJudgment: 'Sin juicio',
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
    modalTitle: 'Captura rápida · Vaciar la mente',
    modalHint:
      'Anota lo que te distrae o lo que quieres hacer más tarde para no guardarlo en tu memoria de trabajo.',
    modalPlaceholder: 'Ej. Enviar la factura pendiente…',
    closeLabel: 'Cerrar modal (Esc)',
    saveLabel: 'Guardar en el andamio',
    kbdHint: '[Esc] para cerrar · [Enter] para guardar',
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

    // Stitch "Ajustes" — calm settings screen copy (spec mock).
    pageBadge: 'Configuración Tranquila',
    pageTitle: 'Ajustes del Andamio',
    pageSubtitle:
      'Personaliza tus anclas y tiempos de apoyo. Recuerda que no necesitas configurar nada para empezar.',
    systemDate: 'Fecha del Sistema',
    systemDateToday: 'Hoy es {date}',
    localZone: 'Zona horaria local detectada',
    synced: 'Sincronizado',
    anchorsTitle: 'Horarios de Anclas del Día',
    anchorsSubtitle: 'Puntos de referencia suaves para organizar tu ritmo circadiano.',
    anchorHints: {
      despertar: 'Luz natural y vaso de agua',
      primera_tarea: 'Revisar la primera micro-tarea',
      movimiento: 'Comer sin pantallas',
      apagado: 'Cerrar pestañas y respirar',
    },
    anchorsNote:
      'Las anclas son puntos de referencia, no metas fijas. No hay penalización si tu horario cambia.',
    blocksTitle: 'Bloques de Tiempo',
    blocksSubtitle:
      'Estructuras amplias para agrupar energía en lugar de minutos rígidos.',
    blockKicker: 'Bloque {n}',
    blockStartLabel: 'Inicio del bloque {label}',
    blockEndLabel: 'Fin del bloque {label}',
    blockRangeTo: 'a',
    focusDurationTitle: 'Duración de Enfoque Predeterminada',
    focusDurationSubtitle:
      'Tiempo de la sesión antes de invitarte a una pausa no obligatoria.',
    focusDurationLabel: 'Selección de minutos de enfoque',
    focusDurationHint:
      'Elige bloques cortos para evitar la fatiga mental y facilitar el inicio.',
    dataTitle: 'Tus Datos y Privacidad Local',
    dataBody:
      'Tus datos viven únicamente en la memoria local de este navegador (localStorage). No existen servidores externos, ni cuentas de usuario, ni cookies de rastreo publicitario.',
    backupHint: 'Copia de tus notas y anclas',
    exportAction: 'Descargar copia de seguridad (JSON)',
    importLabel: 'Importar respaldo',
    restoreAction: 'Restaurar desde archivo JSON',
    importReplaceHint:
      'Reemplazará los datos actuales en este equipo sin enviar nada a internet.',
    clearLabel: 'Limpiar datos locales',
    clearAria: 'Borrar todos los datos guardados en este navegador',
    clearConfirmTitle: '¿Borrar todos los datos locales?',
    clearConfirmBody:
      'Se eliminarán tus anclas, bloques, tareas, respuestas semanales y preferencias guardadas en este navegador. Esta acción no se puede deshacer.',
    clearConfirmAction: 'Borrar todo',
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
    linksLabel: 'Enlaces de pie de página',
    privacyLink: 'Privacidad local',
    accessibilityLink: 'Accesibilidad',
  },
};