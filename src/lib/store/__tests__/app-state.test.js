// Smoke test for the runes store (design D1: pure-node environment, no
// jsdom). The store module is imported dynamically after an in-memory
// localStorage substitute is installed, so the persistence path of
// storage.js runs under node (Node 24 exposes no localStorage global).
//
// D3 structural ban: the AppState may only carry the contract keys. Any
// extra field — day-lost flags, streak fields, counters, drift tracking —
// fails these allowed-keys checks, so the ban holds without a vocabulary.

import { describe, it, expect, afterEach, afterAll, vi } from 'vitest';
import { copy } from '../../i18n-copy/es.js';
import { STORAGE_KEY, STATE_VERSION } from '../../storage.js';

// In-memory localStorage substitute (worker-local, never touches disk).
const mem = new Map();
if (typeof localStorage === 'undefined') {
  globalThis.localStorage = {
    getItem: (key) => (mem.has(key) ? mem.get(key) : null),
    setItem: (key, value) => mem.set(key, String(value)),
    removeItem: (key) => mem.delete(key),
    clear: () => mem.clear(),
  };
}

// The store is imported only after the stub above is installed (top-level
// await keeps the ordering explicit). Subsequent fresh imports use
// vi.resetModules() and re-read the stub, simulating an app reload.
const { appState, focus, actions, resolveDefaultPreset } = await import('../app-state.svelte.js');

const APPSTATE_KEYS = ['version', 'settings', 'day', 'week', 'view', 'disclaimerAccepted'];
const SETTINGS_KEYS = ['wakeTime', 'anchorTimes', 'blockTimes', 'blockOrder', 'defaultTimerMin'];
const DAY_KEYS = ['dateKey', 'anchors', 'blocks', 'captured'];
const ANCHOR_KEYS = ['id', 'time', 'checked', 'apagadoChecklist'];
const CHECKLIST_ITEM_KEYS = ['id', 'checked', 'hint'];
const BLOCK_KEYS = ['id', 'label', 'time', 'tasks'];
const TASK_KEYS = ['id', 'title', 'done'];
const WEEK_KEYS = ['ritualStep', 'reviewAnswers', 'priorities', 'schedule'];
const SCHEDULE_ITEM_KEYS = ['priorityId', 'day', 'blockId'];

function assertKeys(value, allowed) {
  for (const key of Object.keys(value)) {
    expect(allowed).toContain(key);
  }
}

function assertFullShape(value) {
  assertKeys(value, APPSTATE_KEYS);
  assertKeys(value.settings, SETTINGS_KEYS);
  assertKeys(value.day, DAY_KEYS);
  for (const anchor of value.day.anchors) {
    assertKeys(anchor, ANCHOR_KEYS);
    if (anchor.apagadoChecklist) {
      for (const item of anchor.apagadoChecklist) assertKeys(item, CHECKLIST_ITEM_KEYS);
    }
  }
  for (const block of value.day.blocks) {
    assertKeys(block, BLOCK_KEYS);
    for (const task of block.tasks) assertKeys(task, TASK_KEYS);
  }
  for (const task of value.day.captured) assertKeys(task, TASK_KEYS);
  assertKeys(value.week, WEEK_KEYS);
  for (const task of value.week.priorities) assertKeys(task, TASK_KEYS);
  for (const item of value.week.schedule) assertKeys(item, SCHEDULE_ITEM_KEYS);
}

// Lets pending debounced writes (300 ms) from earlier tests settle before
// a test plants or clears persisted state.
async function settle() {
  await new Promise((resolve) => setTimeout(resolve, 350));
}

// Fresh store instance simulating an app reload.
async function reloadStore() {
  vi.resetModules();
  return import('../app-state.svelte.js');
}

afterEach(() => {
  vi.useRealTimers();
});

afterAll(async () => {
  await settle();
  localStorage.clear();
});

describe('fresh store shape (design contract)', () => {
  it('exposes exactly the AppState contract keys with version 1', () => {
    assertFullShape(appState);
    expect(appState.version).toBe(1);
    expect(appState.view).toBe('day');
    expect(appState.disclaimerAccepted).toBe(false);
    expect(appState.week.ritualStep).toBe(1);
  });

  it('keys the day with the local calendar date on a clean start', async () => {
    await settle();
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 18, 10, 0));
    const fresh = await reloadStore();
    expect(fresh.appState.day.dateKey).toBe('2026-09-18');
    vi.useRealTimers();
  });

  it('builds 4 independent anchors whose times come from the default schedule', () => {
    expect(appState.day.anchors.map((a) => a.id)).toEqual([
      'despertar',
      'primera_tarea',
      'movimiento',
      'apagado',
    ]);
    expect(appState.day.anchors.map((a) => a.time)).toEqual(['08:00', '12:30', '19:00', '22:30']);
    expect(appState.day.anchors.every((a) => a.checked === false)).toBe(true);
  });

  it('embeds the apagado checklist with copy-gate hints from es.js', () => {
    const apagado = appState.day.anchors.find((a) => a.id === 'apagado');
    expect(apagado.apagadoChecklist).toHaveLength(6);
    expect(apagado.apagadoChecklist.map((i) => i.id)).toEqual([
      'apagado-1',
      'apagado-2',
      'apagado-3',
      'apagado-4',
      'apagado-5',
      'apagado-6',
    ]);
    expect(apagado.apagadoChecklist.map((i) => i.hint)).toEqual(copy.day.apagadoChecklist);
    expect(apagado.apagadoChecklist.every((i) => i.checked === false)).toBe(true);
  });

  it('builds 3 blocks labeled from es.js with empty task lists', () => {
    expect(appState.day.blocks.map((b) => b.id)).toEqual(['manana', 'mediodia', 'tarde']);
    expect(appState.day.blocks.map((b) => b.label)).toEqual([
      copy.day.blocks.manana,
      copy.day.blocks.mediodia,
      copy.day.blocks.tarde,
    ]);
    expect(appState.day.blocks.every((b) => b.tasks.length === 0)).toBe(true);
  });
});

describe('actions — view and disclaimer', () => {
  it('acknowledges the disclaimer', () => {
    actions.acknowledgeDisclaimer();
    expect(appState.disclaimerAccepted).toBe(true);
  });

  it('switches views only within the allowed set', () => {
    expect(actions.setView('week')).toBe(true);
    expect(appState.view).toBe('week');
    expect(actions.setView('bogus')).toBe(false);
    expect(appState.view).toBe('week');
    actions.setView('day');
  });
});

describe('actions — anchors (recovery wiring)', () => {
  it('toggles only the target anchor, leaving the others untouched', () => {
    const before = appState.day.anchors;
    actions.setAnchorChecked('despertar', true);
    expect(appState.day.anchors[0].checked).toBe(true);
    expect(appState.day.anchors[0]).not.toBe(before[0]); // changed copy
    expect(appState.day.anchors[1]).toBe(before[1]); // identity preserved
    expect(appState.day.anchors[2]).toBe(before[2]);
    expect(appState.day.anchors[3]).toBe(before[3]);
    expect(before[0].checked).toBe(false); // original not mutated
    actions.setAnchorChecked('despertar', false);
  });

  it('toggles one apagado checklist item at a time', () => {
    actions.toggleApagadoItem('apagado-2');
    const apagado = appState.day.anchors.find((a) => a.id === 'apagado');
    expect(apagado.apagadoChecklist[1].checked).toBe(true);
    expect(apagado.apagadoChecklist.filter((i) => i.checked).length).toBe(1);
    actions.toggleApagadoItem('apagado-2');
    expect(apagado.apagadoChecklist[1].checked).toBe(false);
  });

  it('applies an anchor time to the day and to settings immediately', () => {
    expect(actions.setAnchorTime('movimiento', '18:30')).toBe(true);
    expect(appState.day.anchors.find((a) => a.id === 'movimiento').time).toBe('18:30');
    expect(appState.settings.anchorTimes.movimiento).toBe('18:30');
    expect(actions.setAnchorTime('movimiento', 'sin-hora')).toBe(false);
    actions.setAnchorTime('movimiento', '19:00');
  });

  it('picks the next scheduled anchor as the resume point', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 18, 10, 0));
    expect(actions.nextResumeAnchor().id).toBe('primera_tarea');
    actions.setAnchorChecked('primera_tarea', true);
    expect(actions.nextResumeAnchor().id).toBe('movimiento');
    actions.setAnchorChecked('primera_tarea', false);
    vi.useRealTimers();
  });
});

describe('actions — blocks', () => {
  it('adds a task to a block and rejects empty or unknown blocks', () => {
    expect(actions.addTask('manana', 'Revisar correo')).toBe(true);
    expect(actions.addTask('manana', '   ')).toBe(false);
    expect(actions.addTask('nope', 'Tarea')).toBe(false);
    const manana = appState.day.blocks.find((b) => b.id === 'manana');
    expect(manana.tasks).toHaveLength(1);
    assertKeys(manana.tasks[0], TASK_KEYS);
  });

  it('swaps block order without detaching tasks and syncs settings', () => {
    const manana = appState.day.blocks.find((b) => b.id === 'manana');
    const taskBefore = manana.tasks[0];
    expect(actions.swapBlocks('manana', 'tarde')).toBe(true);
    expect(appState.day.blocks.map((b) => b.id)).toEqual(['tarde', 'mediodia', 'manana']);
    expect(appState.settings.blockOrder).toEqual(['tarde', 'mediodia', 'manana']);
    const mananaAfter = appState.day.blocks.find((b) => b.id === 'manana');
    expect(mananaAfter.tasks[0]).toBe(taskBefore); // task kept its block
    actions.swapBlocks('manana', 'tarde');
    expect(appState.day.blocks.map((b) => b.id)).toEqual(['manana', 'mediodia', 'tarde']);
    expect(appState.settings.blockOrder).toEqual(['manana', 'mediodia', 'tarde']);
  });

  it('marks a task done or not wherever it lives', () => {
    const manana = appState.day.blocks.find((b) => b.id === 'manana');
    const task = manana.tasks[0];
    expect(actions.setTaskDone(task.id, true)).toBe(true);
    expect(manana.tasks[0].done).toBe(true);
    expect(actions.setTaskDone(task.id, false)).toBe(true);
    expect(manana.tasks[0].done).toBe(false);
    expect(actions.setTaskDone('missing-task', true)).toBe(false);
  });
});

describe('actions — quick capture', () => {
  it('keeps unassigned captures in the day view', () => {
    const before = appState.day.captured.length;
    expect(actions.capture('Sacar turno')).toBe(true);
    expect(appState.day.captured).toHaveLength(before + 1);
    expect(appState.day.captured.at(-1).title).toBe('Sacar turno');
    assertKeys(appState.day.captured.at(-1), TASK_KEYS);
  });

  it('places assigned captures in the given block', () => {
    const beforeBlock = appState.day.blocks.find((b) => b.id === 'mediodia').tasks.length;
    const beforeCaptured = appState.day.captured.length;
    expect(actions.capture('Enfoque profundo', 'mediodia')).toBe(true);
    expect(appState.day.blocks.find((b) => b.id === 'mediodia').tasks).toHaveLength(beforeBlock + 1);
    expect(appState.day.captured).toHaveLength(beforeCaptured); // unchanged
  });
});

describe('actions — week ritual', () => {
  it('stores the two review answers', () => {
    actions.setReviewAnswers(['La rutina de la mañana', 'Más movimiento']);
    expect(appState.week.reviewAnswers).toEqual(['La rutina de la mañana', 'Más movimiento']);
  });

  it('caps priorities at 3 and removes them', () => {
    expect(actions.addPriority('Preparar la charla')).toBe(true);
    expect(actions.addPriority('Llamar al dentista')).toBe(true);
    expect(actions.addPriority('Ordenar el escritorio')).toBe(true);
    expect(appState.week.priorities).toHaveLength(3);
    expect(actions.addPriority('Cuarta prioridad')).toBe(false);
    const firstId = appState.week.priorities[0].id;
    actions.removePriority(firstId);
    expect(appState.week.priorities).toHaveLength(2);
  });

  it('promotes an existing task to a priority without duplicating', () => {
    const block = appState.day.blocks.find((b) => b.id === 'manana');
    const task = block.tasks[0];
    expect(actions.addPriorityTask(task.id)).toBe(true);
    expect(appState.week.priorities.at(-1).title).toBe(task.title);
    expect(actions.addPriorityTask(task.id)).toBe(false); // already a priority
  });

  it('advances the ritual through 4 steps and never past them', () => {
    actions.setRitualStep(2);
    actions.advanceRitualStep();
    expect(appState.week.ritualStep).toBe(3);
    actions.setRitualStep(4);
    actions.advanceRitualStep();
    expect(appState.week.ritualStep).toBe(4); // 4th step closes the ritual
    actions.setRitualStep(9);
    expect(appState.week.ritualStep).toBe(4);
    actions.setRitualStep(0);
    expect(appState.week.ritualStep).toBe(1);
  });

  it('records a priority in the weekly schedule', () => {
    const priority = appState.week.priorities[0];
    expect(actions.schedulePriority(priority.id, '2026-09-19', 'manana')).toBe(true);
    expect(appState.week.schedule.at(-1)).toEqual({
      priorityId: priority.id,
      day: '2026-09-19',
      blockId: 'manana',
    });
    expect(actions.schedulePriority('missing', '2026-09-19', 'manana')).toBe(false);
  });
});

describe('actions — settings sync to the day view', () => {
  it('updates the default timer and clamps it', () => {
    expect(actions.updateSettings({ defaultTimerMin: 45 })).toBe(true);
    expect(appState.settings.defaultTimerMin).toBe(45);
    actions.updateSettings({ defaultTimerMin: 9999 });
    expect(appState.settings.defaultTimerMin).toBe(120);
    actions.updateSettings({ defaultTimerMin: 0 });
    expect(appState.settings.defaultTimerMin).toBe(1);
    actions.updateSettings({ defaultTimerMin: 25 });
  });

  it('applies block order and block times to the day immediately', () => {
    expect(actions.setBlockOrder(['tarde', 'manana', 'mediodia'])).toBe(true);
    expect(appState.day.blocks.map((b) => b.id)).toEqual(['tarde', 'manana', 'mediodia']);
    expect(actions.setBlockOrder(['tarde', 'manana'])).toBe(false);
    actions.setBlockOrder(['manana', 'mediodia', 'tarde']);

    actions.updateSettings({ blockTimes: { manana: '08:30' } });
    expect(appState.day.blocks.find((b) => b.id === 'manana').time).toBe('08:30');
    expect(appState.settings.blockTimes.manana).toBe('08:30');
    actions.updateSettings({ blockTimes: { manana: '09:00' } });
  });

  it('updates the wake time', () => {
    expect(actions.setWakeTime('06:30')).toBe(true);
    expect(appState.settings.wakeTime).toBe('06:30');
    expect(actions.setWakeTime('no')).toBe(false);
    actions.setWakeTime('07:00');
  });
});

describe('settings — default timer preset surfaced in focus (C1)', () => {
  it('resolves the active preset from defaultTimerMin, exact and normalized', () => {
    expect(resolveDefaultPreset(20)).toBe(20);
    expect(resolveDefaultPreset(30)).toBe(30);
    expect(resolveDefaultPreset(45)).toBe(45);
    expect(resolveDefaultPreset(50)).toBe(45); // nearest preset
    expect(resolveDefaultPreset(40)).toBe(45); // nearest preset (upper)
    expect(resolveDefaultPreset(25)).toBe(20); // tie resolves to shorter
    expect(resolveDefaultPreset(1)).toBe(20); // below the presets
    expect(resolveDefaultPreset(120)).toBe(45); // above the presets
  });

  it('starts with the configured default minutes when no preset is chosen', () => {
    actions.updateSettings({ defaultTimerMin: 45 });
    expect(actions.startTimer()).toBe(45 * 60_000); // no-arg fallback
    expect(focus.timerDurationMs).toBe(45 * 60_000);
    actions.timerReset();
    actions.updateSettings({ defaultTimerMin: 25 });
  });
});

describe('actions — timer (slice-1 Timer interface)', () => {
  it('starts a countdown and ticks to zero under fake time', () => {
    const task = appState.day.blocks.find((b) => b.id === 'manana').tasks[0];
    expect(actions.startFocus(task.id)).toBe(true);
    expect(focus.currentTask).toEqual({
      taskId: task.id,
      title: task.title,
      source: 'block',
      blockId: 'manana',
    });

    vi.useFakeTimers();
    const t0 = new Date(2026, 8, 18, 10, 0);
    vi.setSystemTime(t0);
    expect(actions.startTimer(60_000)).toBe(60_000);
    expect(focus.timerState).toBe('running');
    expect(focus.timerRemainingMs).toBe(60_000);

    vi.setSystemTime(new Date(t0.getTime() + 30_000));
    expect(actions.timerTick()).toBe(30_000);
    expect(focus.timerState).toBe('running');

    vi.setSystemTime(new Date(t0.getTime() + 61_000));
    expect(actions.timerTick()).toBe(0);
    expect(focus.timerState).toBe('done');
    expect(appState.day.blocks.find((b) => b.id === 'manana').tasks[0].done).toBe(true);
    expect(focus.reward).toEqual({ taskId: task.id, title: task.title });
    vi.useRealTimers();
  });

  it('resets the countdown and clears the reward', () => {
    actions.timerReset();
    expect(focus.timerState).toBe('idle');
    expect(focus.timerRemainingMs).toBe(0);
    expect(focus.timerDurationMs).toBe(0);
    expect(focus.reward).toBeNull();
    expect(focus.currentTask).toBeNull();
  });

  it('exposes the standard presets', () => {
    expect(actions.timerPresets()).toEqual([20, 30, 45]);
  });

  it('pauses and resumes keeping the remaining time, without touching task flags', () => {
    const block = appState.day.blocks.find((b) => b.id === 'mediodia');
    const task = block.tasks[0];
    actions.startFocus(task.id);
    vi.useFakeTimers();
    const t0 = new Date(2026, 8, 18, 10, 0);
    vi.setSystemTime(t0);
    actions.startTimer(60_000);
    vi.setSystemTime(new Date(t0.getTime() + 15_000));
    expect(actions.timerTick()).toBe(45_000);

    expect(actions.pauseTimer()).toBe(true);
    expect(focus.timerState).toBe('paused');
    expect(focus.timerRemainingMs).toBe(45_000);

    // Wall clock keeps moving while paused: the remainder stays frozen.
    vi.setSystemTime(new Date(t0.getTime() + 40_000));
    expect(actions.timerTick()).toBe(45_000);
    expect(focus.timerState).toBe('paused');

    vi.setSystemTime(new Date(t0.getTime() + 41_000));
    expect(actions.resumeTimer()).toBe(true);
    expect(focus.timerState).toBe('running');
    expect(focus.timerRemainingMs).toBe(45_000);

    vi.setSystemTime(new Date(t0.getTime() + 51_000));
    expect(actions.timerTick()).toBe(35_000);
    expect(task.done).toBe(false); // pause/resume never marks anything done
    vi.useRealTimers();
    actions.timerReset();
  });

  it('rejects pause while idle and resume while running', () => {
    actions.timerReset();
    expect(actions.pauseTimer()).toBe(false); // idle: nothing to pause
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 18, 10, 0));
    actions.startTimer(30_000);
    expect(actions.resumeTimer()).toBe(false); // already running
    expect(focus.timerState).toBe('running');
    vi.useRealTimers();
    actions.timerReset();
  });

  it('completes the tramo early: task done once, reward shown, timer idle', () => {
    const block = appState.day.blocks.find((b) => b.id === 'mediodia');
    const task = block.tasks[0];
    actions.startFocus(task.id);
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 18, 10, 0));
    actions.startTimer(30 * 60_000);
    vi.setSystemTime(new Date(2026, 8, 18, 10, 12));
    actions.timerTick();
    expect(actions.completeFocusTramo()).toBe(true);
    expect(task.done).toBe(true);
    expect(focus.reward).toEqual({ taskId: task.id, title: task.title });
    expect(focus.timerState).toBe('idle');
    expect(focus.timerRemainingMs).toBe(0);
    expect(focus.timerDurationMs).toBe(0);
    expect(actions.completeFocusTramo()).toBe(false); // reward already set
    vi.useRealTimers();
  });
});

describe('actions — start focus from a task (Day view bridge)', () => {
  it('sets the focus candidate and switches to the focus view', () => {
    const block = appState.day.blocks.find((b) => b.id === 'mediodia');
    const task = block.tasks[0];
    expect(actions.startFocusFromTask(task.id)).toBe(true);
    expect(focus.currentTask).toEqual({
      taskId: task.id,
      title: task.title,
      source: 'block',
      blockId: 'mediodia',
    });
    expect(appState.view).toBe('focus');
    expect(actions.startFocusFromTask('missing-task')).toBe(false);
    expect(appState.view).toBe('focus'); // failed lookup leaves the view untouched
    actions.setView('day');
  });

  it('resolves unassigned captures the same way', () => {
    actions.capture('Enfocar en un rato');
    const captured = appState.day.captured.at(-1);
    expect(actions.startFocusFromTask(captured.id)).toBe(true);
    expect(focus.currentTask).toEqual({
      taskId: captured.id,
      title: captured.title,
      source: 'captured',
      blockId: null,
    });
    expect(appState.view).toBe('focus');
    actions.setView('day');
  });
});

describe('actions — export / import roundtrip', () => {
  it('roundtrips field-for-field through import', () => {
    const exported = JSON.parse(actions.exportJson());
    assertKeys(exported, APPSTATE_KEYS);
    expect(exported).not.toHaveProperty('focus'); // transient state stays out
    expect(actions.importJson(JSON.stringify(exported))).toBe(true);
    expect(JSON.parse(actions.exportJson())).toEqual(exported);
  });

  it('rejects unsupported versions, corrupt payloads, and partial shapes', () => {
    expect(actions.importJson('not json')).toBe(false);
    expect(actions.importJson(JSON.stringify({ version: 2 }))).toBe(false);
    expect(actions.importJson(JSON.stringify({ version: 1, day: null }))).toBe(true);
    expect(appState.day).not.toBeNull(); // defaults fill the null key
  });
});

describe('actions — removeTask / clearLocalData', () => {
  it('removes a block task and reports false for unknown ids', () => {
    const block = appState.day.blocks.find((b) => b.id === 'manana');
    expect(actions.addTask('manana', 'Tarea a quitar')).toBe(true);
    const taskId = block.tasks.at(-1).id;
    expect(actions.removeTask(taskId)).toBe(true);
    expect(block.tasks.some((t) => t.id === taskId)).toBe(false);
    expect(actions.removeTask('does-not-exist')).toBe(false);
  });

  it('removes an unassigned capture', () => {
    actions.capture('Borrar después');
    const capturedId = appState.day.captured.at(-1).id;
    expect(actions.removeTask(capturedId)).toBe(true);
    expect(appState.day.captured.some((t) => t.id === capturedId)).toBe(false);
  });

  it('removes a promoted priority along with its schedule entries', () => {
    const block = appState.day.blocks.find((b) => b.id === 'mediodia');
    if (block.tasks.length === 0) actions.addTask('mediodia', 'Tarea con prioridad');
    const task = block.tasks[0];
    actions.setTaskDone(task.id, false);
    expect(actions.addPriorityTask(task.id)).toBe(true);
    expect(actions.schedulePriority(task.id, '2026-09-20', 'mediodia')).toBe(true);
    expect(actions.removeTask(task.id)).toBe(true);
    expect(appState.week.priorities.some((p) => p.id === task.id)).toBe(false);
    expect(appState.week.schedule.some((s) => s.priorityId === task.id)).toBe(false);
  });

  it('clears the focus candidate when the removed task is the one in focus', () => {
    const block = appState.day.blocks.find((b) => b.id === 'tarde');
    if (block.tasks.length === 0) actions.addTask('tarde', 'Tarea enfocada');
    const task = block.tasks[0];
    expect(actions.startFocus(task.id)).toBe(true);
    expect(focus.currentTask.taskId).toBe(task.id);
    expect(actions.removeTask(task.id)).toBe(true);
    expect(focus.currentTask).toBeNull();
    expect(focus.timerState).toBe('idle');
    expect(focus.reward).toBeNull();
  });

  it('wipes persisted data back to clean defaults and survives a reload', async () => {
    await settle();
    const seeded = await reloadStore();
    seeded.actions.addTask('manana', 'Tarea a borrar');
    seeded.actions.setAnchorChecked('despertar', true);
    seeded.actions.updateSettings({ defaultTimerMin: 45 });
    seeded.actions.setReviewAnswers(['Una respuesta']);
    seeded.actions.acknowledgeDisclaimer();
    await settle(); // debounced writes land

    const cleared = await reloadStore();
    expect(cleared.actions.clearLocalData()).toBe(true);
    await settle(); // immediate write lands

    const fresh = await reloadStore();
    expect(fresh.appState.day.blocks.every((b) => b.tasks.length === 0)).toBe(true);
    expect(fresh.appState.day.anchors.every((a) => a.checked === false)).toBe(true);
    expect(fresh.appState.week.reviewAnswers).toEqual(['', '']);
    expect(fresh.appState.settings.defaultTimerMin).toBe(30); // fresh defaults
    expect(fresh.appState.disclaimerAccepted).toBe(false);
    assertFullShape(fresh.appState);
  });
});

describe('D6 — dateKey is display-only, nothing auto-resets', () => {
  it('restores a stored date and anchor state on reload instead of resetting', async () => {
    await settle();

    // Plant a persisted state dated in the past with one anchor checked.
    const stored = JSON.parse(actions.exportJson());
    stored.day.dateKey = '2026-09-01';
    stored.day.anchors = stored.day.anchors.map((a) =>
      a.id === 'despertar' ? { ...a, checked: true } : a,
    );
    stored.view = 'week';
    stored.disclaimerAccepted = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    // Reload "today" on a different calendar day: no auto-reset may run.
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 18, 10, 0)); // two weeks later
    const fresh = await reloadStore();
    vi.useRealTimers();

    expect(fresh.appState.day.dateKey).toBe('2026-09-01'); // restored, not regenerated
    expect(fresh.appState.day.anchors.find((a) => a.id === 'despertar').checked).toBe(true);
    expect(fresh.appState.day.anchors.every((a) => a.checked === false)).toBe(false);
    expect(fresh.appState.view).toBe('week');
    expect(fresh.appState.disclaimerAccepted).toBe(true);
    assertFullShape(fresh.appState);
  });
});

describe('persistence — reload edge cases (verify S1/S2)', () => {
  it('starts clean instead of crashing when the stored version is newer', async () => {
    // Unsupported-version gate (storage.js loadState): a payload carrying a
    // newer version than STATE_VERSION is indistinguishable from "app was
    // written by a future build" -> clean start, never a crash.
    await settle();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: STATE_VERSION + 1, settings: { defaultTimerMin: 55 } }),
    );
    const fresh = await reloadStore();
    expect(fresh.appState.version).toBe(STATE_VERSION);
    expect(fresh.appState.settings.defaultTimerMin).toBe(30); // clean defaults
    assertFullShape(fresh.appState);
  });

  it('restores a mid-ritual week intact through the persist/load path', async () => {
    // Seed the week state through store actions (persist side), then reload:
    // ritualStep/answers/priorities/schedule must come back field-for-field.
    await settle();
    const seeded = await reloadStore();
    seeded.actions.setRitualStep(2);
    seeded.actions.setReviewAnswers(['La rutina de la mañana', 'Más movimiento']);
    seeded.actions.addPriority('Preparar la charla');
    const priorityId = seeded.appState.week.priorities.at(-1).id;
    seeded.actions.schedulePriority(priorityId, '2026-09-19', 'manana');
    await settle(); // debounced write lands

    const fresh = await reloadStore();
    expect(fresh.appState.week.ritualStep).toBe(2);
    expect(fresh.appState.week.reviewAnswers).toEqual(['La rutina de la mañana', 'Más movimiento']);
    expect(fresh.appState.week.priorities).toEqual([
      { id: priorityId, title: 'Preparar la charla', done: false },
    ]);
    expect(fresh.appState.week.schedule).toEqual([
      { priorityId, day: '2026-09-19', blockId: 'manana' },
    ]);
    assertFullShape(fresh.appState);
  });
});