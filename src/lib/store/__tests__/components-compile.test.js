// Compile guard (anti-regression): makes the store_rune_conflict class of
// bug impossible to re-introduce.
//
// Background: the runes store exports `appState` (a $state object). A
// component that also declares a local binding named `state` while using
// runes makes the compiler treat every `$state(...)` as a LEGACY store
// reference: it emits the store_rune_conflict warning and compiles to
// validate_store(state, 'state') + store_get(...). At runtime that crashes
// with `store_invalid_shape` because a runes object has no .subscribe().
// Production builds and node-env unit tests cannot catch this — the warning
// is non-fatal and the tests never render components. Compiling the real
// components is therefore the acceptance test for the rename.
//
// Plain Node + vitest node env: no jsdom, no extra dependencies.

import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile } from 'svelte/compiler';

const TESTS_DIR = fileURLToPath(new URL('.', import.meta.url)); // src/lib/store/__tests__/
const SRC_ROOT = join(TESTS_DIR, '..', '..', '..'); // src/

// Recursive glob for .svelte files using node:fs only (no extra deps).
// `.svelte.js` modules (e.g. app-state.svelte.js) end in `.js` and are
// intentionally skipped — they are module code, not components.
function collectSvelteFiles(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) collectSvelteFiles(full, out);
    else if (entry.name.endsWith('.svelte')) out.push(full);
  }
  return out;
}

describe('components compile as runes (store_rune_conflict guard)', () => {
  it('compiles every .svelte file with no store_rune_conflict warning and no validate_store', () => {
    const files = collectSvelteFiles(SRC_ROOT);
    expect(files.length, 'guard found no .svelte files under src/').toBeGreaterThan(0);

    for (const file of files) {
      const label = relative(SRC_ROOT, file);
      const source = readFileSync(file, 'utf8');
      const { js, warnings } = compile(source, { generate: 'client', filename: label });

      const conflicts = warnings.filter((w) => w.code === 'store_rune_conflict');
      expect(
        conflicts,
        `${label}: store_rune_conflict warning(s) — a local binding named "state" next to $state runes forces legacy store auto-subscription: ${JSON.stringify(
          conflicts.map((w) => w.message),
        )}`,
      ).toEqual([]);
      expect(
        js.code.includes('validate_store'),
        `${label}: compiled output contains validate_store — legacy store auto-subscription is active; rename the local \`state\` binding (store export: app-state.svelte.js -> appState)`,
      ).toBe(false);
    }
  });
});