/* ===== ACSI Services — main.js ===== */

document.addEventListener('DOMContentLoaded', () => {

  /* ----- Footer year ----- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ----- Hamburger menu ----- */
  const hamburger = document.getElementById('hamburger');
  const mainNav = document.getElementById('main-nav');

  if (hamburger && mainNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-label', isOpen ? 'Menu sluiten' : 'Menu openen');
    });

    // Close nav when a link is clicked
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-label', 'Menu openen');
      });
    });

    // Close nav on outside click
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !mainNav.contains(e.target)) {
        mainNav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-label', 'Menu openen');
      }
    });
  }

  /* ----- Smooth scrolling for all anchor links ----- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerHeight = document.querySelector('.site-header')?.offsetHeight || 72;
        const offsetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
      }
    });
  });

  /* ----- Kwalificatie tool ----- */
  const singleGroups = ['calls', 'mode', 'rapportage', 'rapportage-custom', 'personalisatie'];
  const multiGroups = ['extras'];
  const selections = {};

  // Handle single-select groups
  singleGroups.forEach(group => {
    const container = document.querySelector(`[data-group="${group}"]`);
    if (!container) return;
    container.querySelectorAll('.qual-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.qual-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selections[group] = btn.dataset.value;
      });
    });
  });

  // Handle multi-select groups
  multiGroups.forEach(group => {
    const container = document.querySelector(`[data-group="${group}"]`);
    if (!container) return;
    selections[group] = [];
    container.querySelectorAll('.qual-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('selected');
        const val = btn.dataset.value;
        const idx = selections[group].indexOf(val);
        if (idx === -1) selections[group].push(val);
        else selections[group].splice(idx, 1);
      });
    });
  });

  /* ----- Recommendation logic ----- */
  function getRecommendation(s) {
    let score = 0;

    // calls per day
    if (s.calls === 'mid') score += 1;
    if (s.calls === 'high') score += 2;

    // mode
    if (s.mode === 'auto') score += 2;
    if (s.mode === 'support') score += 1;

    // rapportage
    if (s.rapportage === 'yes') score += 1;

    // gepersonaliseerde rapportages → Premium
    if (s['rapportage-custom'] === 'yes') score += 3;

    // personalisatie
    if (s.personalisatie === 'uitgebreid') score += 2;
    if (s.personalisatie === 'basis') score += 0;

    // extras
    const extras = s.extras || [];
    if (extras.includes('push')) score += 1;
    if (extras.includes('noshow')) score += 1;
    if (extras.includes('bevestiging')) score += 2;

    let pakket, desc;

    if (score >= 7) {
      pakket = 'Premium';
      desc = 'Op basis van uw wensen heeft u behoefte aan volledige automatisering, uitgebreide personalisatie en gepersonaliseerde rapportages. Het Premium pakket biedt u alle tools om uw communicatie volledig te ontzorgen.';
    } else if (score >= 3) {
      pakket = 'Performance';
      desc = 'Uw profiel past bij het Performance pakket. U profiteert van teamondersteuning, push notificaties, rapportages en no-show preventie — zonder de complexiteit van een volledig beheerd pakket.';
    } else {
      pakket = 'Essential';
      desc = 'Voor uw situatie is het Essential pakket een uitstekende keuze. U krijgt professionele telefonische bereikbaarheid, leadkwalificatie en agendabeheer op een solide basis.';
    }

    // Build extras list
    const extrasList = [];

    if ((s.extras || []).includes('push') && pakket === 'Essential') {
      extrasList.push('Push notificaties (beschikbaar als aanvulling)');
    }
    if ((s.extras || []).includes('noshow') && pakket === 'Essential') {
      extrasList.push('No-show preventie (beschikbaar als aanvulling)');
    }
    if ((s.extras || []).includes('bevestiging') && pakket !== 'Premium') {
      extrasList.push('Bevestigingsberichten (inbegrepen bij Premium)');
    }
    if (s['rapportage-custom'] === 'yes' && pakket !== 'Premium') {
      extrasList.push('Gepersonaliseerde rapportages (inbegrepen bij Premium)');
    }
    if (s.personalisatie === 'uitgebreid' && pakket !== 'Premium') {
      extrasList.push('Uitgebreide personalisatie (inbegrepen bij Premium)');
    }

    return { pakket, desc, extrasList };
  }

  /* ----- Submit button ----- */
  const submitBtn = document.getElementById('qual-submit');
  const resultDiv = document.getElementById('qual-result');
  const resultPakket = document.getElementById('result-pakket');
  const resultDesc = document.getElementById('result-desc');
  const resultExtras = document.getElementById('result-extras');

  if (submitBtn && resultDiv) {
    submitBtn.addEventListener('click', () => {
      // Validate at least calls and mode are selected
      if (!selections.calls || !selections.mode) {
        submitBtn.textContent = 'Selecteer minimaal uw belvolume en primaire behoefte';
        submitBtn.style.background = '#b44646';
        setTimeout(() => {
          submitBtn.textContent = 'Toon mijn aanbeveling →';
          submitBtn.style.background = '';
        }, 2500);
        return;
      }

      const { pakket, desc, extrasList } = getRecommendation(selections);

      resultPakket.textContent = pakket;
      resultDesc.textContent = desc;

      // Render extras
      resultExtras.innerHTML = '';
      if (extrasList.length > 0) {
        extrasList.forEach(item => {
          const el = document.createElement('div');
          el.className = 'extra-item';
          el.textContent = item;
          resultExtras.appendChild(el);
        });
      }

      resultDiv.style.display = 'block';

      // Scroll to result on mobile
      if (window.innerWidth < 860) {
        const headerH = document.querySelector('.site-header')?.offsetHeight || 72;
        const top = resultDiv.getBoundingClientRect().top + window.scrollY - headerH - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  }

  /* ----- Scroll-based header shadow ----- */
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.style.boxShadow = window.scrollY > 10
        ? '0 2px 16px rgba(0,0,0,0.08)'
        : 'none';
    }, { passive: true });
  }

});
