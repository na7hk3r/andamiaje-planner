<script>
  // Apagado checklist (spec: Day View / Apagado checklist). Six prep items
  // embedded inside the apagado anchor; toggling one item persists and
  // touches nothing else.
  import { actions } from '../../lib/store/app-state.svelte.js';
  import { copy } from '../../lib/i18n-copy/es.js';

  let { items } = $props();

  function toggle(item) {
    actions.toggleApagadoItem(item.id);
  }
</script>

<fieldset class="checklist">
  <legend>{copy.day.apagadoChecklistTitle}</legend>
  <ul>
    {#each items as item (item.id)}
      <li>
        <label>
          <input type="checkbox" checked={item.checked} onchange={() => toggle(item)} />
          <span>{item.hint}</span>
        </label>
      </li>
    {/each}
  </ul>
</fieldset>

<style>
  .checklist {
    border: none;
    margin: 0;
    padding: 0.6rem 0 0;
    border-top: 1px dashed var(--border, #e5e7eb);
  }

  legend {
    font-size: 0.85rem;
    font-weight: 600;
    padding: 0;
  }

  ul {
    list-style: none;
    margin: 0.5rem 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }

  label {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.9rem;
  }
</style>