/* ============================================================
   ACSI SERVICES — MAIN JS
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* ===== Footer year ===== */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ===== Header shadow on scroll ===== */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ===== Hamburger menu ===== */
  const hamburger = document.getElementById('hamburger');
  const mainNav   = document.getElementById('main-nav');
  if (hamburger && mainNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-label', isOpen ? 'Menu sluiten' : 'Menu openen');
    });
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-label', 'Menu openen');
      });
    });
    document.addEventListener('click', e => {
      if (!hamburger.contains(e.target) && !mainNav.contains(e.target)) {
        mainNav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-label', 'Menu openen');
      }
    });
  }

  /* ===== Smooth scroll (same-page anchors) ===== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const h = document.querySelector('.site-header')?.offsetHeight || 76;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - h - 16, behavior: 'smooth' });
      }
    });
  });

  /* ===== Scroll reveal ===== */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => obs.observe(el));
  }

  /* ===== Counter animation ===== */
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const isFloat = target % 1 !== 0;
    const duration = 1400;
    const start = performance.now();
    const raf = (ts) => {
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      el.textContent = prefix + (isFloat ? current.toFixed(1) : Math.round(current)) + suffix;
      if (progress < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  const counters = document.querySelectorAll('[data-target]');
  if (counters.length) {
    const obs2 = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs2.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => obs2.observe(el));
  }

  /* ===== Info popover ===== */
  const popover = document.getElementById('info-popover');
  if (popover) {
    const triggers = document.querySelectorAll('.info-trigger');
    const hide = () => popover.classList.remove('show');

    triggers.forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        popover.textContent = btn.dataset.info;
        const rect = btn.getBoundingClientRect();
        popover.style.left = `${rect.right + 10}px`;
        popover.style.top  = `${rect.top + window.scrollY - 4}px`;
        popover.classList.add('show');
      });
      btn.addEventListener('mouseleave', hide);
      btn.addEventListener('click', e => {
        e.stopPropagation();
        popover.textContent = btn.dataset.info;
        const rect = btn.getBoundingClientRect();
        popover.style.left = `${rect.right + 10}px`;
        popover.style.top  = `${rect.top + window.scrollY - 4}px`;
        popover.classList.toggle('show');
      });
    });
    document.addEventListener('click', e => {
      if (!e.target.classList.contains('info-trigger')) hide();
    });
  }

  /* ===== FAQ accordion ===== */
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* ===== Language switch ===== */
  const PAGE_MAP = {
    // NL → EN
    '/nl/index.html':               '/en/index_en.html',
    '/nl/over-ons.html':            '/en/about_us.html',
    '/nl/product.html':             '/en/product_en.html',
    '/nl/pakketten.html':           '/en/options.html',
    '/nl/contact.html':             '/en/contact_en.html',
    '/nl/privacybeleid.html':       '/en/privacy_notice.html',
    '/nl/algemenevoorwaarden.html': '/en/termsconditions.html',
    // EN → NL
    '/en/index_en.html':            '/nl/index.html',
    '/en/about_us.html':            '/nl/over-ons.html',
    '/en/product_en.html':          '/nl/product.html',
    '/en/options.html':             '/nl/pakketten.html',
    '/en/contact_en.html':          '/nl/contact.html',
    '/en/privacy_notice.html':      '/nl/privacybeleid.html',
    '/en/termsconditions.html':     '/nl/algemenevoorwaarden.html',
  };

  const btnNl = document.getElementById('lang-nl');
  const btnEn = document.getElementById('lang-en');

  if (btnNl && btnEn) {
    const rawPath = window.location.pathname;
    const path = rawPath.endsWith('/') ? rawPath + 'index.html' : rawPath;
    const isNL = path.startsWith('/nl/');
    const target = PAGE_MAP[path];

    // Mark active / inactive
    if (isNL) {
      btnNl.classList.add('lang-btn--active');
      btnEn.classList.add('lang-btn--inactive');
    } else {
      btnEn.classList.add('lang-btn--active');
      btnNl.classList.add('lang-btn--inactive');
    }

    // Set href for the opposite language button
    if (target) {
      if (isNL) {
        btnEn.href = target;
        btnNl.href = path;
      } else {
        btnNl.href = target;
        btnEn.href = path;
      }
    }

    // Clicking the already-active flag does nothing
    btnNl.addEventListener('click', e => { if (isNL)  e.preventDefault(); });
    btnEn.addEventListener('click', e => { if (!isNL) e.preventDefault(); });
  }

  /* ============================================================
     QUALIFICATION WIZARD (pakketten.html only)
     ============================================================ */
  const wizardWrap = document.getElementById('qual-wizard');
  if (!wizardWrap) return;

  const slides    = wizardWrap.querySelectorAll('.wizard-slide');
  const resultDiv = document.getElementById('wiz-result');
  const wpSteps   = wizardWrap.querySelectorAll('.wp-step');
  const stepLabel = wizardWrap.querySelector('.wizard-step-indicator');
  const prevBtn   = document.getElementById('wiz-prev');
  const nextBtn   = document.getElementById('wiz-next');
  const resetBtn  = document.getElementById('wiz-reset');

  const totalSteps = slides.length;
  let current = 0;
  const isEN = document.documentElement.lang === 'en';

  const sel = {
    calls: null, mode: null,
    rapportage: null, rapportageCustom: null,
    personalisatie: null, extras: []
  };

  /* Activate a slide */
  function goTo(idx) {
    slides.forEach((s, i) => s.classList.toggle('active', i === idx));
    wpSteps.forEach((s, i) => {
      s.classList.remove('active', 'done');
      if (i < idx) s.classList.add('done');
      if (i === idx) s.classList.add('active');
    });
    if (stepLabel) stepLabel.textContent = isEN
      ? `Step ${idx + 1} of ${totalSteps}`
      : `Stap ${idx + 1} van ${totalSteps}`;
    if (prevBtn) prevBtn.style.visibility = idx === 0 ? 'hidden' : 'visible';
    if (nextBtn) nextBtn.textContent = idx === totalSteps - 1
      ? (isEN ? 'View recommendation' : 'Bekijk aanbeveling')
      : (isEN ? 'Next →' : 'Volgende →');
    current = idx;
  }

  goTo(0);

  /* Handle single-select and multi-select buttons */
  wizardWrap.querySelectorAll('[data-group]').forEach(container => {
    const group   = container.dataset.group;
    const isMulti = container.dataset.multi === 'true';

    container.querySelectorAll('.wizard-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (isMulti) {
          btn.classList.toggle('selected');
          const val = btn.dataset.value;
          const idx = sel.extras.indexOf(val);
          if (idx === -1) sel.extras.push(val);
          else sel.extras.splice(idx, 1);
        } else {
          container.querySelectorAll('.wizard-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          sel[group] = btn.dataset.value;
        }
      });
    });
  });

  /* Next / Prev navigation */
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (current < totalSteps - 1) {
        goTo(current + 1);
      } else {
        showResult();
      }
    });
  }
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (current > 0) goTo(current - 1);
    });
  }

  /* Reset wizard */
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      sel.calls = null; sel.mode = null;
      sel.rapportage = null; sel.rapportageCustom = null;
      sel.personalisatie = null; sel.extras = [];
      wizardWrap.querySelectorAll('.wizard-btn').forEach(b => b.classList.remove('selected'));
      resultDiv.classList.remove('active');
      wizardWrap.querySelector('.wizard-body').style.display = '';
      goTo(0);
    });
  }

  /* Build and show result */
  function showResult() {
    const { pakket, price, desc, extrasList } = getRecommendation(sel);
    document.getElementById('wiz-result-pakket').textContent = pakket || '—';
    document.getElementById('wiz-result-price').textContent  = price  || '';
    document.getElementById('wiz-result-desc').textContent   = desc   || '';

    const extrasEl      = document.getElementById('wiz-result-extras');
    const extrasTitleEl = document.getElementById('wiz-result-extras-title');
    extrasEl.innerHTML  = '';

    if (extrasList.length > 0) {
      extrasTitleEl.style.display = 'block';
      extrasList.forEach(item => {
        const el = document.createElement('div');
        el.className   = 'extra-item';
        el.textContent = item;
        extrasEl.appendChild(el);
      });
    } else {
      extrasTitleEl.style.display = 'none';
    }

    wizardWrap.querySelector('.wizard-body').style.display = 'none';
    resultDiv.classList.add('active');
  }

  /* Recommendation logic */
  function getRecommendation(s) {
    let pakket = null, desc = '', price = '';

    if (s.calls === 'low') {
      pakket = 'Essential';
      price  = isEN ? '€750 one-time · €445/month'   : '€750 eenmalig · €445 per maand';
      desc   = isEN
        ? 'The best choice for freelancers and small businesses that want to be professionally reachable without complexity.'
        : 'De beste keuze voor zelfstandigen en kleine bedrijven die professioneel bereikbaar willen zijn zonder complexiteit.';
    } else if (s.calls === 'mid') {
      pakket = 'Performance';
      price  = isEN ? '€1,200 one-time · €849/month' : '€1.200 eenmalig · €849 per maand';
      desc   = isEN
        ? 'Ideal for growing businesses that want to automate their sales process and reduce the workload on their team.'
        : 'Ideaal voor groeiende bedrijven die hun salesproces willen automatiseren en hun team willen ontlasten.';
    } else if (s.calls === 'high') {
      pakket = 'Premium';
      price  = isEN ? '€2,250 one-time · €1,899/month' : '€2.250 eenmalig · €1.899 per maand';
      desc   = isEN
        ? 'Full peace of mind for organisations with high call volume that want maximum control and insight.'
        : 'Volledige ontzorging voor organisaties met een hoog belvolume die maximale controle en inzicht willen.';
    }

    const extrasList = [];
    if (s.personalisatie === 'basis'      && pakket === 'Essential') extrasList.push(isEN ? 'Basic personalisation (€199/month)'    : 'Basis personalisatie (€199 p/m)');
    if (s.personalisatie === 'uitgebreid' && pakket !== 'Premium')   extrasList.push(isEN ? 'Advanced personalisation (€299/month)' : 'Uitgebreide personalisatie (€299 p/m)');
    if (s.rapportage === 'yes'            && pakket !== 'Premium')   extrasList.push(isEN ? 'Reporting (€149/month)'                : 'Rapportage (€149 p/m)');
    if (s.rapportageCustom === 'yes')                                extrasList.push(isEN ? 'Custom reporting (€249/month)'         : 'Gepersonaliseerde rapportages (€249 p/m)');
    if (s.extras.includes('push')         && pakket === 'Essential') extrasList.push(isEN ? 'Push notifications (€29/month)'       : 'Push notificaties (€29 p/m)');
    if (s.extras.includes('noshow')       && pakket !== 'Premium')   extrasList.push(isEN ? 'No-show prevention (€49/month)'       : 'No-show preventie (€49 p/m)');

    return { pakket, price, desc, extrasList };
  }

}); // end DOMContentLoaded