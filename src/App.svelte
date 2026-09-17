<script>
  // Slice-1 scaffold shell: renders the central copy module to prove the
  // wiring. Task 4.6 replaces this with the disclaimer gate, view switch
  // and footer in slice 4.
  import { copy } from './lib/i18n-copy/es.js';
</script>

<main>
  <h1>{copy.app.title}</h1>
  <p>{copy.app.tagline}</p>
</main>