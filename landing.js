(() => {
  'use strict';
  // A/B preparation only. Enable one experiment after defining allocation and
  // confirmed-purchase attribution. No randomization or tracking tags added.
  const copy = {
    headlines: {
      A: '95 projetos para criar, descobrir e brincar longe das telas.',
      B: 'Menos tempo no celular. Mais momentos criando, descobrindo e se divertindo!',
      C: '95 projetos criativos para tirar as crianças do tédio — por apenas R$ 19,90!'
    },
    ctas: { A: 'Quero os 95 projetos', B: 'Quero começar a criar com meu filho' }
  };
  const experiment = { active: null, variant: 'A' };
  const hero = document.querySelector('[data-hero-headline]');
  const heroCTA = document.querySelector('[data-offer-link="hero"]');
  if (experiment.active === 'headline' && copy.headlines[experiment.variant]) hero.textContent = copy.headlines[experiment.variant];
  if (experiment.active === 'cta' && copy.ctas[experiment.variant]) heroCTA.textContent = copy.ctas[experiment.variant];

  // Allow only campaign identifiers; preserve all existing checkout parameters.
  const campaignKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id', 'fbclid', 'gclid', 'wbraid', 'gbraid'];
  const incoming = new URLSearchParams(window.location.search);
  document.querySelectorAll('[data-checkout]').forEach(link => {
    const destination = new URL(link.href);
    campaignKeys.forEach(key => {
      const value = incoming.get(key);
      if (value && !destination.searchParams.has(key)) destination.searchParams.set(key, value);
    });
    link.href = destination.href;
    // Internal integration hook only: no new Pixel, GA4, or Purchase events.
    link.addEventListener('click', () => document.dispatchEvent(new CustomEvent('mega:checkout-click', {
      detail: { placement: link.dataset.checkout, experiment: experiment.active, variant: experiment.active ? experiment.variant : null }
    })));
  });
})();

// Sticky mobile CTA: appears after the hero button scrolls away and hides
// while the offer button is on screen to avoid two CTAs at once.
(() => {
  'use strict';
  const bar = document.querySelector('[data-sticky-cta]');
  if (!bar || !('IntersectionObserver' in window)) return;
  const link = bar.querySelector('a');
  const watched = ['.hero-conversion', '#card-oferta .button']
    .map(s => document.querySelector(s)).filter(Boolean);
  const onScreen = new Set();
  const update = () => {
    const show = onScreen.size === 0 && window.scrollY > 200;
    bar.classList.toggle('is-visible', show);
    bar.setAttribute('aria-hidden', show ? 'false' : 'true');
    link.tabIndex = show ? 0 : -1;
  };
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => e.isIntersecting ? onScreen.add(e.target) : onScreen.delete(e.target));
    update();
  });
  watched.forEach(el => io.observe(el));
  window.addEventListener('scroll', update, { passive: true });
})();
