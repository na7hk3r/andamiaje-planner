// Versioned, debounced localStorage layer (design D4).
// Components never touch localStorage directly; the store (slice 2) sends
// state changes here. The stored envelope is the AppState object itself,
// which carries `version: 1` per the design interfaces contract.
// Unsupported versions or corrupt payloads resolve to a clean start
// (null) instead of crashing the app.

export const STORAGE_KEY = 'andamiaje-planner:state';
export const STATE_VERSION = 1;
const SAVE_DEBOUNCE_MS = 300;

let pendingTimer = null;

function storageAvailable() {
  try {
    return typeof localStorage !== 'undefined' && localStorage !== null;
  } catch {
    // localStorage blocked (privacy settings, sandboxed contexts)
    return false;
  }
}

// Returns the parsed AppState, or null for a clean start when there is
// no stored state, an unsupported version, or a corrupt payload.
export function loadState() {
  if (!storageAvailable()) return null;
  let raw = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
  if (!raw || raw.trim() === '') return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || parsed.version !== STATE_VERSION) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function write(state) {
  try {
    const payload = { version: STATE_VERSION, ...state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Quota exceeded or storage unavailable: keep the app usable in memory.
  }
}

// Debounced write: the store calls saveState on every change (D4).
export function saveState(state) {
  if (!storageAvailable()) return;
  clearTimeout(pendingTimer);
  pendingTimer = setTimeout(() => write(state), SAVE_DEBOUNCE_MS);
}

// Immediate write used by import replacement and explicit flush flows.
export function saveStateImmediate(state) {
  if (!storageAvailable()) return;
  clearTimeout(pendingTimer);
  write(state);
}

// Serializes the full AppState for user export (settings, slice 4).
export function exportState(state) {
  return JSON.stringify(state, null, 2);
}

// Parses and validates an exported payload. Returns the AppState, or null
// when the payload is invalid, so import can report failure without
// crashing. Field-for-field roundtrip: no transformation is applied.
export function importState(json) {
  try {
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object' || parsed.version !== STATE_VERSION) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}