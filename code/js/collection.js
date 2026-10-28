// ใช้ข้อมูลเกมชุดเดียวกับหน้ารายละเอียด
const collectionGroup = document.querySelector(".collection-group");

window.gameItems.forEach(function (game, index) {
  const figure = document.createElement("figure");
  figure.className = "collection-item " + (index % 2 ? "item-low" : "item-high");

  const imageLink = document.createElement("a");
  imageLink.className = "collection-image";
  imageLink.href = "Detail.html?id=" + encodeURIComponent(game.id);
  imageLink.setAttribute("aria-label", "ดูรายละเอียด: " + game.name);

  const image = document.createElement("img");
  image.alt = "ปกเกม " + game.name;
  image.width = game.width;
  image.height = game.height;
  image.draggable = false;
  image.decoding = "async";
  image.sizes = "(max-width: 767px) 220px, 270px";
  const small = game.image.replace('.webp', '-360.webp');
  const srcset = small + ' 360w, ' + game.image.replace('.webp', '-480.webp') + ' 480w, ' + game.image + ' ' + game.width + 'w';
  if (index > 3) {
    image.dataset.src = small;
    image.dataset.srcset = srcset;
  } else {
    image.srcset = srcset;
    image.src = small;
  }
  imageLink.appendChild(image);

  const caption = document.createElement("figcaption");
  const title = document.createElement("h2");
  title.textContent = game.name;
  const description = document.createElement("p");
  description.textContent = game.caption;
  const category = document.createElement("p");
  category.className = "item-maker";
  category.textContent = game.category;
  const detailLink = document.createElement("a");
  detailLink.className = "text-link";
  detailLink.href = imageLink.href;
  detailLink.textContent = "See details ";
  const arrow = document.createElement("i");
  arrow.className = "icon";
  arrow.dataset.lucide = "arrow-up-right";
  arrow.setAttribute("aria-hidden", "true");
  detailLink.appendChild(arrow);
  caption.append(title, description, category, detailLink);
  figure.append(imageLink, caption);
  collectionGroup.appendChild(figure);
});
