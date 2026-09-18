<script>
  // Settings (spec: Settings / Minimal settings). Every control applies
  // immediately through the store and persists; nothing needs a save step.
  // Wake time, anchor times, block times, block order, default timer, and
  // the export / import roundtrip live here.
  import { state, actions } from '../../lib/store/app-state.svelte.js';
  import { copy } from '../../lib/i18n-copy/es.js';

  let importError = $state(false);

  function onExport() {
    const json = actions.exportJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'andamiaje-plan.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function onImportFile(event) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      importError = !actions.importJson(String(reader.result ?? ''));
    };
    reader.readAsText(file);
    event.currentTarget.value = '';
  }

  function setBlockTime(id, value) {
    actions.updateSettings({
      blockTimes: { ...state.settings.blockTimes, [id]: value },
    });
  }

  function moveBlock(index, direction) {
    const order = state.day.blocks;
    if (!order[index + direction]) return;
    if (direction < 0) actions.swapBlocks(order[index + direction].id, order[index].id);
    else actions.swapBlocks(order[index].id, order[index + direction].id);
  }
</script>

<div class="settings-view">
  <h2>{copy.settings.title}</h2>

  <section>
    <h3>{copy.settings.wakeTime}</h3>
    <input
      type="time"
      value={state.settings.wakeTime}
      onchange={(e) => actions.setWakeTime(e.currentTarget.value)}
      aria-label={copy.settings.wakeTime}
    />
  </section>

  <section>
    <h3>{copy.settings.anchorTimes}</h3>
    <ul class="rows">
      {#each state.day.anchors as anchor (anchor.id)}
        <li>
          <span>{copy.day.anchors[anchor.id]}</span>
          <input
            type="time"
            value={state.settings.anchorTimes[anchor.id]}
            onchange={(e) => actions.setAnchorTime(anchor.id, e.currentTarget.value)}
            aria-label={copy.day.anchors[anchor.id]}
          />
        </li>
      {/each}
    </ul>
  </section>

  <section>
    <h3>{copy.settings.blockTimes}</h3>
    <ul class="rows">
      {#each state.day.blocks as block (block.id)}
        <li>
          <span>{copy.day.blocks[block.id]}</span>
          <input
            type="time"
            value={state.settings.blockTimes[block.id]}
            onchange={(e) => setBlockTime(block.id, e.currentTarget.value)}
            aria-label={copy.day.blocks[block.id]}
          />
        </li>
      {/each}
    </ul>
  </section>

  <section>
    <h3>{copy.settings.blockOrder}</h3>
    <ul class="rows">
      {#each state.day.blocks as block, i (block.id)}
        <li>
          <span>{copy.day.blocks[block.id]}</span>
          <div class="order-controls">
            <button
              class="ghost small"
              type="button"
              disabled={i === 0}
              onclick={() => moveBlock(i, -1)}
              aria-label={copy.common.moveUp}
            >
              ↑
            </button>
            <button
              class="ghost small"
              type="button"
              disabled={i === state.day.blocks.length - 1}
              onclick={() => moveBlock(i, 1)}
              aria-label={copy.common.moveDown}
            >
              ↓
            </button>
          </div>
        </li>
      {/each}
    </ul>
  </section>

  <section>
    <h3>{copy.settings.defaultTimer}</h3>
    <label class="inline">
      <input
        type="number"
        min="1"
        max="120"
        value={state.settings.defaultTimerMin}
        onchange={(e) => actions.updateSettings({ defaultTimerMin: Number(e.currentTarget.value) })}
        aria-label={copy.settings.defaultTimer}
      />
      <span>{copy.focus.timerCustomMinutes}</span>
    </label>
  </section>

  <section>
    <h3>{copy.settings.export}</h3>
    <p class="hint">{copy.settings.exportHint}</p>
    <button class="ghost" type="button" onclick={onExport}>
      {copy.settings.export}
    </button>
  </section>

  <section>
    <h3>{copy.settings.import}</h3>
    <p class="hint">{copy.settings.importHint}</p>
    <label class="file-button">
      <span class="ghost">{copy.settings.import}</span>
      <input type="file" accept="application/json,.json" onchange={onImportFile} />
    </label>
    {#if importError}
      <p class="error">{copy.settings.importError}</p>
    {/if}
  </section>
</div>

<style>
  .settings-view {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1rem 1.25rem;
    max-width: 42rem;
    margin-inline: auto;
  }

  h2 {
    margin: 0;
    font-size: 1.4rem;
  }

  h3 {
    margin: 0 0 0.6rem;
    font-size: 1.02rem;
  }

  section {
    display: flex;
    flex-direction: column;
  }

  .rows {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
    padding: 0.55rem 0.7rem;
    border-radius: 0.6rem;
    background: var(--bg, #fafafa);
    font-size: 0.95rem;
  }

  .order-controls {
    display: flex;
    gap: 0.35rem;
  }

  .inline {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .inline input {
    width: 5rem;
  }

  .hint {
    margin: 0 0 0.6rem;
    font-size: 0.85rem;
    color: var(--text-soft, #6b7280);
  }

  .error {
    margin: 0.5rem 0 0;
    font-size: 0.85rem;
    color: var(--danger, #b45309);
  }

  .file-button input {
    display: none;
  }

  .small {
    padding: 0.3rem 0.6rem;
  }
</style>