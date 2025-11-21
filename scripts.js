function $(selector) {
  return document.querySelector(selector);
}

function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(productId) {
  const cart = getCart();
  const existing = cart.find((c) => c.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    cart.push({ id: productId, qty: 1 });
  }
  saveCart(cart);
  showToast('Toegevoegd aan winkelwagen');
  renderMiniCart();
}

function removeFromCart(productId) {
  const cart = getCart().filter((c) => c.id !== productId);
  saveCart(cart);
  renderMiniCart();
}

function updateCartBadge() {
  const badge = $('#cartCount');
  if (!badge) return;
  const total = getCart().reduce((sum, item) => {
    const product = products.find((p) => p.id === item.id);
    return sum + (product ? item.qty : 0);
  }, 0);
  badge.textContent = total;
}

function renderSuggestions(query) {
  const list = $('#searchSuggestions');
  if (!list) return;
  list.innerHTML = '';
  const matched = products.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()));
  if (!query || matched.length === 0) {
    list.classList.remove('visible');
    return;
  }
  matched.slice(0, 5).forEach((item) => {
    const btn = document.createElement('button');
    btn.textContent = item.title;
    btn.onclick = () => {
      window.location.href = `product.html?id=${item.id}`;
    };
    list.appendChild(btn);
  });
  list.classList.add('visible');
}

function renderHome() {
  const popular = $('#popularCategories');
  const featured = $('#featuredGrid');
  if (popular) {
    popular.innerHTML = categories
      .map(
        (cat) => `
        <article class="card">
          <img src="${cat.image}" alt="${cat.name}" />
          <div class="tag">${cat.name}</div>
          <p>${cat.description}</p>
          <a class="button ghost" href="category.html?category=${encodeURIComponent(cat.name)}">Bekijk ${cat.name}</a>
        </article>
      `,
      )
      .join('');
  }
  if (featured) {
    const picks = products.slice(0, 6);
    featured.innerHTML = picks
      .map(
        (product) => `
        <article class="product-card">
          <a href="product.html?id=${product.id}"><img src="${product.image}" alt="${product.title}" /></a>
          <div class="tag">${product.tag}</div>
          <a href="product.html?id=${product.id}"><h3>${product.title}</h3></a>
          <div class="price">€${product.price}</div>
          <button class="add-btn" data-id="${product.id}">In winkelwagen</button>
        </article>
      `,
      )
      .join('');
  }
}

function renderCategoryPage() {
  const grid = $('#categoryGrid');
  if (!grid) return;
  const params = new URLSearchParams(window.location.search);
  const category = params.get('category');
  const header = $('#categoryTitle');
  if (header) header.textContent = category || 'Alle categorieën';
  const filtered = category ? products.filter((p) => p.category === category) : products;
  grid.innerHTML = filtered
    .map(
      (p) => `
      <article class="product-card">
        <a href="product.html?id=${p.id}"><img src="${p.image}" alt="${p.title}" /></a>
        <div class="tag">${p.tag}</div>
        <a href="product.html?id=${p.id}"><h3>${p.title}</h3></a>
        <div class="price">€${p.price}</div>
        <button class="add-btn" data-id="${p.id}">In winkelwagen</button>
      </article>
    `,
    )
    .join('');
  const chips = $('#filterChips');
  if (chips) {
    chips.innerHTML = categories
      .map((c) => `<button class="chip" data-chip="${c.name}">${c.name}</button>`)
      .join('');
  }
}

function renderProductPage() {
  const section = $('#productDetail');
  if (!section) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const product = products.find((p) => p.id === id) || products[0];
  section.innerHTML = `
    <div class="page-header">
      <div>
        <div class="breadcrumbs">${product.category} / ${product.title}</div>
        <h1>${product.title}</h1>
        <div class="tag">${product.tag}</div>
      </div>
      <div class="price">€${product.price}</div>
    </div>
    <div class="layout">
      <img src="${product.image}" alt="${product.title}" style="width:100%; border-radius:16px; max-height:420px; object-fit:cover;" />
      <div class="filter-card">
        <p>${product.description}</p>
        <div>${product.highlights.map((h) => `<div class="chip">${h}</div>`).join('')}</div>
        <button class="add-btn" data-id="${product.id}" style="width:100%; margin-top:12px;">In winkelwagen</button>
        <p style="margin-top:8px; color:#4b5a73;">Voor 23:59 besteld, morgen in huis.</p>
      </div>
    </div>
  `;
}

function renderKlantenservice() {
  const accordion = $('#faqAccordion');
  if (!accordion) return;
  const items = [
    { title: 'Waar is mijn bestelling?', text: 'Log in en volg je pakket realtime of ontvang meldingen.' },
    { title: 'Retourneren', text: 'Meld eenvoudig je retour aan via je account en download het label.' },
    { title: 'Betalen', text: 'Achteraf betalen, iDEAL en creditcard worden ondersteund.' },
  ];
  accordion.innerHTML = items
    .map(
      (item, idx) => `
        <div class="accordion-item">
          <button data-accordion="${idx}">${item.title}</button>
          <div class="panel">${item.text}</div>
        </div>
      `,
    )
    .join('');
}

function renderCartPage() {
  const list = $('#cartList');
  if (!list) return;
  const cart = getCart();
  if (cart.length === 0) {
    list.innerHTML = '<p>Je winkelwagen is leeg. <a href="index.html">Verder winkelen</a></p>';
    $('#cartSummary').innerHTML = '';
    return;
  }
  let total = 0;
  list.innerHTML = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.id);
      if (!product) return '';
      const line = product.price * item.qty;
      total += line;
      return `
        <div class="cart-line">
          <div>
            <strong>${product.title}</strong>
            <div class="breadcrumbs">${product.category}</div>
          </div>
          <div>€${product.price}</div>
          <div>x ${item.qty}</div>
          <button aria-label="Verwijder" data-remove="${product.id}">✕</button>
        </div>
      `;
    })
    .join('');
  $('#cartSummary').innerHTML = `
    <div class="filter-card">
      <div class="page-header"><strong>Totaal</strong><div class="price">€${total.toFixed(2)}</div></div>
      <button class="button primary" style="width:100%;">Afrekenen</button>
      <p class="breadcrumbs">Inclusief gratis verzending vanaf €20.</p>
    </div>
  `;
}

function renderMiniCart() {
  const mini = $('#miniCart');
  if (!mini) return;
  const cart = getCart();
  if (cart.length === 0) {
    mini.innerHTML = '<p>Je winkelwagen is leeg.</p>';
    return;
  }
  const items = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.id);
      if (!product) return '';
      return `<li><span>${product.title} x${item.qty}</span><span>€${product.price * item.qty}</span></li>`;
    })
    .join('');
  mini.innerHTML = `<ul>${items}</ul><a class="button primary" href="cart.html">Naar winkelwagen</a>`;
}

function showToast(message) {
  let toast = $('#toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 1800);
}

function setupEvents() {
  document.addEventListener('click', (e) => {
    if (e.target.matches('.add-btn')) {
      addToCart(e.target.dataset.id);
    }
    if (e.target.matches('[data-remove]')) {
      removeFromCart(e.target.dataset.remove);
      renderCartPage();
    }
    if (e.target.matches('[data-chip]')) {
      const cat = e.target.dataset.chip;
      window.location.href = `category.html?category=${encodeURIComponent(cat)}`;
    }
    if (e.target.matches('[data-accordion]')) {
      const idx = e.target.dataset.accordion;
      const panel = document.querySelector(`.panel:nth-of-type(${Number(idx) + 1})`);
      document.querySelectorAll('.panel').forEach((p, i) => p.classList.toggle('open', i === Number(idx)));
    }
    if (e.target.closest('.cart-link')) {
      const mini = $('#miniCart');
      if (mini) mini.classList.toggle('visible');
    }
  });

  const searchInput = $('#searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => renderSuggestions(e.target.value));
    searchInput.addEventListener('focus', (e) => renderSuggestions(e.target.value));
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search')) {
        $('#searchSuggestions')?.classList.remove('visible');
      }
    });
  }
}

function bootstrap() {
  renderHome();
  renderCategoryPage();
  renderProductPage();
  renderKlantenservice();
  renderCartPage();
  renderMiniCart();
  updateCartBadge();
  setupEvents();
}

document.addEventListener('DOMContentLoaded', bootstrap);
