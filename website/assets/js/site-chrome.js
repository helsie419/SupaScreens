(function () {
  var yearEl = document.getElementById('sc-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

(function () {
  var nav = document.querySelector('.site-nav');
  if (!nav) return;

  var toggle = nav.querySelector('.site-nav__toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var submenuToggles = nav.querySelectorAll('.site-nav__submenu-toggle');
  submenuToggles.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var item = btn.closest('.site-nav__item--has-submenu');
      var wasOpen = item.classList.contains('is-open');
      nav.querySelectorAll('.site-nav__item--has-submenu.is-open').forEach(function (openItem) {
        openItem.classList.remove('is-open');
        openItem.querySelector('.site-nav__submenu-toggle').setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  document.addEventListener('click', function (e) {
    if (!nav.contains(e.target)) {
      nav.querySelectorAll('.site-nav__item--has-submenu.is-open').forEach(function (openItem) {
        openItem.classList.remove('is-open');
        openItem.querySelector('.site-nav__submenu-toggle').setAttribute('aria-expanded', 'false');
      });
    }
  });
})();

// Gallery category tabs (gallery.html).
(function () {
  document.querySelectorAll('[data-tabs]').forEach(function (tabsEl) {
    var buttons = tabsEl.querySelectorAll('.gallery-tabs button');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var targetId = btn.getAttribute('aria-controls');
        var target = document.getElementById(targetId);
        if (!target) return;

        buttons.forEach(function (b) {
          b.setAttribute('aria-selected', 'false');
        });
        btn.setAttribute('aria-selected', 'true');

        tabsEl.querySelectorAll('.gallery-panel').forEach(function (p) {
          p.classList.remove('is-active');
        });
        target.classList.add('is-active');
      });
    });
  });
})();

// Lightbox: click a gallery thumbnail to see it full-size with prev/next.
(function () {
  var triggers = document.querySelectorAll('[data-lightbox-src]');
  if (!triggers.length) return;

  var groups = {};
  triggers.forEach(function (el) {
    var group = el.getAttribute('data-lightbox-group') || 'default';
    (groups[group] = groups[group] || []).push(el);
  });

  var overlay = document.createElement('div');
  overlay.className = 'sc-lightbox';
  overlay.innerHTML =
    '<button type="button" class="sc-lightbox__close" aria-label="Close">&times;</button>' +
    '<button type="button" class="sc-lightbox__prev" aria-label="Previous image">&#8249;</button>' +
    '<figure class="sc-lightbox__figure"><img class="sc-lightbox__img" alt=""><figcaption class="sc-lightbox__caption"></figcaption></figure>' +
    '<button type="button" class="sc-lightbox__next" aria-label="Next image">&#8250;</button>';
  document.body.appendChild(overlay);

  var imgEl = overlay.querySelector('.sc-lightbox__img');
  var captionEl = overlay.querySelector('.sc-lightbox__caption');
  var currentGroup = [];
  var currentIndex = 0;

  function show(index) {
    currentIndex = (index + currentGroup.length) % currentGroup.length;
    var el = currentGroup[currentIndex];
    imgEl.src = el.getAttribute('data-lightbox-src');
    imgEl.alt = el.getAttribute('data-lightbox-caption') || '';
    captionEl.textContent = imgEl.alt;
  }

  function open(group, index) {
    currentGroup = groups[group];
    show(index);
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  triggers.forEach(function (el) {
    el.addEventListener('click', function () {
      var group = el.getAttribute('data-lightbox-group') || 'default';
      open(group, groups[group].indexOf(el));
    });
  });

  overlay.querySelector('.sc-lightbox__close').addEventListener('click', close);
  overlay.querySelector('.sc-lightbox__prev').addEventListener('click', function () { show(currentIndex - 1); });
  overlay.querySelector('.sc-lightbox__next').addEventListener('click', function () { show(currentIndex + 1); });
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });
  document.addEventListener('keydown', function (e) {
    if (!overlay.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(currentIndex - 1);
    if (e.key === 'ArrowRight') show(currentIndex + 1);
  });
})();

// Nav gains a blurred background + shadow on scroll, and switches to position:fixed
// once it would otherwise scroll out of its (short) parent header — position:sticky
// can only stick within its own parent's box, and the top info strip isn't tall
// enough to keep it pinned for the rest of the page. A spacer keeps content from
// jumping when the nav leaves normal flow.
(function () {
  var nav = document.querySelector('.site-nav');
  var topStrip = document.querySelector('.site-header__top');
  if (!nav || !topStrip) return;

  var spacer = document.createElement('div');
  spacer.className = 'site-nav-spacer';
  spacer.setAttribute('aria-hidden', 'true');
  nav.insertAdjacentElement('afterend', spacer);

  function update() {
    var pinThreshold = topStrip.offsetHeight;
    var scrolled = window.scrollY > 12;
    var shouldPin = window.scrollY >= pinThreshold;

    nav.classList.toggle('is-scrolled', scrolled);
    nav.classList.toggle('is-pinned', shouldPin);
    spacer.style.height = shouldPin ? nav.offsetHeight + 'px' : '0';
  }
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
})();

// Scroll reveal: fade/rise a curated set of elements into place the first time they
// enter the viewport. Applied via JS rather than hand-added markup classes so every
// page picks it up uniformly from these shared selectors.
(function () {
  if (!('IntersectionObserver' in window)) return;

  var selectors = [
    '.section__eyebrow',
    '.section__heading',
    '.feature-card',
    '.testimonial-card',
    '.category-tile',
    '.collection',
    '.intro__body',
    '.intro__media',
    '.cta-banner',
    '.gallery-grid button',
    '.value-list li'
  ];
  var els = document.querySelectorAll(selectors.join(','));
  if (!els.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  els.forEach(function (el) {
    el.classList.add('reveal');
    observer.observe(el);
  });
})();

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').then(function (registration) {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function (err) {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

// Contact form submission confirmation popup (AJAX interceptor)
(function () {
  var form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var formData = new FormData(form);
    var body = new URLSearchParams(formData).toString();

    // Show loading state on button
    var submitBtn = form.querySelector('button[type="submit"]');
    var originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    fetch(form.getAttribute('action') || window.location.pathname, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Submission failed');

        // Success: Inject and show modal popup
        showSuccessModal();
        form.reset();
      })
      .catch(function (err) {
        console.error(err);
        alert('There was a problem submitting your request. Please try again or call us at 1300 158 699.');
      })
      .finally(function () {
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
      });
  });

  function showSuccessModal() {
    var modal = document.querySelector('.sc-modal-overlay');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'sc-modal-overlay';
      modal.innerHTML =
        '<div class="sc-modal-card">' +
        '  <div class="sc-modal-icon">' +
        '    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
        '      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>' +
        '      <polyline points="22 4 12 14.01 9 11.01"/>' +
        '    </svg>' +
        '  </div>' +
        '  <h2>message sent!</h2>' +
        '  <p>Thank you for contacting SupaScreens. Our team will get back to you shortly to organise your free measure and quote.</p>' +
        '  <button type="button" class="btn btn--solid sc-modal-close">Close</button>' +
        '</div>';
      document.body.appendChild(modal);

      var closeBtn = modal.querySelector('.sc-modal-close');
      closeBtn.addEventListener('click', close);
      modal.addEventListener('click', function (e) {
        if (e.target === modal) close();
      });
    }

    function close() {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    setTimeout(function () {
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }, 10);
  }
})();


