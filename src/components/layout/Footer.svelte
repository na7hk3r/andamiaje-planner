<script>
  // Layout footer (spec: Disclaimer / Persistent footer — every screen shows
  // the disclaimer). Copy comes from the i18n module; no literal UI text.
  import { copy } from '../../lib/i18n-copy/es.js';
</script>

<footer class="app-footer">
  <p class="disclaimer">{copy.footer.disclaimer}</p>
</footer>

<style>
  .app-footer {
    padding: 1rem 1.25rem 1.5rem;
    text-align: center;
  }

  .disclaimer {
    margin: 0;
    font-size: 0.8rem;
    line-height: 1.5;
    color: var(--text-soft, #6b7280);
    max-width: 42rem;
    margin-inline: auto;
  }
</style>