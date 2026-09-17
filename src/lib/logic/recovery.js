// Recovery protocol logic (design D3). Pure module: no Svelte, no DOM, no
// state beyond the values passed in. Anchor completion is independent
// boolean state — no day-lost field, no streaks, no counters, no cascade.
// The structural ban lives in the data model (slice 2); these helpers must
// never introduce such fields themselves, and the tests enforce it.

// Converts an "HH:mm" string to minutes of day (0–1439).
export function minutesOfDay(hhmm) {
  const [hours, minutes] = hhmm.split(':').map(Number);
  return hours * 60 + minutes;
}

// Returns a new anchors array where only the target anchor changes; every
// other anchor keeps its identity and value (independence, no cascade).
export function setAnchorChecked(anchors, id, checked) {
  return anchors.map((anchor) =>
    anchor.id === id ? { ...anchor, checked } : anchor,
  );
}

// Picks the resume point: the next anchor scheduled at or after `now` that
// is not already checked. Returns the anchor object, or null when nothing
// actionable remains today — the UI shows "Retomar en la próxima ancla",
// never a "mañana" restart.
export function nextResumeAnchor(anchors, now) {
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const upcoming = anchors
    .map((anchor) => ({ anchor, atMin: minutesOfDay(anchor.time) }))
    .filter(({ anchor, atMin }) => !anchor.checked && atMin >= nowMin)
    .sort((a, b) => a.atMin - b.atMin);
  return upcoming.length === 0 ? null : upcoming[0].anchor;
}