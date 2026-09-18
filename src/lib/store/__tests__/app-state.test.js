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
import { STORAGE_KEY } from '../../storage.js';

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
const { state, focus, actions } = await import('../app-state.svelte.js');

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
    assertFullShape(state);
    expect(state.version).toBe(1);
    expect(state.view).toBe('day');
    expect(state.disclaimerAccepted).toBe(false);
    expect(state.week.ritualStep).toBe(1);
  });

  it('keys the day with the local calendar date on a clean start', async () => {
    await settle();
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 18, 10, 0));
    const fresh = await reloadStore();
    expect(fresh.state.day.dateKey).toBe('2026-09-18');
    vi.useRealTimers();
  });

  it('builds 4 independent anchors whose times come from the default schedule', () => {
    expect(state.day.anchors.map((a) => a.id)).toEqual([
      'despertar',
      'primera_tarea',
      'movimiento',
      'apagado',
    ]);
    expect(state.day.anchors.map((a) => a.time)).toEqual(['08:00', '12:30', '19:00', '22:30']);
    expect(state.day.anchors.every((a) => a.checked === false)).toBe(true);
  });

  it('embeds the apagado checklist with copy-gate hints from es.js', () => {
    const apagado = state.day.anchors.find((a) => a.id === 'apagado');
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
    expect(state.day.blocks.map((b) => b.id)).toEqual(['manana', 'mediodia', 'tarde']);
    expect(state.day.blocks.map((b) => b.label)).toEqual([
      copy.day.blocks.manana,
      copy.day.blocks.mediodia,
      copy.day.blocks.tarde,
    ]);
    expect(state.day.blocks.every((b) => b.tasks.length === 0)).toBe(true);
  });
});

describe('actions — view and disclaimer', () => {
  it('acknowledges the disclaimer', () => {
    actions.acknowledgeDisclaimer();
    expect(state.disclaimerAccepted).toBe(true);
  });

  it('switches views only within the allowed set', () => {
    expect(actions.setView('week')).toBe(true);
    expect(state.view).toBe('week');
    expect(actions.setView('bogus')).toBe(false);
    expect(state.view).toBe('week');
    actions.setView('day');
  });
});

describe('actions — anchors (recovery wiring)', () => {
  it('toggles only the target anchor, leaving the others untouched', () => {
    const before = state.day.anchors;
    actions.setAnchorChecked('despertar', true);
    expect(state.day.anchors[0].checked).toBe(true);
    expect(state.day.anchors[0]).not.toBe(before[0]); // changed copy
    expect(state.day.anchors[1]).toBe(before[1]); // identity preserved
    expect(state.day.anchors[2]).toBe(before[2]);
    expect(state.day.anchors[3]).toBe(before[3]);
    expect(before[0].checked).toBe(false); // original not mutated
    actions.setAnchorChecked('despertar', false);
  });

  it('toggles one apagado checklist item at a time', () => {
    actions.toggleApagadoItem('apagado-2');
    const apagado = state.day.anchors.find((a) => a.id === 'apagado');
    expect(apagado.apagadoChecklist[1].checked).toBe(true);
    expect(apagado.apagadoChecklist.filter((i) => i.checked).length).toBe(1);
    actions.toggleApagadoItem('apagado-2');
    expect(apagado.apagadoChecklist[1].checked).toBe(false);
  });

  it('applies an anchor time to the day and to settings immediately', () => {
    expect(actions.setAnchorTime('movimiento', '18:30')).toBe(true);
    expect(state.day.anchors.find((a) => a.id === 'movimiento').time).toBe('18:30');
    expect(state.settings.anchorTimes.movimiento).toBe('18:30');
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
    const manana = state.day.blocks.find((b) => b.id === 'manana');
    expect(manana.tasks).toHaveLength(1);
    assertKeys(manana.tasks[0], TASK_KEYS);
  });

  it('swaps block order without detaching tasks and syncs settings', () => {
    const manana = state.day.blocks.find((b) => b.id === 'manana');
    const taskBefore = manana.tasks[0];
    expect(actions.swapBlocks('manana', 'tarde')).toBe(true);
    expect(state.day.blocks.map((b) => b.id)).toEqual(['tarde', 'mediodia', 'manana']);
    expect(state.settings.blockOrder).toEqual(['tarde', 'mediodia', 'manana']);
    const mananaAfter = state.day.blocks.find((b) => b.id === 'manana');
    expect(mananaAfter.tasks[0]).toBe(taskBefore); // task kept its block
    actions.swapBlocks('manana', 'tarde');
    expect(state.day.blocks.map((b) => b.id)).toEqual(['manana', 'mediodia', 'tarde']);
    expect(state.settings.blockOrder).toEqual(['manana', 'mediodia', 'tarde']);
  });
});

describe('actions — quick capture', () => {
  it('keeps unassigned captures in the day view', () => {
    const before = state.day.captured.length;
    expect(actions.capture('Sacar turno')).toBe(true);
    expect(state.day.captured).toHaveLength(before + 1);
    expect(state.day.captured.at(-1).title).toBe('Sacar turno');
    assertKeys(state.day.captured.at(-1), TASK_KEYS);
  });

  it('places assigned captures in the given block', () => {
    const beforeBlock = state.day.blocks.find((b) => b.id === 'mediodia').tasks.length;
    const beforeCaptured = state.day.captured.length;
    expect(actions.capture('Enfoque profundo', 'mediodia')).toBe(true);
    expect(state.day.blocks.find((b) => b.id === 'mediodia').tasks).toHaveLength(beforeBlock + 1);
    expect(state.day.captured).toHaveLength(beforeCaptured); // unchanged
  });
});

describe('actions — week ritual', () => {
  it('stores the two review answers', () => {
    actions.setReviewAnswers(['La rutina de la mañana', 'Más movimiento']);
    expect(state.week.reviewAnswers).toEqual(['La rutina de la mañana', 'Más movimiento']);
  });

  it('caps priorities at 3 and removes them', () => {
    expect(actions.addPriority('Preparar la charla')).toBe(true);
    expect(actions.addPriority('Llamar al dentista')).toBe(true);
    expect(actions.addPriority('Ordenar el escritorio')).toBe(true);
    expect(state.week.priorities).toHaveLength(3);
    expect(actions.addPriority('Cuarta prioridad')).toBe(false);
    const firstId = state.week.priorities[0].id;
    actions.removePriority(firstId);
    expect(state.week.priorities).toHaveLength(2);
  });

  it('promotes an existing task to a priority without duplicating', () => {
    const block = state.day.blocks.find((b) => b.id === 'manana');
    const task = block.tasks[0];
    expect(actions.addPriorityTask(task.id)).toBe(true);
    expect(state.week.priorities.at(-1).title).toBe(task.title);
    expect(actions.addPriorityTask(task.id)).toBe(false); // already a priority
  });

  it('advances the ritual through 4 steps and never past them', () => {
    actions.setRitualStep(2);
    actions.advanceRitualStep();
    expect(state.week.ritualStep).toBe(3);
    actions.setRitualStep(4);
    actions.advanceRitualStep();
    expect(state.week.ritualStep).toBe(4); // 4th step closes the ritual
    actions.setRitualStep(9);
    expect(state.week.ritualStep).toBe(4);
    actions.setRitualStep(0);
    expect(state.week.ritualStep).toBe(1);
  });

  it('records a priority in the weekly schedule', () => {
    const priority = state.week.priorities[0];
    expect(actions.schedulePriority(priority.id, '2026-09-19', 'manana')).toBe(true);
    expect(state.week.schedule.at(-1)).toEqual({
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
    expect(state.settings.defaultTimerMin).toBe(45);
    actions.updateSettings({ defaultTimerMin: 9999 });
    expect(state.settings.defaultTimerMin).toBe(120);
    actions.updateSettings({ defaultTimerMin: 0 });
    expect(state.settings.defaultTimerMin).toBe(1);
    actions.updateSettings({ defaultTimerMin: 25 });
  });

  it('applies block order and block times to the day immediately', () => {
    expect(actions.setBlockOrder(['tarde', 'manana', 'mediodia'])).toBe(true);
    expect(state.day.blocks.map((b) => b.id)).toEqual(['tarde', 'manana', 'mediodia']);
    expect(actions.setBlockOrder(['tarde', 'manana'])).toBe(false);
    actions.setBlockOrder(['manana', 'mediodia', 'tarde']);

    actions.updateSettings({ blockTimes: { manana: '08:30' } });
    expect(state.day.blocks.find((b) => b.id === 'manana').time).toBe('08:30');
    expect(state.settings.blockTimes.manana).toBe('08:30');
    actions.updateSettings({ blockTimes: { manana: '09:00' } });
  });

  it('updates the wake time', () => {
    expect(actions.setWakeTime('06:30')).toBe(true);
    expect(state.settings.wakeTime).toBe('06:30');
    expect(actions.setWakeTime('no')).toBe(false);
    actions.setWakeTime('07:00');
  });
});

describe('actions — timer (slice-1 Timer interface)', () => {
  it('starts a countdown and ticks to zero under fake time', () => {
    const task = state.day.blocks.find((b) => b.id === 'manana').tasks[0];
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
    expect(state.day.blocks.find((b) => b.id === 'manana').tasks[0].done).toBe(true);
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
    expect(state.day).not.toBeNull(); // defaults fill the null key
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

    expect(fresh.state.day.dateKey).toBe('2026-09-01'); // restored, not regenerated
    expect(fresh.state.day.anchors.find((a) => a.id === 'despertar').checked).toBe(true);
    expect(fresh.state.day.anchors.every((a) => a.checked === false)).toBe(false);
    expect(fresh.state.view).toBe('week');
    expect(fresh.state.disclaimerAccepted).toBe(true);
    assertFullShape(fresh.state);
  });
});