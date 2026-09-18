// DEV-ONLY helper: validates the mock seed (`--check`) or emits an
// importable JSON snapshot for screenshot capture. Usage:
//   node scripts/seed-mock.mjs --check   # validate shape, exit non-zero on failure
//   node scripts/seed-mock.mjs            # validate + write docs/mock-state.json
//   npm run seed:mock [-- --check]
// The JSON file can be restored via Settings ("Restaurar desde archivo JSON");
// the same payload is loaded in the browser with `npm run dev` + `?mock=1`.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildMockState } from '../src/lib/dev-seed.js';
import { STATE_VERSION } from '../src/lib/storage.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = new Set(process.argv.slice(2));

function fail(message) {
  console.error(`seed-mock: ${message}`);
  process.exit(1);
}

function check(state) {
  const problems = [];
  const eq = (cond, message) => {
    if (!cond) problems.push(message);
  };
  eq(state.version === STATE_VERSION, `version must be ${STATE_VERSION}`);
  eq(state.disclaimerAccepted === true, 'disclaimerAccepted must be true (skip gate)');
  eq(state.day?.anchors?.length === 4, 'day.anchors must hold 4 anchors');
  eq(state.day?.blocks?.length === 3, 'day.blocks must hold 3 blocks');
  eq(state.day.blocks.every((b) => b.tasks.length > 0), 'every block needs tasks');
  eq(state.day.blocks.flatMap((b) => b.tasks).length >= 5, 'need 5+ block tasks');
  eq(state.day.captured.length >= 1, 'need at least 1 captured note');
  eq(state.week.priorities.length === 3, 'week.priorities must hold 3 priorities');
  eq(state.week.schedule.length === 3, 'week.schedule must hold 3 entries');
  eq(
    state.week.schedule.every((s) => state.week.priorities.some((p) => p.id === s.priorityId)),
    'schedule entries must reference existing priorities',
  );
  eq(state.settings.defaultTimerMin === 30, 'defaultTimerMin must be 30');
  return problems;
}

const state = buildMockState();
const problems = check(state);
if (problems.length > 0) {
  for (const p of problems) console.error(`seed-mock: invalid: ${p}`);
  process.exit(1);
}

if (args.has('--check')) {
  console.log(
    `seed-mock: OK (version ${state.version}, ` +
      `${state.day.blocks.flatMap((b) => b.tasks).length} tasks, ` +
      `${state.week.priorities.length} priorities)`,
  );
  process.exit(0);
}

mkdirSync(join(root, 'docs'), { recursive: true });
const out = join(root, 'docs', 'mock-state.json');
writeFileSync(out, `${JSON.stringify(state, null, 2)}\n`);
console.log(`seed-mock: wrote ${out}`);
