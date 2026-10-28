window.siteIcons.render();

// A small accessible menu replaces Bootstrap's JavaScript bundle.
const menu = document.querySelector('#mainNav');
const menuToggle = document.querySelector('.navbar-toggler');
const menuClose = menu.querySelector('.menu-close');
const mobile = window.matchMedia('(max-width: 767px)');
const pageContent = document.querySelectorAll('main, footer');

function setMenu(open) {
  menu.classList.toggle('show', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('nav-open', open);
  pageContent.forEach(function (element) { element.inert = open; });
  if (open) {
    menu.setAttribute('role', 'dialog');
    menu.setAttribute('aria-modal', 'true');
    menuClose.focus({ preventScroll: true });
  } else {
    menu.removeAttribute('role');
    menu.removeAttribute('aria-modal');
    if (mobile.matches) menuToggle.focus({ preventScroll: true });
  }
}
menuToggle.addEventListener('click', function () { setMenu(true); });
menuClose.addEventListener('click', function () { setMenu(false); });
menu.addEventListener('click', function (event) {
  if (mobile.matches && event.target.closest('a')) setMenu(false);
});
menu.addEventListener('keydown', function (event) {
  if (!menu.classList.contains('show')) return;
  if (event.key === 'Escape') { event.preventDefault(); setMenu(false); }
  if (event.key !== 'Tab') return;
  const links = Array.from(menu.querySelectorAll('button, a[href]'));
  const first = links[0], last = links[links.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
mobile.addEventListener('change', function () {
  if (!mobile.matches && menu.classList.contains('show')) setMenu(false);
});

const viewport = document.querySelector('#board-viewport');
if (viewport) {
  const track = viewport.querySelector('.collage-board');
  const group = track.querySelector('.collection-group');
  const copy = group.cloneNode(true);
  copy.setAttribute('aria-hidden', 'true');
  copy.querySelectorAll('a').forEach(function (link) { link.tabIndex = -1; });
  track.appendChild(copy);

  // Only request distant covers when they approach the horizontal viewport.
  const coverObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      const image = entry.target;
      image.srcset = image.dataset.srcset;
      image.src = image.dataset.src;
      delete image.dataset.src;
      delete image.dataset.srcset;
      coverObserver.unobserve(image);
    });
  }, { root: viewport, rootMargin: '0px 600px' });
  track.querySelectorAll('img[data-src]').forEach(function (image) { coverObserver.observe(image); });

  let offset = 0, width = group.offsetWidth;
  let paused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let dragging = false, moved = false, hovered = false, reading = false, focused = false;
  let visible = false, frame = 0, lastTime = 0, startX = 0, startOffset = 0;
  const pauseButton = document.querySelector('#board-pause');

  function render() {
    if (!width) return;
    offset = ((offset % width) + width) % width;
    track.style.transform = 'translate3d(' + -offset + 'px,0,0)';
  }
  function canAnimate() { return visible && !paused && !dragging && !reading && !focused && !document.hidden; }
  function animate(time) {
    frame = 0;
    if (!canAnimate()) return;
    const elapsed = lastTime ? Math.min(time - lastTime, 50) : 0;
    lastTime = time;
    offset += elapsed * (hovered ? 4 : 28) / 1000;
    render();
    frame = requestAnimationFrame(animate);
  }
  function syncAnimation() {
    if (canAnimate()) {
      if (!frame) { lastTime = 0; frame = requestAnimationFrame(animate); }
    } else {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
    }
  }
  function updatePause() {
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.setAttribute('aria-label', paused ? 'เริ่มการเลื่อน' : 'หยุดการเลื่อน');
    pauseButton.querySelector('span').textContent = paused ? 'Play' : 'Pause';
    pauseButton.querySelector('.icon').replaceWith(window.siteIcons.create(paused ? 'play' : 'pause'));
    syncAnimation();
  }
  pauseButton.addEventListener('click', function () { paused = !paused; updatePause(); });
  ['prev', 'next'].forEach(function (direction) {
    document.querySelector('#board-' + direction).addEventListener('click', function () {
      offset += (direction === 'next' ? 1 : -1) * Math.round(viewport.clientWidth * .6);
      render();
    });
  });
  new ResizeObserver(function () { width = group.offsetWidth; render(); }).observe(group);
  new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; syncAnimation(); }).observe(viewport);
  document.addEventListener('visibilitychange', syncAnimation);
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', function (event) {
    paused = event.matches;
    updatePause();
  });
  viewport.addEventListener('pointerenter', function () { hovered = true; });
  viewport.addEventListener('pointerleave', function () { hovered = false; reading = false; syncAnimation(); });
  viewport.addEventListener('pointerover', function (event) {
    reading = !!event.target.closest('figcaption');
    syncAnimation();
  });
  viewport.addEventListener('focusin', function (event) {
    focused = true;
    syncAnimation();
    const figure = event.target.closest('.collection-item');
    if (!figure) return;
    const rect = figure.getBoundingClientRect();
    const bounds = viewport.getBoundingClientRect();
    if (rect.left < bounds.left || rect.right > bounds.right) { offset += rect.left - bounds.left - 24; render(); }
  });
  viewport.addEventListener('focusout', function (event) {
    focused = viewport.contains(event.relatedTarget);
    syncAnimation();
  });
  viewport.addEventListener('scroll', function () {
    if (!viewport.scrollLeft) return;
    offset += viewport.scrollLeft;
    viewport.scrollLeft = 0;
    render();
  }, { passive: true });
  viewport.addEventListener('dragstart', function (event) { event.preventDefault(); });
  viewport.addEventListener('pointerdown', function (event) {
    if (event.button > 0) return;
    dragging = true; moved = false; startX = event.clientX; startOffset = offset;
    syncAnimation();
  });
  function endDrag() { dragging = false; syncAnimation(); }
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  viewport.addEventListener('lostpointercapture', endDrag);
  window.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointermove', function (event) {
    if (!dragging) return;
    const distance = event.clientX - startX;
    if (Math.abs(distance) > 6) {
      moved = true;
      viewport.setPointerCapture(event.pointerId);
      offset = startOffset - distance;
      render();
    }
  });
  viewport.addEventListener('click', function (event) {
    if (moved) { event.preventDefault(); moved = false; }
  }, true);
  updatePause();
  render();
}
