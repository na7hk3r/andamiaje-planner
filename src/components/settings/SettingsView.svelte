<script>
  // Settings (Stitch "Ajustes"): a calm read-only system date card, the
  // four anchor times, the three block time ranges (start editable, end
  // display copy), the default focus duration as a 20/30/45 radio group,
  // and the local-data card with backup / restore and a guarded
  // destructive wipe. Every control applies immediately through the store
  // and persists; nothing needs a save step. All copy comes from the i18n
  // module — no literal UI strings here.
  import { appState, actions, resolveDefaultPreset } from '../../lib/store/app-state.svelte.js';
  import { copy } from '../../lib/i18n-copy/es.js';

  let importError = $state(false);
  let clearConfirm = $state(false);
  let cancelButton = $state(null);
  let fileInput = $state(null);

  // Display-only local date, e.g. "Jueves, 24 de octubre de 2026".
  function formatSystemDate() {
    const date = new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
    return date.charAt(0).toUpperCase() + date.slice(1);
  }

  const todayLine = $derived(
    copy.settings.systemDateToday.replace('{date}', formatSystemDate()),
  );

  // The radio group always surfaces one active preset: exact match when
  // the stored default is in the set, otherwise the nearest preset, so a
  // legacy value can never leave the group without a selection.
  const activePreset = $derived(resolveDefaultPreset(appState.settings.defaultTimerMin));

  const anchorIcons = {
    despertar: 'wb_sunny',
    primera_tarea: 'desktop_windows',
    movimiento: 'restaurant',
    apagado: 'bedtime',
  };

  function blockKicker(i) {
    return copy.settings.blockKicker.replace('{n}', String(i + 1).padStart(2, '0'));
  }

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

  function onRestoreClick() {
    fileInput?.click();
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

  function onClearKeydown(event) {
    if (event.key === 'Escape') clearConfirm = false;
  }

  // Final destructive step: full local wipe through the store action, then
  // close the guarded panel so the view reflects the clean state.
  function onClear() {
    actions.clearLocalData();
    clearConfirm = false;
  }

  // Move focus to the first safe action when the confirmation panel opens,
  // so keyboard users land inside the guarded flow instead of back on the
  // trigger that just got replaced.
  $effect(() => {
    if (clearConfirm) cancelButton?.focus();
  });
</script>

<div class="settings-view" onkeydown={onClearKeydown}>
  <header class="page-header">
    <p class="badge">
      <span class="material-symbols-outlined" aria-hidden="true">tune</span>
      {copy.settings.pageBadge}
    </p>
    <h2>{copy.settings.pageTitle}</h2>
    <p class="page-subtitle">{copy.settings.pageSubtitle}</p>
  </header>

  <!-- 1. Fecha del sistema (read-only calm card) -->
  <section class="card" aria-labelledby="system-date-title">
    <h3 id="system-date-title" class="card-title">
      <span class="material-symbols-outlined" aria-hidden="true">calendar_today</span>
      {copy.settings.systemDate}
    </h3>
    <div class="date-row">
      <p class="today">
        <span>{todayLine}</span>
        <span class="zone">· {copy.settings.localZone}</span>
      </p>
      <span class="sync-chip">{copy.settings.synced}</span>
    </div>
  </section>

  <!-- 2. Horarios de Anclas del Día -->
  <section class="card" aria-labelledby="anchors-title">
    <header class="section-head">
      <h3 id="anchors-title">{copy.settings.anchorsTitle}</h3>
      <p class="section-subtitle">{copy.settings.anchorsSubtitle}</p>
    </header>
    <ul class="rows">
      {#each appState.day.anchors as anchor (anchor.id)}
        {@const icon = anchorIcons[anchor.id] ?? 'schedule'}
        <li>
          <span class="anchor-icon" aria-hidden="true">
            <span class="material-symbols-outlined">{icon}</span>
          </span>
          <span class="anchor-text">
            <label class="anchor-name" for={`anchor-${anchor.id}`}>{copy.day.anchors[anchor.id]}</label>
            <span class="anchor-hint">{copy.settings.anchorHints[anchor.id]}</span>
          </span>
          <input
            id={`anchor-${anchor.id}`}
            class="time-input"
            type="time"
            value={anchor.time}
            onchange={(e) => actions.setAnchorTime(anchor.id, e.currentTarget.value)}
            aria-label={`${copy.day.anchors[anchor.id]} · ${copy.day.anchorTimeLabel}`}
          />
        </li>
      {/each}
    </ul>
    <p class="note">
      <span class="material-symbols-outlined" aria-hidden="true">info</span>
      <span>{copy.settings.anchorsNote}</span>
    </p>
  </section>

  <!-- 3. Bloques de Tiempo -->
  <section class="card" aria-labelledby="blocks-title">
    <header class="section-head">
      <h3 id="blocks-title">{copy.settings.blocksTitle}</h3>
      <p class="section-subtitle">{copy.settings.blocksSubtitle}</p>
    </header>
    <div class="block-list">
      {#each appState.day.blocks as block, i (block.id)}
        <div class="block-row">
          <div class="block-text">
            <span class="block-kicker">{blockKicker(i)}</span>
            <p class="block-name">{block.label}</p>
          </div>
          <div class="block-range">
            <input
              class="time-input"
              type="time"
              value={block.time}
              onchange={(e) =>
                actions.updateSettings({
                  blockTimes: {
                    ...appState.settings.blockTimes,
                    [block.id]: e.currentTarget.value,
                  },
                })}
              aria-label={copy.settings.blockStartLabel.replace('{label}', block.label)}
            />
            <span class="range-sep" aria-hidden="true">{copy.settings.blockRangeTo}</span>
            <span class="time-input end" aria-hidden="true">{copy.day.blockEnds[block.id] ?? ''}</span>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- 4. Duración de Enfoque Predeterminada -->
  <section class="card" aria-labelledby="focus-duration-title">
    <header class="section-head">
      <h3 id="focus-duration-title">{copy.settings.focusDurationTitle}</h3>
      <p class="section-subtitle">{copy.settings.focusDurationSubtitle}</p>
    </header>
    <div class="preset-grid" role="radiogroup" aria-label={copy.settings.focusDurationLabel}>
      {#each [20, 30, 45] as minutes (minutes)}
        {@const selected = activePreset === minutes}
        <button
          type="button"
          role="radio"
          aria-checked={selected}
          class="preset"
          class:selected
          onclick={() => actions.updateSettings({ defaultTimerMin: minutes })}
        >
          {#if selected}
            <span class="dot" aria-hidden="true"></span>
          {/if}
          <span class="preset-min">{copy.focus.timerPresetShort[minutes]}</span>
          {#if minutes === 30}
            <span class="chip">{copy.focus.recommended}</span>
          {/if}
        </button>
      {/each}
    </div>
    <p class="section-hint">{copy.settings.focusDurationHint}</p>
  </section>

  <!-- 5. Tus Datos y Privacidad Local -->
  <section class="card" aria-labelledby="data-title">
    <div class="data-head">
      <div class="lock-icon" aria-hidden="true">
        <span class="material-symbols-outlined">lock</span>
      </div>
      <div class="data-text">
        <h3 id="data-title">{copy.settings.dataTitle}</h3>
        <p class="data-body">{copy.settings.dataBody}</p>
      </div>
    </div>

    <div class="data-rows">
      <!-- Backup JSON -->
      <div class="backup-row">
        <div class="data-label">
          <span class="material-symbols-outlined" aria-hidden="true">download</span>
          <span>{copy.settings.backupHint}</span>
        </div>
        <button class="row-action" type="button" onclick={onExport}>
          {copy.settings.exportAction}
        </button>
      </div>

      <!-- Restore JSON -->
      <div class="import-block">
        <div class="import-row">
          <div class="data-label">
            <span class="material-symbols-outlined" aria-hidden="true">upload_file</span>
            <span>{copy.settings.importLabel}</span>
          </div>
          <button class="row-action" type="button" onclick={onRestoreClick}>
            {copy.settings.restoreAction}
          </button>
        </div>
        <input
          class="hidden-file"
          type="file"
          bind:this={fileInput}
          accept="application/json,.json"
          onchange={onImportFile}
        />
        {#if importError}
          <p class="error">{copy.settings.importError}</p>
        {:else}
          <p class="row-hint">{copy.settings.importReplaceHint}</p>
        {/if}
      </div>

      <!-- Gentle destructive wipe: reveal a guarded confirm, never fire directly -->
      <div class="clear-row">
        {#if !clearConfirm}
          <button
            class="clear-button"
            type="button"
            onclick={() => (clearConfirm = true)}
            aria-label={copy.settings.clearAria}
          >
            <span class="material-symbols-outlined" aria-hidden="true">delete_sweep</span>
            {copy.settings.clearLabel}
          </button>
        {:else}
          <div class="clear-confirm" role="alert">
            <p class="confirm-title">{copy.settings.clearConfirmTitle}</p>
            <p class="confirm-body">{copy.settings.clearConfirmBody}</p>
            <div class="confirm-actions">
              <button class="ghost" type="button" bind:this={cancelButton} onclick={() => (clearConfirm = false)}>
                {copy.common.cancel}
              </button>
              <button class="danger-solid" type="button" onclick={onClear}>
                {copy.settings.clearConfirmAction}
              </button>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </section>
</div>

<style>
  .settings-view {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg, 1.5rem);
    width: 100%;
    max-width: 42.5rem;
    margin-inline: auto;
    padding: var(--space-lg, 1.5rem) var(--gutter-mobile, 1rem)
      var(--space-xl, 2.5rem);
  }

  @media (min-width: 48rem) {
    .settings-view {
      padding-inline: var(--gutter, 1.5rem);
    }
  }

  .page-header {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    align-self: flex-start;
    margin: 0 0 0.375rem;
    padding: 0.3rem 0.6rem;
    border-radius: var(--radius-button, 9999px);
    background: var(--accent-soft, #eff4fa);
    border: 1px solid var(--border, #dbe3eb);
    color: var(--accent, #4f6b8a);
    font-size: var(--font-size-label-sm, 12px);
    line-height: var(--line-height-label-sm, 16px);
    letter-spacing: var(--letter-spacing-label-sm, 0.02em);
    font-weight: var(--font-weight-medium, 500);
  }

  .badge .material-symbols-outlined {
    font-size: 16px;
  }

  h2 {
    margin: 0;
    font-family: var(--font-display, inherit);
    font-size: var(--font-size-headline-lg-mobile, 26px);
    line-height: var(--line-height-headline-lg-mobile, 34px);
    letter-spacing: var(--letter-spacing-headline-lg-mobile, -0.01em);
    font-weight: var(--font-weight-semibold, 600);
    color: var(--text, #1f2937);
  }

  @media (min-width: 48rem) {
    h2 {
      font-size: var(--font-size-headline-lg, 32px);
      line-height: var(--line-height-headline-lg, 40px);
      letter-spacing: var(--letter-spacing-headline-lg, -0.015em);
    }
  }

  .page-subtitle {
    margin: 0.25rem 0 0;
    max-width: 34rem;
    font-size: var(--font-size-body-md, 16px);
    line-height: var(--line-height-body-md, 26px);
    color: var(--text-secondary, #4b5563);
  }

  .card {
    padding: var(--space-md, 1rem);
    border-radius: var(--radius-card, 16px);
    background: var(--card-bg, #ffffff);
    border: 1px solid var(--border, #dbe3eb);
    box-shadow: var(--shadow-soft, 0 1px 4px rgba(15, 23, 42, 0.08));
  }

  @media (min-width: 40rem) {
    .card {
      padding: var(--space-lg, 1.5rem);
    }
  }

  h3 {
    margin: 0;
    font-family: var(--font-display, inherit);
    font-size: var(--font-size-headline-sm, 18px);
    line-height: var(--line-height-headline-sm, 24px);
    font-weight: var(--font-weight-medium, 500);
    color: var(--text, #1f2937);
  }

  .card-title {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    margin-bottom: var(--space-sm, 0.5rem);
    font-size: var(--font-size-label-md, 14px);
    line-height: var(--line-height-label-md, 20px);
    letter-spacing: var(--letter-spacing-label-sm, 0.02em);
    color: var(--text-secondary, #4b5563);
    font-weight: var(--font-weight-medium, 500);
  }

  .card-title .material-symbols-outlined {
    font-size: 18px;
    color: var(--accent, #4f6b8a);
  }

  .section-head {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    margin-bottom: var(--space-md, 1rem);
  }

  .section-subtitle {
    margin: 0;
    font-size: var(--font-size-body-sm, 14px);
    line-height: var(--line-height-body-sm, 20px);
    color: var(--text-secondary, #4b5563);
  }

  .section-hint {
    margin: var(--space-md, 1rem) 0 0;
    font-size: var(--font-size-body-sm, 14px);
    line-height: var(--line-height-body-sm, 20px);
    color: var(--text-secondary, #4b5563);
  }

  /* --- system date card --- */

  .date-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md, 1rem);
    flex-wrap: wrap;
  }

  .today {
    margin: 0;
    font-size: var(--font-size-body-md, 16px);
    line-height: var(--line-height-body-md, 26px);
    font-weight: var(--font-weight-medium, 500);
    color: var(--text, #1f2937);
  }

  .zone {
    font-weight: normal;
    color: var(--text-soft, #6b7280);
  }

  .sync-chip {
    flex: 0 0 auto;
    padding: 0.2rem 0.6rem;
    border-radius: var(--radius-button, 9999px);
    background: var(--accent-soft, #eff4fa);
    color: var(--accent, #4f6b8a);
    font-size: var(--font-size-label-sm, 12px);
    line-height: var(--line-height-label-sm, 16px);
    letter-spacing: var(--letter-spacing-label-sm, 0.02em);
    font-weight: var(--font-weight-medium, 500);
  }

  /* --- anchors --- */

  .rows {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }

  .rows li {
    display: flex;
    align-items: center;
    gap: var(--space-md, 1rem);
    padding: 0.85rem 0;
    border-bottom: 1px solid var(--surface-container, #f0f4f8);
  }

  .rows li:last-child {
    border-bottom: none;
    padding-bottom: 0.375rem;
  }

  .anchor-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 40px;
    height: 40px;
    border-radius: 9999px;
    background: var(--surface-container, #f0f4f8);
    color: var(--accent, #4f6b8a);
  }

  .anchor-icon .material-symbols-outlined {
    font-size: 20px;
  }

  .anchor-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
  }

  .anchor-name {
    font-size: var(--font-size-body-md, 16px);
    line-height: var(--line-height-body-md, 26px);
    font-weight: var(--font-weight-medium, 500);
    color: var(--text, #1f2937);
    cursor: pointer;
  }

  .anchor-hint {
    font-size: var(--font-size-label-sm, 12px);
    line-height: var(--line-height-label-sm, 16px);
    letter-spacing: var(--letter-spacing-label-sm, 0.02em);
    color: var(--text-secondary, #4b5563);
  }

  .time-input {
    flex: 0 0 auto;
    width: 6.75rem;
    min-height: 44px;
    text-align: center;
  }

  .time-input.end {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--bg, #fafafa);
    color: var(--text-soft, #6b7280);
  }

  .note {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    margin: var(--space-md, 1rem) 0 0;
    padding-top: var(--space-sm, 0.5rem);
    border-top: 1px solid var(--surface-container, #f0f4f8);
    font-size: var(--font-size-body-sm, 14px);
    line-height: var(--line-height-body-sm, 20px);
    color: var(--text-secondary, #4b5563);
  }

  .note .material-symbols-outlined {
    flex: 0 0 auto;
    font-size: 18px;
    margin-top: 0.1rem;
    color: var(--accent, #4f6b8a);
  }

  /* --- blocks --- */

  .block-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-md, 1rem);
  }

  .block-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md, 1rem);
    flex-wrap: wrap;
    padding: var(--space-md, 1rem);
    border-radius: var(--radius-field, 12px);
    background: var(--bg, #fafafa);
    border: 1px solid var(--border, #dbe3eb);
  }

  .block-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .block-kicker {
    font-size: var(--font-size-label-sm, 12px);
    line-height: var(--line-height-label-sm, 16px);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-weight: var(--font-weight-semibold, 600);
    color: var(--accent, #4f6b8a);
  }

  .block-name {
    margin: 0;
    font-size: var(--font-size-body-md, 16px);
    line-height: var(--line-height-body-md, 26px);
    font-weight: var(--font-weight-medium, 500);
    color: var(--text, #1f2937);
  }

  .block-range {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .range-sep {
    color: var(--text-soft, #6b7280);
    font-size: var(--font-size-label-sm, 12px);
    line-height: var(--line-height-label-sm, 16px);
  }

  /* --- focus duration presets --- */

  .preset-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-sm, 0.5rem);
  }

  .preset {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    min-height: 48px;
    padding: 0.5rem 0.5rem;
    border-radius: var(--radius-field, 12px);
    border: 1px solid var(--border, #dbe3eb);
    background: var(--card-bg, #ffffff);
    color: var(--text, #1f2937);
    font-size: var(--font-size-body-md, 16px);
    line-height: var(--line-height-body-md, 26px);
    font-weight: var(--font-weight-medium, 500);
  }

  .preset:hover {
    background: var(--surface-container, #f0f4f8);
  }

  .preset.selected {
    border: 2px solid var(--accent, #4f6b8a);
    background: var(--accent-soft, #eff4fa);
    color: var(--accent, #4f6b8a);
    box-shadow: var(--shadow-soft, 0 1px 4px rgba(15, 23, 42, 0.08));
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 9999px;
    background: currentColor;
    flex: 0 0 auto;
  }

  .preset-min {
    white-space: nowrap;
  }

  .chip {
    flex: 0 0 auto;
    padding: 0.1rem 0.45rem;
    border-radius: var(--radius-button, 9999px);
    background: rgba(79, 107, 138, 0.12);
    font-size: var(--font-size-label-sm, 12px);
    line-height: var(--line-height-label-sm, 16px);
    font-weight: var(--font-weight-medium, 500);
    white-space: nowrap;
  }

  /* --- local data card --- */

  .data-head {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md, 1rem);
    margin-bottom: var(--space-md, 1rem);
  }

  .lock-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 44px;
    height: 44px;
    border-radius: var(--radius-field, 12px);
    background: var(--surface-container, #f0f4f8);
    color: var(--accent, #4f6b8a);
  }

  .lock-icon .material-symbols-outlined {
    font-size: 24px;
  }

  .data-text {
    min-width: 0;
  }

  .data-body {
    margin: 0.25rem 0 0;
    font-size: var(--font-size-body-md, 16px);
    line-height: var(--line-height-body-md, 26px);
    color: var(--text-secondary, #4b5563);
  }

  .data-rows {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm, 0.5rem);
  }

  .backup-row,
  .import-block {
    padding: 0.75rem;
    border-radius: var(--radius-field, 12px);
    background: var(--bg, #fafafa);
    border: 1px solid var(--border, #dbe3eb);
  }

  .backup-row,
  .import-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md, 1rem);
    flex-wrap: wrap;
  }

  .data-label {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    font-size: var(--font-size-body-sm, 14px);
    line-height: var(--line-height-body-sm, 20px);
    font-weight: var(--font-weight-medium, 500);
    color: var(--text, #1f2937);
  }

  .data-label .material-symbols-outlined {
    font-size: 20px;
    color: var(--accent, #4f6b8a);
  }

  .row-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding: 0.55rem 0.85rem;
    border-radius: var(--radius-field, 12px);
    border: 1px solid var(--border, #dbe3eb);
    background: var(--card-bg, #ffffff);
    color: var(--accent, #4f6b8a);
    font-size: var(--font-size-label-md, 14px);
    line-height: var(--line-height-label-md, 20px);
    font-weight: var(--font-weight-medium, 500);
  }

  .row-action:hover {
    background: var(--surface-container, #f0f4f8);
  }

  .import-block {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .hidden-file {
    display: none;
  }

  .row-hint {
    margin: 0;
    padding-left: 1.75rem;
    font-size: var(--font-size-label-sm, 12px);
    line-height: var(--line-height-label-sm, 16px);
    letter-spacing: var(--letter-spacing-label-sm, 0.02em);
    color: var(--text-secondary, #4b5563);
  }

  .error {
    margin: 0;
    padding-left: 1.75rem;
    font-size: var(--font-size-label-sm, 12px);
    line-height: var(--line-height-label-sm, 16px);
    color: var(--danger, #92400e);
  }

  .clear-row {
    padding-top: var(--space-sm, 0.5rem);
    display: flex;
    justify-content: flex-end;
  }

  .clear-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    min-height: 44px;
    padding: 0.55rem 0.85rem;
    border-radius: var(--radius-field, 12px);
    border: 1px solid rgba(146, 64, 14, 0.3);
    background: transparent;
    color: var(--danger, #92400e);
    font-size: var(--font-size-label-md, 14px);
    line-height: var(--line-height-label-md, 20px);
    font-weight: var(--font-weight-medium, 500);
  }

  .clear-button:hover {
    background: rgba(146, 64, 14, 0.08);
  }

  .clear-button .material-symbols-outlined {
    font-size: 18px;
  }

  .clear-confirm {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm, 0.5rem);
    width: 100%;
    padding: var(--space-md, 1rem);
    border-radius: var(--radius-field, 12px);
    border: 1px solid rgba(146, 64, 14, 0.35);
    background: rgba(146, 64, 14, 0.06);
  }

  .confirm-title {
    margin: 0;
    font-size: var(--font-size-body-md, 16px);
    line-height: var(--line-height-body-md, 26px);
    font-weight: var(--font-weight-semibold, 600);
    color: var(--danger, #92400e);
  }

  .confirm-body {
    margin: 0;
    font-size: var(--font-size-body-sm, 14px);
    line-height: var(--line-height-body-sm, 20px);
    color: var(--text-secondary, #4b5563);
  }

  .confirm-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-sm, 0.5rem);
    flex-wrap: wrap;
  }

  .danger-solid {
    min-height: 44px;
    padding: 0.55rem 0.85rem;
    border-radius: var(--radius-field, 12px);
    border: 1px solid var(--danger, #92400e);
    background: var(--danger, #92400e);
    color: #ffffff;
    font-size: var(--font-size-label-md, 14px);
    line-height: var(--line-height-label-md, 20px);
    font-weight: var(--font-weight-medium, 500);
  }

  .danger-solid:hover {
    background: #7c360c;
    border-color: #7c360c;
  }
</style>