<script>
  // Layout footer (spec: Disclaimer / Persistent footer — every screen shows
  // the disclaimer). Secondary links are harmless in-page anchors: the
  // privacy contract lives in the settings view (#ajustes) and #top scrolls
  // to the top of the page. Copy comes from the i18n module; no literal UI
  // text.
  import { copy } from '../../lib/i18n-copy/es.js';
</script>

<footer class="app-footer">
  <p class="disclaimer">{copy.footer.disclaimer}</p>
  <nav class="footer-links" aria-label={copy.footer.linksLabel}>
    <a href="#ajustes">{copy.footer.privacyLink}</a>
    <span class="dot" aria-hidden="true">·</span>
    <a href="#top">{copy.footer.accessibilityLink}</a>
  </nav>
</footer>

<style>
  .app-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs, 0.25rem);
    padding: var(--space-md, 1rem) var(--gutter-mobile, 1rem) var(--space-lg, 1.5rem);
    text-align: center;
  }

  .disclaimer {
    margin: 0;
    font-size: var(--font-size-body-sm, 14px);
    line-height: var(--line-height-body-sm, 20px);
    color: var(--text-soft, #6b7280);
    max-width: 42rem;
  }

  .footer-links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm, 0.5rem);
    font-size: var(--font-size-label-sm, 12px);
    line-height: var(--line-height-label-sm, 16px);
    letter-spacing: var(--letter-spacing-label-sm, 0.02em);
  }

  .footer-links a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-field, 12px);
    color: var(--text-soft, #6b7280);
    text-decoration: none;
    transition: var(--transition-gentle, all 180ms ease-out);
  }

  .footer-links a:hover {
    color: var(--accent, #4f6b8a);
  }

  .dot {
    opacity: 0.6;
  }
</style>