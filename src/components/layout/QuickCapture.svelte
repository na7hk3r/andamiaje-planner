<script>
  // Quick capture (spec: Quick Capture / Capture everywhere). Exposed on
  // every screen by App.svelte; captures land in a day block when one is
  // chosen, otherwise they stay as unassigned captures in the day view.
  import { state, actions } from '../../lib/store/app-state.svelte.js';
  import { copy } from '../../lib/i18n-copy/es.js';

  let title = $state('');
  let blockId = $state('');

  function submit() {
    if (!title.trim()) return;
    actions.capture(title, blockId || null);
    title = '';
  }
</script>

<section class="quick-capture" aria-label={copy.quickCapture.label}>
  <div class="row">
    <input
      class="capture-input"
      type="text"
      bind:value={title}
      placeholder={copy.quickCapture.placeholder}
      onkeydown={(e) => e.key === 'Enter' && submit()}
    />
    <button class="primary" onclick={submit} disabled={!title.trim()}>
      {copy.common.add}
    </button>
  </div>
  <label class="assign">
    <span>{copy.quickCapture.assignToBlock}</span>
    <select bind:value={blockId}>
      <option value="">{copy.quickCapture.unassigned}</option>
      {#each state.day.blocks as block (block.id)}
        <option value={block.id}>{block.label}</option>
      {/each}
    </select>
  </label>
</section>

<style>
  .quick-capture {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding: 1rem 1.25rem;
  }

  .row {
    display: flex;
    gap: 0.6rem;
  }

  .capture-input {
    flex: 1;
    min-width: 0;
  }

  .assign {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.85rem;
    color: var(--text-soft, #6b7280);
  }

  select {
    flex: 1;
    min-width: 0;
  }
</style>