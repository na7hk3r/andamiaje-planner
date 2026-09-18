// Transient UI signal for the quick capture modal (design: QuickCaptureModal).
// Deliberately NOT part of the persisted AppState — an open modal is
// meaningless across reloads. The modal and its trigger share this one
// source of truth. Mutations go through openCapture/closeCapture; consumers
// read `uiState.captureOpen` reactively (same pattern as appState).
export const uiState = $state({ captureOpen: false });

export function openCapture() {
  uiState.captureOpen = true;
}

export function closeCapture() {
  uiState.captureOpen = false;
}