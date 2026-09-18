// Single reactive runes store (design D4).
// One $state AppState object is persisted through storage.js (debounced);
// every mutation flows actions -> pure logic (timer/recovery) -> state ->
// storage, and views read the store via $derived. Components never touch
// localStorage directly.
//
// Contract (design #118):
//   AppState { version: 1, settings, day: DayState, week: WeekState, view,
//              disclaimerAccepted }
//   DayState  { dateKey, anchors: [{ id, checked, time, apagadoChecklist? }],
//               blocks: [{ id, label, time, tasks }], captured: Task[] }
//   WeekState { ritualStep: 1..4, reviewAnswers, priorities (max 3), schedule }
//   Settings  { wakeTime, anchorTimes, blockTimes, blockOrder, defaultTimerMin }
//
// D3: the state shape carries no day-lost flags, streak fields, counters or
// any derived-field family — the shape assertions in the smoke tests enforce
// the ban structurally (an extra key fails the allowed-keys check).
// D6: dateKey is display-only. Nothing in this module rotates days, erases
// state, or counts anything; a stored state is restored field-for-field.

import { copy } from '../i18n-copy/es.js';
import {
  loadState,
  saveState,
  saveStateImmediate,
  exportState,
  importState,
  STATE_VERSION,
} from '../storage.js';
import { createTimer, TIMER_STATES, TIMER_PRESETS_MIN } from '../logic/timer.js';
import { setAnchorChecked, nextResumeAnchor } from '../logic/recovery.js';

export const VIEWS = Object.freeze(['day', 'focus', 'week', 'settings']);
export const RITUAL_STEPS_MAX = 4;
export const PRIORITIES_MAX = 3;

// Settings s2: the Countdown UI reflects settings.defaultTimerMin in its
// preset row. Returns the preset that matches the configured default, or the
// nearest preset when the default falls outside the fixed list — new presets
// are never invented. Ties resolve to the shorter preset (deterministic).
export function resolveDefaultPreset(minutes) {
  const target = Number(minutes);
  if (TIMER_PRESETS_MIN.includes(target)) return target;
  let best = TIMER_PRESETS_MIN[0];
  let bestDistance = Infinity;
  for (const preset of TIMER_PRESETS_MIN) {
    const distance = Math.abs(preset - target);
    if (distance < bestDistance) {
      best = preset;
      bestDistance = distance;
    }
  }
  return best;
}

const ANCHOR_IDS = ['despertar', 'primera_tarea', 'movimiento', 'apagado'];
const BLOCK_IDS = ['manana', 'mediodia', 'tarde'];

// Default schedule mirrors the recovery test fixtures (08:00/12:30/19:00/22:30).
const DEFAULT_TIMES = Object.freeze({
  wakeTime: '07:00',
  anchors: Object.freeze({
    despertar: '08:00',
    primera_tarea: '12:30',
    movimiento: '19:00',
    apagado: '22:30',
  }),
  blocks: Object.freeze({
    manana: '09:00',
    mediodia: '14:00',
    tarde: '18:00',
  }),
});

// Copy-gate rule: any user-facing string the store embeds in state comes
// from the i18n module — block labels and the apagado checklist hints below.

function uid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// Local calendar key (design D6): display-only, never used by logic.
function todayKey(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function defaultSettings() {
  return {
    wakeTime: DEFAULT_TIMES.wakeTime,
    anchorTimes: { ...DEFAULT_TIMES.anchors },
    blockTimes: { ...DEFAULT_TIMES.blocks },
    blockOrder: [...BLOCK_IDS],
    defaultTimerMin: 25,
  };
}

function defaultDay() {
  return {
    dateKey: todayKey(),
    anchors: ANCHOR_IDS.map((id) => {
      const anchor = { id, time: DEFAULT_TIMES.anchors[id], checked: false };
      if (id === 'apagado') {
        anchor.apagadoChecklist = copy.day.apagadoChecklist.map((hint, i) => ({
          id: `apagado-${i + 1}`,
          checked: false,
          hint,
        }));
      }
      return anchor;
    }),
    blocks: BLOCK_IDS.map((id) => ({
      id,
      label: copy.day.blocks[id],
      time: DEFAULT_TIMES.blocks[id],
      tasks: [],
    })),
    captured: [],
  };
}

function defaultWeek() {
  return {
    ritualStep: 1,
    reviewAnswers: ['', ''],
    priorities: [],
    schedule: [],
  };
}

function defaultState() {
  return {
    version: STATE_VERSION,
    settings: defaultSettings(),
    day: defaultDay(),
    week: defaultWeek(),
    view: 'day',
    disclaimerAccepted: false,
  };
}

// Loads persisted state: storage.loadState already rejects unsupported
// versions and corrupt payloads (clean start, no crash). Provided fields
// are restored field-for-field; any missing or null top-level key falls
// back to the clean default so the store never holds a partial shape.
function mergeWithDefaults(payload) {
  const base = defaultState();
  return {
    version: payload.version ?? base.version,
    settings: payload.settings ?? base.settings,
    day: payload.day ?? base.day,
    week: payload.week ?? base.week,
    view: payload.view ?? base.view,
    disclaimerAccepted: payload.disclaimerAccepted ?? base.disclaimerAccepted,
  };
}

function hydrate() {
  const stored = loadState();
  return stored ? mergeWithDefaults(stored) : defaultState();
}

export const appState = $state(hydrate());

// Transient focus + timer state (design D2: the timer lives in the store).
// Deliberately NOT part of the persisted AppState: a countdown is
// meaningless across reloads, and persisting it would break the export /
// import field-for-field contract. Only task completion persists.
const timer = createTimer();

export const focus = $state({
  currentTask: null, // { taskId, title, source, blockId? } resolved by startFocus
  timerState: TIMER_STATES.IDLE,
  timerDurationMs: 0,
  timerRemainingMs: 0,
  reward: null, // { taskId, title } set once when the countdown ends
});

// Locates a task wherever it lives: day blocks, unassigned captures, or
// week priorities.
function findTask(taskId) {
  for (const block of appState.day.blocks) {
    const task = block.tasks.find((t) => t.id === taskId);
    if (task) return { taskId: task.id, title: task.title, source: 'block', blockId: block.id };
  }
  const captured = appState.day.captured.find((t) => t.id === taskId);
  if (captured) return { taskId: captured.id, title: captured.title, source: 'captured', blockId: null };
  const priority = appState.week.priorities.find((t) => t.id === taskId);
  if (priority) return { taskId: priority.id, title: priority.title, source: 'priority', blockId: null };
  return null;
}

// Timer end (design D2): the focused task is marked done and a reward
// reference is set for the reward view; only the task flag persists.
function completeCurrentTask() {
  const current = focus.currentTask;
  if (!current) return;
  if (current.source === 'block') {
    const block = appState.day.blocks.find((b) => b.id === current.blockId);
    const task = block?.tasks.find((t) => t.id === current.taskId);
    if (task) task.done = true;
  } else if (current.source === 'captured') {
    const task = appState.day.captured.find((t) => t.id === current.taskId);
    if (task) task.done = true;
  } else {
    const task = appState.week.priorities.find((t) => t.id === current.taskId);
    if (task) task.done = true;
  }
  focus.reward = { taskId: current.taskId, title: current.title };
  saveState(appState);
}

// Settings edits apply to the day immediately (settings spec): anchor and
// block times sync down, and the block order re-renders the day view.
function applySettingsToDay() {
  const { anchorTimes, blockTimes, blockOrder } = appState.settings;
  appState.day.anchors = appState.day.anchors.map((anchor) => {
    const time = anchorTimes?.[anchor.id];
    return time ? { ...anchor, time } : anchor;
  });
  const byId = new Map(appState.day.blocks.map((b) => [b.id, b]));
  appState.day.blocks = blockOrder.map((id) => byId.get(id)).filter(Boolean);
  for (const id of BLOCK_IDS) {
    const block = byId.get(id);
    if (block && blockTimes?.[id]) block.time = blockTimes[id];
  }
}

function syncBlockOrderFromBlocks() {
  appState.settings.blockOrder = appState.day.blocks.map((b) => b.id);
}

// Import replaces all state (local-data spec). Provided fields are taken
// field-for-field (roundtrip guarantee); missing or null top-level keys
// fall back to clean defaults so the store never holds a partial shape.
function applyParsed(payload) {
  const merged = mergeWithDefaults(payload);
  appState.version = merged.version;
  appState.settings = merged.settings;
  appState.day = merged.day;
  appState.week = merged.week;
  appState.view = merged.view;
  appState.disclaimerAccepted = merged.disclaimerAccepted;
}

export const actions = {
  // --- view + disclaimer ---
  setView(view) {
    if (!VIEWS.includes(view)) return false;
    appState.view = view;
    saveState(appState);
    return true;
  },

  acknowledgeDisclaimer() {
    appState.disclaimerAccepted = true;
    saveState(appState);
  },

  // --- day anchors (recovery wiring) ---
  setAnchorChecked(id, checked) {
    appState.day.anchors = setAnchorChecked(appState.day.anchors, id, Boolean(checked));
    saveState(appState);
  },

  setAnchorTime(id, time) {
    if (!ANCHOR_IDS.includes(id) || !/^\d{2}:\d{2}$/.test(time)) return false;
    appState.settings.anchorTimes[id] = time;
    const anchor = appState.day.anchors.find((a) => a.id === id);
    if (anchor) anchor.time = time;
    saveState(appState);
    return true;
  },

  toggleApagadoItem(itemId) {
    const apagado = appState.day.anchors.find((a) => a.id === 'apagado');
    const item = apagado?.apagadoChecklist?.find((i) => i.id === itemId);
    if (!item) return;
    item.checked = !item.checked;
    saveState(appState);
  },

  // Resume hint (recovery wiring): next scheduled anchor not yet checked,
  // or null when nothing actionable remains. Pure call, on demand.
  nextResumeAnchor() {
    return nextResumeAnchor(appState.day.anchors, new Date());
  },

  // --- blocks ---
  addTask(blockId, title) {
    const clean = String(title ?? '').trim();
    const block = appState.day.blocks.find((b) => b.id === blockId);
    if (!clean || !block) return false;
    block.tasks.push({ id: uid(), title: clean, done: false });
    saveState(appState);
    return true;
  },

  // Marks any task done / undone wherever it lives: day blocks, unassigned
  // captures, or week priorities. Mirrors the findTask resolution used by
  // startFocus and completeCurrentTask so the UI never reimplements lookup.
  setTaskDone(taskId, done) {
    const current = findTask(taskId);
    if (!current) return false;
    const flag = Boolean(done);
    if (current.source === 'block') {
      const block = appState.day.blocks.find((b) => b.id === current.blockId);
      const task = block?.tasks.find((t) => t.id === taskId);
      if (task) task.done = flag;
    } else if (current.source === 'captured') {
      const task = appState.day.captured.find((t) => t.id === taskId);
      if (task) task.done = flag;
    } else {
      const task = appState.week.priorities.find((t) => t.id === taskId);
      if (task) task.done = flag;
    }
    saveState(appState);
    return true;
  },

  // Swap keeps tasks attached: block objects move with their tasks.
  swapBlocks(aId, bId) {
    const blocks = appState.day.blocks;
    const i = blocks.findIndex((b) => b.id === aId);
    const j = blocks.findIndex((b) => b.id === bId);
    if (i === -1 || j === -1 || i === j) return false;
    [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
    syncBlockOrderFromBlocks();
    saveState(appState);
    return true;
  },

  // --- quick capture (every screen) ---
  capture(title, blockId = null) {
    const clean = String(title ?? '').trim();
    if (!clean) return false;
    const task = { id: uid(), title: clean, done: false };
    const block = blockId ? appState.day.blocks.find((b) => b.id === blockId) : null;
    if (block) block.tasks.push(task);
    else appState.day.captured.push(task);
    saveState(appState);
    return true;
  },

  // --- week ritual ---
  setReviewAnswers(answers) {
    const list = Array.isArray(answers) ? answers : [];
    appState.week.reviewAnswers = [String(list[0] ?? ''), String(list[1] ?? '')];
    saveState(appState);
  },

  setRitualStep(step) {
    appState.week.ritualStep = Math.min(RITUAL_STEPS_MAX, Math.max(1, Number(step) || 1));
    saveState(appState);
  },

  // The ritual never advances past step 4 (spec: the 4th step closes it).
  advanceRitualStep() {
    if (appState.week.ritualStep < RITUAL_STEPS_MAX) appState.week.ritualStep += 1;
    saveState(appState);
  },

  addPriority(title) {
    const clean = String(title ?? '').trim();
    if (!clean || appState.week.priorities.length >= PRIORITIES_MAX) return false;
    appState.week.priorities.push({ id: uid(), title: clean, done: false });
    saveState(appState);
    return true;
  },

  addPriorityTask(taskId) {
    if (appState.week.priorities.length >= PRIORITIES_MAX) return false;
    if (appState.week.priorities.some((p) => p.id === taskId)) return false;
    const task = findTask(taskId);
    if (!task) return false;
    appState.week.priorities.push({
      id: task.taskId,
      title: task.title,
      done: false,
    });
    saveState(appState);
    return true;
  },

  removePriority(taskId) {
    const before = appState.week.priorities.length;
    appState.week.priorities = appState.week.priorities.filter((p) => p.id !== taskId);
    if (appState.week.priorities.length !== before) saveState(appState);
  },

  schedulePriority(priorityId, day, blockId) {
    if (!appState.week.priorities.some((p) => p.id === priorityId)) return false;
    if (!BLOCK_IDS.includes(blockId)) return false;
    appState.week.schedule.push({ priorityId, day: String(day), blockId });
    saveState(appState);
    return true;
  },

  // --- settings ---
  updateSettings(patch) {
    if (!patch || typeof patch !== 'object') return false;
    const next = { ...appState.settings, ...patch };
    const min = Number(next.defaultTimerMin);
    next.defaultTimerMin = Number.isFinite(min) ? Math.min(120, Math.max(1, min)) : 25;
    appState.settings = next;
    applySettingsToDay();
    saveState(appState);
    return true;
  },

  setBlockOrder(order) {
    if (!Array.isArray(order) || order.length !== BLOCK_IDS.length) return false;
    if (!BLOCK_IDS.every((id) => order.includes(id))) return false;
    appState.settings.blockOrder = [...order];
    applySettingsToDay();
    saveState(appState);
    return true;
  },

  setWakeTime(time) {
    if (!/^\d{2}:\d{2}$/.test(time)) return false;
    appState.settings.wakeTime = time;
    saveState(appState);
    return true;
  },

  // --- focus + timer (slice-1 Timer interface) ---
  startFocus(taskId) {
    const current = findTask(taskId);
    if (!current) return false;
    focus.currentTask = current;
    focus.reward = null;
    return true;
  },

  // "Iniciar enfoque" from a task card (Stitch Day view): sets the focus
  // candidate and moves straight into the focus view, skipping the picker.
  // FocusView already renders the session whenever focus.currentTask is set,
  // so this is the only bridge the day view needs.
  startFocusFromTask(taskId) {
    const current = findTask(taskId);
    if (!current) return false;
    focus.currentTask = current;
    focus.reward = null;
    appState.view = 'focus';
    saveState(appState);
    return true;
  },

  startTimer(durationMs) {
    const d = Number.isFinite(durationMs)
      ? Math.max(0, durationMs)
      : appState.settings.defaultTimerMin * 60_000;
    timer.start(d);
    focus.timerDurationMs = d;
    focus.timerRemainingMs = d;
    focus.timerState = TIMER_STATES.RUNNING;
    focus.reward = null;
    return d;
  },

  // Reads the pure timer (delta math, drift-immune). On completion the
  // focused task is marked done once and the reward reference is set.
  timerTick() {
    focus.timerRemainingMs = timer.remaining();
    focus.timerState = timer.state;
    if (timer.state === TIMER_STATES.DONE && focus.currentTask && !focus.reward) {
      completeCurrentTask();
    }
    return focus.timerRemainingMs;
  },

  timerReset() {
    timer.reset();
    focus.timerState = TIMER_STATES.IDLE;
    focus.timerDurationMs = 0;
    focus.timerRemainingMs = 0;
    focus.reward = null;
    focus.currentTask = null;
  },

  timerPresets() {
    return TIMER_PRESETS_MIN;
  },

  // --- export / import (local-data requirement) ---
  exportJson() {
    return exportState(appState);
  },

  importJson(json) {
    const parsed = importState(json);
    if (!parsed) return false;
    applyParsed(parsed);
    saveStateImmediate(appState);
    return true;
  },
};