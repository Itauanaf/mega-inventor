(() => {
  const root = document.querySelector('.testimonials-carousel');
  if (!root) return;
  function initialize() {
  const track = root.querySelector('.testimonials-track');
  const originals = [...track.children], count = originals.length;
  if (count < 2) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = motion.matches, visible = !('IntersectionObserver' in window), hovering = false, focused = false, touching = false;
  let timer, settle;
  const clone = item => {
    const copy = item.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.inert = true;
    copy.dataset.carouselClone = 'true';
    copy.querySelectorAll('img').forEach(img => { img.alt = ''; });
    return copy;
  };
  track.prepend(...originals.map(clone));
  track.append(...originals.map(clone));
  const cards = [...track.children];
  const step = () => cards[1].offsetLeft - cards[0].offsetLeft;
  const nearest = () => Math.round(track.scrollLeft / step());
  const go = (index, smooth = true) => track.scrollTo({ left:index * step(), behavior:smooth && !motion.matches ? 'smooth' : 'instant' });
  function normalize() {
    const index = nearest();
    if (index < count) go(index + count, false);
    else if (index >= count * 2) go(index - count, false);
  }
  function schedule() {
    clearInterval(timer);
    if (!paused && visible && !hovering && !focused && !touching && !document.hidden) timer = setInterval(() => go(nearest() + 1), 1500);
  }
  track.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); go(nearest() + (event.key === 'ArrowRight' ? 1 : -1)); }
  });
  track.addEventListener('scroll', () => { clearTimeout(settle); settle = setTimeout(normalize, 180); }, {passive:true});
  root.addEventListener('mouseenter', () => { hovering = true; schedule(); });
  root.addEventListener('mouseleave', () => { hovering = false; schedule(); });
  root.addEventListener('focusin', () => { focused = true; schedule(); });
  root.addEventListener('focusout', event => { focused = root.contains(event.relatedTarget); schedule(); });
  track.addEventListener('pointerdown', () => { touching = true; schedule(); }, {passive:true});
  window.addEventListener('pointerup', () => { touching = false; schedule(); }, {passive:true});
  window.addEventListener('pointercancel', () => { touching = false; schedule(); }, {passive:true});
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', () => { paused = motion.matches; schedule(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }).observe(root);
  let previousWidth = 0;
  new ResizeObserver(([entry]) => {
    const width = entry.contentRect.width;
    if (width === previousWidth) return;
    previousWidth = width;
    go(count, false);
  }).observe(track);
  requestAnimationFrame(() => { go(count, false); schedule(); });
  }
  // No clone DOM, scroll measurements or timer work during the first screen.
  if ('IntersectionObserver' in window) {
    const preparation = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      preparation.disconnect();
      initialize();
    }, { rootMargin: '400px 0px' });
    preparation.observe(root);
  } else {
    initialize();
  }
})();
