const games = window.gameItems;
const itemId = new URLSearchParams(window.location.search).get("id") || games[0].id;
const item = games.find(function (game) { return game.id === itemId; });

function showCover(image, game) {
  image.width = game.width;
  image.height = game.height;
  const small = game.image.replace('.webp', '-360.webp');
  image.srcset = small + ' 360w, ' + game.image.replace('.webp', '-480.webp') + ' 480w, ' + game.image + ' ' + game.width + 'w';
  image.src = small;
  image.alt = "ปกเกม " + game.name;
}

if (item) {
  document.title = item.name + " | My favorite game";
  document.querySelectorAll("[data-field]").forEach(function (element) {
    element.textContent = item[element.dataset.field];
  });
  const image = document.querySelector("#detail-image");
  showCover(image, item);

  const index = games.indexOf(item);
  [1, 2].forEach(function (step) {
    const related = games[(index + step) % games.length];
    const suffix = step === 1 ? "" : "-2";
    document.querySelector("#related-link" + suffix).href =
      "Detail.html?id=" + encodeURIComponent(related.id);
    const relatedImage = document.querySelector("#related-image" + suffix);
    showCover(relatedImage, related);
    document.querySelector("#related-name" + suffix).textContent = related.name;
    document.querySelector("#related-caption" + suffix).textContent = related.caption;
  });
} else {
  document.querySelector("#detail-content").hidden = true;
  document.querySelector("#not-found").hidden = false;
  document.title = "ไม่พบเกม | My favorite game";
}
