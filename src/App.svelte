<script>
  // App shell (real implementation, replaces the slice-2 placeholder).
  // Spec: Disclaimer gate (first run blocks every screen until explicit
  // acknowledgment, persisted), quick capture on every screen, view switch
  // through store.view with a hash fragment for the back button (D7), and
  // the persistent footer disclaimer. Nav labels and all copy come from
  // the i18n module — no literal UI strings here.
  import { onMount } from 'svelte';
  import { state, actions, VIEWS } from './lib/store/app-state.svelte.js';
  import { copy } from './lib/i18n-copy/es.js';
  import Footer from './components/layout/Footer.svelte';
  import QuickCapture from './components/layout/QuickCapture.svelte';
  import DayView from './components/day/DayView.svelte';
  import FocusView from './components/focus/FocusView.svelte';
  import WeekView from './components/week/WeekView.svelte';
  import SettingsView from './components/settings/SettingsView.svelte';

  function parseHash() {
    const value =
      typeof location !== 'undefined' ? location.hash.replace(/^#\/?/, '') : '';
    return VIEWS.includes(value) ? value : null;
  }

  function applyHash() {
    const view = parseHash();
    if (view && view !== state.view) actions.setView(view);
  }

  onMount(() => {
    const view = parseHash();
    if (view && view !== state.view) actions.setView(view);
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  });

  function navigate(view) {
    actions.setView(view);
    const target = `#/${view}`;
    if (location.hash !== target) location.hash = target;
  }
</script>

{#if !state.disclaimerAccepted}
  <main class="gate">
    <h1>{copy.app.title}</h1>
    <p class="tagline">{copy.app.tagline}</p>
    <section class="disclaimer-card">
      <h2>{copy.disclaimer.title}</h2>
      <p>{copy.disclaimer.body}</p>
      <button class="primary" type="button" onclick={actions.acknowledgeDisclaimer}>
        {copy.disclaimer.acknowledge}
      </button>
    </section>
  </main>
{:else}
  <main class="shell">
    <QuickCapture />
    <div class="view">
      {#if state.view === 'day'}
        <DayView />
      {:else if state.view === 'focus'}
        <FocusView />
      {:else if state.view === 'week'}
        <WeekView />
      {:else}
        <SettingsView />
      {/if}
    </div>
    <nav class="nav" aria-label={copy.nav.sectionLabel}>
      {#each VIEWS as view (view)}
        <button
          class="nav-item"
          class:active={state.view === view}
          type="button"
          onclick={() => navigate(view)}
        >
          {copy.nav[view]}
        </button>
      {/each}
    </nav>
    <Footer />
  </main>
{/if}

<style>
  :global(:root) {
    --bg: #fafafa;
    --card-bg: #ffffff;
    --text: #1f2937;
    --text-soft: #6b7280;
    --border: #e5e7eb;
    --accent: #4f6b8a;
    --accent-soft: #eef2f7;
    --danger: #b45309;
    --shadow-soft: 0 1px 4px rgba(15, 23, 42, 0.08);
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    color: var(--text);
    background: var(--bg);
  }

  :global(*) {
    box-sizing: border-box;
  }

  :global(input),
  :global(select),
  :global(textarea) {
    padding: 0.55rem 0.7rem;
    border-radius: 0.55rem;
    border: 1px solid var(--border);
    background: var(--card-bg);
    color: var(--text);
    font-size: 0.95rem;
  }

  :global(button) {
    padding: 0.55rem 0.85rem;
    border-radius: 0.55rem;
    border: 1px solid var(--border);
    background: var(--card-bg);
    color: var(--text);
    font-size: 0.95rem;
    cursor: pointer;
  }

  :global(button:disabled) {
    opacity: 0.5;
    cursor: default;
  }

  :global(.primary) {
    background: var(--accent);
    border-color: var(--accent);
    color: #ffffff;
  }

  :global(.ghost) {
    background: transparent;
  }

  .gate {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 3rem 1.25rem;
    max-width: 30rem;
    margin-inline: auto;
    text-align: center;
  }

  h1 {
    margin: 0;
    font-size: 1.7rem;
    color: var(--accent);
  }

  .tagline {
    margin: 0;
    color: var(--text-soft);
  }

  .disclaimer-card {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    padding: 1.4rem 1.3rem;
    border-radius: 1rem;
    background: var(--card-bg);
    box-shadow: var(--shadow-soft);
    border: 1px solid var(--border);
    text-align: left;
  }

  .disclaimer-card h2 {
    margin: 0;
    font-size: 1.2rem;
  }

  .disclaimer-card p {
    margin: 0;
    line-height: 1.55;
    font-size: 0.95rem;
  }

  .shell {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .view {
    flex: 1;
    padding-bottom: 1.5rem;
  }

  .nav {
    display: flex;
    justify-content: space-around;
    gap: 0.4rem;
    padding: 0.6rem 0.75rem;
    border-top: 1px solid var(--border);
    background: var(--card-bg);
    position: sticky;
    bottom: 0;
  }

  .nav-item {
    flex: 1;
    border: none;
    background: transparent;
    color: var(--text-soft);
    font-size: 0.9rem;
    padding: 0.55rem 0.4rem;
  }

  .nav-item.active {
    color: var(--accent);
    font-weight: 600;
  }
</style>