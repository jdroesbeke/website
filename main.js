document.addEventListener('DOMContentLoaded', () => {

  /* ===== Footer year ===== */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ===== Hamburger menu ===== */
  const hamburger = document.getElementById('hamburger');
  const mainNav = document.getElementById('main-nav');

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

    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !mainNav.contains(e.target)) {
        mainNav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-label', 'Menu openen');
      }
    });
  }

  /* ===== Smooth scroll ===== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerHeight = document.querySelector('.site-header')?.offsetHeight || 78;
        const offsetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;

        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  /* ===== Kwalificatie ===== */
  const singleGroups = ['calls', 'mode', 'rapportage', 'rapportage-custom', 'personalisatie'];
  const multiGroups = ['extras'];
  const selections = {};

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

  /* ===== Recommendation logic (BELANGRIJK AANGEPAST) ===== */
  function getRecommendation(s) {
    let pakket = null;
    let desc = '';
    let price = '';

    // HARD BASED ON CALLS
    if (s.calls === 'low') {
      pakket = 'Essential';
      price = 'Eenmalig €1049 en daarna €445 per maand';
      desc = 'Beste keuze voor bedrijven met 1–40 calls per dag die professioneel bereikbaar willen zijn.';
    } 
    else if (s.calls === 'mid') {
      pakket = 'Performance';
      price = 'Eenmalig €1749 en daarna €849 per maand';
      desc = 'Beste keuze voor bedrijven met 40–150 calls per dag die willen opschalen en automatiseren.';
    } 
    else if (s.calls === 'high') {
      pakket = 'Premium';
      price = 'Eenmalig €3500–5000 en daarna €1899 per maand';
      desc = 'Beste keuze voor bedrijven met 150+ calls per dag die volledige ontzorging willen.';
    }

    const extrasList = [];

    // Aanvullende diensten NA pakketkeuze
    if (s.personalisatie === 'basis' && pakket === 'Essential') {
      extrasList.push('Basis personalisatie (€199 p/m)');
    }

    if (s.personalisatie === 'uitgebreid' && pakket !== 'Premium') {
      extrasList.push('Uitgebreide personalisatie (€299 p/m)');
    }

    if (s.rapportage === 'yes' && pakket !== 'Premium') {
      extrasList.push('Rapportage (€149 p/m)');
    }

    if (s['rapportage-custom'] === 'yes') {
      extrasList.push('Gepersonaliseerde rapportages (€249 p/m)');
    }

    const extras = s.extras || [];

    if (extras.includes('push') && pakket === 'Essential') {
      extrasList.push('Push notificaties (€29 p/m)');
    }

    if (extras.includes('noshow') && pakket !== 'Premium') {
      extrasList.push('No-show preventie (€49 p/m)');
    }

    if (extras.includes('bevestiging') && pakket === 'Essential') {
      extrasList.push('Bevestigingsberichten');
    }

    if (s.mode === 'auto' && pakket !== 'Premium') {
      extrasList.push('Volledig beheer');
    }

    if (s.mode === 'support' && pakket === 'Premium') {
      extrasList.push('Ondersteuning voor team');
    }

    return { pakket, desc, extrasList, price };
  }

  /* ===== Submit ===== */
  const submitBtn = document.getElementById('qual-submit');
  const resultDiv = document.getElementById('qual-result');
  const resultPakket = document.getElementById('result-pakket');
  const resultPrice = document.getElementById('result-price');
  const resultDesc = document.getElementById('result-desc');
  const resultExtras = document.getElementById('result-extras');
  const resultExtrasTitle = document.getElementById('result-extras-title');

  if (submitBtn && resultDiv) {
    submitBtn.addEventListener('click', () => {

      if (!selections.calls) {
        submitBtn.textContent = 'Selecteer eerst aantal calls';
        submitBtn.style.background = '#b44646';

        setTimeout(() => {
          submitBtn.textContent = 'Toon mijn aanbeveling →';
          submitBtn.style.background = '';
        }, 2000);

        return;
      }

      const { pakket, desc, extrasList, price } = getRecommendation(selections);

      resultPakket.textContent = pakket || '—';
      resultPrice.textContent = price || '';
      resultDesc.textContent = desc || '';

      resultExtras.innerHTML = '';

      if (extrasList.length > 0) {
        resultExtrasTitle.style.display = 'block';

        extrasList.forEach(item => {
          const el = document.createElement('div');
          el.className = 'extra-item';
          el.textContent = item;
          resultExtras.appendChild(el);
        });

      } else {
        resultExtrasTitle.style.display = 'none';
      }

      resultDiv.style.display = 'block';

      if (window.innerWidth < 860) {
        const headerH = document.querySelector('.site-header')?.offsetHeight || 78;
        const top = resultDiv.getBoundingClientRect().top + window.scrollY - headerH - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  }

  /* ===== Header shadow ===== */
  const header = document.querySelector('.site-header');

  if (header) {
    window.addEventListener('scroll', () => {
      header.style.boxShadow =
        window.scrollY > 10
          ? '0 2px 16px rgba(0,0,0,0.08)'
          : 'none';
    }, { passive: true });
  }

  /* ===== Info popover ===== */
  const popover = document.getElementById('info-popover');
  const infoButtons = document.querySelectorAll('.info-trigger');

  function hidePopover() {
    popover.classList.remove('show');
  }

  if (popover && infoButtons.length) {
    infoButtons.forEach(btn => {

      btn.addEventListener('mouseenter', () => {
        popover.textContent = btn.dataset.info;

        const rect = btn.getBoundingClientRect();

        popover.style.left = `${rect.left + window.scrollX + 20}px`;
        popover.style.top = `${rect.top + window.scrollY - 10}px`;

        popover.classList.add('show');
      });

      btn.addEventListener('mouseleave', hidePopover);

      btn.addEventListener('click', (e) => {
        e.preventDefault();

        popover.textContent = btn.dataset.info;

        const rect = btn.getBoundingClientRect();

        popover.style.left = `${rect.left + window.scrollX + 20}px`;
        popover.style.top = `${rect.bottom + window.scrollY + 10}px`;

        popover.classList.toggle('show');
      });

    });

    document.addEventListener('click', (e) => {
      if (!e.target.classList.contains('info-trigger') && !popover.contains(e.target)) {
        hidePopover();
      }
    });
  }

});