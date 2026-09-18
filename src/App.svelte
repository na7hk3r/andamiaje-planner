<script>
  // Slice-2 shell: imports the runes store so the build pipeline proves
  // app-state.svelte.js compiles inside the real app. Task 4.6 replaces
  // this with the disclaimer gate, view switch and footer in slice 4.
  import { copy } from './lib/i18n-copy/es.js';
  import { state } from './lib/store/app-state.svelte.js';
</script>

<main>
  <h1>{copy.app.title}</h1>
  <p>{copy.app.tagline}</p>
  <p>{state.day.dateKey}</p>
</main>