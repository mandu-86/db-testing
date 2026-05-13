/* ============================================================
   Fireside New Energy — Shared Nav & Footer
   Edit here to update nav/footer across all pages.
   ============================================================ */

const SITE_NAV = `
<a href="index.html" class="wordmark">
  Fireside New Energy<span class="dot"></span>
</a>
<nav>
  <div class="container nav-inner">
    <ul class="nav-links">
      <li><a href="work.html">Work</a></li>
      <li><a href="services.html">Services</a></li>
      <li><a href="about.html">About</a></li>
      <li><a href="newsletter.html">Newsletter</a></li>
      <li><a href="contact.html" class="nav-cta">Contact</a></li>
    </ul>
    <button class="nav-burger" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>
`;

const SITE_FOOTER = `
<footer>
  <div class="container footer-inner">
    <div class="footer-logo-col">
      <div class="footer-logo">
        Fireside New Energy<span class="dot" style="width:6px;height:6px;background:var(--red);border-radius:50%;display:inline-block;"></span>
      </div>
      <p class="footer-tagline">A specialist practice from <a href="https://firesideagency.com.au/" target="_blank" rel="noopener">Fireside Agency</a></p>
    </div>
    <ul class="footer-links">
      <li><a href="work.html">Work</a></li>
      <li><a href="services.html">Services</a></li>
      <li><a href="about.html">About</a></li>
      <li><a href="newsletter.html">Newsletter</a></li>
      <li><a href="contact.html">Contact</a></li>
    </ul>
    <p class="footer-copy">© 2025 Fireside New Energy Pty Ltd</p>
  </div>
</footer>
`;

const nav = document.getElementById('site-nav');
if (nav) nav.outerHTML = SITE_NAV;

const footer = document.getElementById('site-footer');
if (footer) footer.outerHTML = SITE_FOOTER;
