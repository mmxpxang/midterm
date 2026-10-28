// Small inline SVGs replace the full icon library and its network request.
(function () {
  const paths = {
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    x: '<path d="m6 6 12 12M6 18 18 6"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
    'arrow-up-right': '<path d="M7 17 17 7M7 7h10v10"/>',
    'arrow-up': '<path d="M12 20V4m-7 7 7-7 7 7"/>',
    'arrow-left': '<path d="M20 12H4m7-7-7 7 7 7"/>',
    'arrow-right': '<path d="M4 12h16m-7-7 7 7-7 7"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    play: '<path d="m7 4 13 8-13 8Z"/>'
  };
  function create(name) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    for (const [key, value] of Object.entries({ viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: 'icon', 'aria-hidden': 'true', focusable: 'false' })) svg.setAttribute(key, value);
    svg.innerHTML = paths[name] || paths['arrow-up-right'];
    return svg;
  }
  function render(root = document) {
    root.querySelectorAll('i[data-lucide]').forEach(function (placeholder) {
      placeholder.replaceWith(create(placeholder.dataset.lucide));
    });
  }
  window.siteIcons = { create, render };
})();
