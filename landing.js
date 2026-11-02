(() => {
  'use strict';
  // A/B preparation only. Enable one experiment after defining allocation and
  // confirmed-purchase attribution. No randomization or tracking tags added.
  const copy = {
    headlines: {
      A: 'Seu filho só quer saber de celular? Dê a ele 95 motivos para criar!',
      B: 'Menos tempo no celular. Mais momentos criando, descobrindo e se divertindo!',
      C: '95 projetos criativos para tirar as crianças do tédio — por apenas R$ 19,90!'
    },
    ctas: { A: 'QUERO OS 95 PROJETOS POR R$19,90', B: 'QUERO COMEÇAR A CRIAR COM MEU FILHO' }
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
