const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export const formatPrice = (value) => `${Number(value || 0).toFixed(2)} ₼`;

const renderProductImage = (imageUrl, extraClasses = "") => {
  const isDefault = !imageUrl || imageUrl.includes("digimax_app_logo_icon.png");
  if (isDefault) {
    return `
      <div class="product-placeholder ${extraClasses} flex flex-col items-center justify-center bg-white/[0.04] rounded-2xl border border-white/5 gap-2">
        <span class="text-4xl filter grayscale opacity-30 select-none">🖼️</span>
        <span class="text-[10px] font-black uppercase text-white/10 tracking-widest">Görsəl yoxdur</span>
      </div>
    `;
  }
  return `<div class="product-image ${extraClasses} bg-cover bg-center" style="background-image:url('${escapeHtml(imageUrl)}')"></div>`;
};

export const dealCards = (items) =>
  items
    .map(
      (deal) => `
        <a class="deal-card product-card-hover" href="/product/${escapeHtml(deal.slug || "")}">
          ${renderProductImage(deal.image, "deal-card__media")}
          <div class="deal-card__body">
            <div class="deal-card__meta">
              <span class="deal-card__platform">${escapeHtml(deal.platform || "")}</span>
            </div>
            <h3 class="deal-card__title">${escapeHtml(deal.title)}</h3>
            <div class="deal-card__pricing">
              <span class="deal-card__old">${escapeHtml(deal.oldPrice || "")}</span>
              <span class="deal-card__new">${escapeHtml(deal.newPrice || deal.price || "")}</span>
            </div>
            <span class="deal-card__button btn-sketch">Kataloqa bax</span>
          </div>
        </a>
      `,
    )
    .join("");

export const pickCards = (items) =>
  items
    .map(
      (item) => `
        <a class="pick-card is-poster product-card-hover" href="/product/${escapeHtml(item.slug || "")}" title="${escapeHtml(item.title)}">
          ${renderProductImage(item.image, "pick-card__media")}
        </a>
      `,
    )
    .join("");

export const catalogProducts = (items) =>
  items
    .map(
      (product) => `
        <article class="catalog-product product-card-hover">
          <a class="catalog-product__link" href="/product/${escapeHtml(product.slug || "")}">
          ${renderProductImage(product.image, "catalog-product__media")}
          <div class="catalog-product__body">
            <div class="catalog-product__meta">
              <span class="catalog-product__platform">${escapeHtml(product.platform || "")}</span>
            </div>
            <h3 class="catalog-product__title">${escapeHtml(product.title)}</h3>
            ${product.subtitle ? `<p class="catalog-product__subtitle">${escapeHtml(product.subtitle)}</p>` : ""}
            <div class="catalog-product__pricing" style="margin-top: auto;">
              ${product.oldPrice ? `<span class="deal-card__old">${escapeHtml(product.oldPrice)}</span>` : ""}
              <span class="catalog-product__price">${escapeHtml(product.price || "")}</span>
            </div>
          </div>
          </a>
            <button class="catalog-product__button" type="button" data-add-product-slug="${escapeHtml(product.slug || "")}">
              ${escapeHtml(product.cta || "Səbətə at")}
            </button>
        </article>
      `,
    )
    .join("");

export const catalogPagination = ({ currentPage, totalPages }) => {
  if (totalPages <= 1) {
    return "";
  }

  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  for (let page = start; page <= end; page += 1) {
    pages.push(`
      <button
        class="catalog-pagination__page ${page === currentPage ? "is-active" : ""}"
        type="button"
        data-catalog-page="${page}"
      >
        ${page}
      </button>
    `);
  }

  return `
    <button
      class="catalog-pagination__nav"
      type="button"
      data-catalog-page="${Math.max(1, currentPage - 1)}"
      ${currentPage === 1 ? "disabled" : ""}
    >
      Geri
    </button>
    <div class="catalog-pagination__pages">${pages.join("")}</div>
    <button
      class="catalog-pagination__nav"
      type="button"
      data-catalog-page="${Math.min(totalPages, currentPage + 1)}"
      ${currentPage === totalPages ? "disabled" : ""}
    >
      İrəli
    </button>
  `;
};

export const searchResults = (items, query, isSearching) => {
  if (isSearching) {
    return "";
  }

  if (!query || query.trim().length < 2) {
    return "";
  }

  if (!items.length) {
    return `<div class="no-results"><p>"${escapeHtml(query)}" üçün nəticə tapılmadı.</p></div>`;
  }

  return `
    <div class="search-results-grid">
      ${items
        .map(
          (product) => `
            <div class="search-result-card" data-open-product-slug="${escapeHtml(product.slug || "")}">
              <a class="search-result-card__link" href="/product/${escapeHtml(product.slug || "")}">
                ${renderProductImage(product.image, "result-img")}
                <div class="result-content">
                  <h4>${escapeHtml(product.title)}</h4>
                  <p>${escapeHtml(product.price || "")}</p>
                </div>
              </a>
              <button class="result-add-btn" type="button" data-add-product-slug="${escapeHtml(product.slug || "")}">
                <iconify-icon icon="solar:cart-plus-bold"></iconify-icon>
              </button>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
};

export const cartItems = (items) => {
  if (!items.length) {
    return `
      <div class="flex flex-col items-center justify-center py-24 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[40px] text-center px-6">
        <div class="w-24 h-24 mb-6 rounded-full bg-white/[0.03] flex items-center justify-center">
            <iconify-icon icon="solar:cart-large-minimalistic-bold-duotone" class="text-6xl text-white/10"></iconify-icon>
        </div>
        <h4 class="text-xl font-black uppercase tracking-tight text-white/60">Səbətiniz boşdur</h4>
        <p class="text-white/20 font-bold mt-2 mb-8 max-w-xs">Hələ ki, səbətinizə heç bir oyun əlavə etməmisiniz.</p>
        <a href="/" class="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-white/5 hover:border-white/10">Alış-verişə başla</a>
      </div>
    `;
  }

  return items
    .map(
      (item, index) => `
        <div class="group flex items-center gap-6 p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all" data-open-product-slug="${escapeHtml(item.slug || "")}">
          <a href="/product/${escapeHtml(item.slug || "")}" class="shrink-0">
            ${renderProductImage(item.image, "w-16 h-20 lg:w-24 lg:h-32 rounded-2xl shadow-2xl transition-transform group-hover:scale-105")}
          </a>
          
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-start gap-4">
              <div class="min-w-0 flex-1">
                <a href="/product/${escapeHtml(item.slug || "")}" class="block">
                  <h4 class="text-sm lg:text-lg font-black text-white uppercase tracking-tight truncate hover:text-primary transition-colors">${escapeHtml(item.title)}</h4>
                </a>
                <div class="flex items-center gap-2 mt-1">
                  <span class="px-2 py-0.5 rounded text-[10px] font-black bg-white/5 text-white/40 uppercase tracking-widest">${escapeHtml(item.platform || "PC")}</span>
                  <span class="text-[10px] font-black text-green-500 uppercase tracking-widest">Anında təslim</span>
                </div>
              </div>
              
              <button class="w-10 h-10 rounded-xl bg-white/5 text-white/20 hover:bg-red-500/10 hover:text-red-500 flex items-center justify-center transition-all active:scale-90 shrink-0" type="button" data-remove-cart-index="${index}" title="Səbətdən sil">
                <iconify-icon icon="solar:trash-bin-trash-bold" class="text-xl"></iconify-icon>
              </button>
            </div>

            <div class="mt-4 flex items-end justify-between">
               <div class="flex items-center bg-black/20 rounded-lg border border-white/5 p-1">
                  <button class="w-8 h-8 rounded bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all font-black" type="button">-</button>
                  <span class="w-10 text-center text-xs font-black text-white">1</span>
                  <button class="w-8 h-8 rounded bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all font-black" type="button">+</button>
               </div>
               <span class="text-lg lg:text-xl font-black text-white tracking-tighter">${escapeHtml(item.price || "")}</span>
            </div>
          </div>
        </div>
      `,
    )
    .join("");
};

export const toasts = (items) =>
  items
    .map(
      (toast) => `
        <div class="toast-box">
          ${renderProductImage(toast.image, "toast-img")}
          <div class="toast-body">
            <h5 class="toast-title">Səbətə əlavə edildi</h5>
            <p class="toast-msg">${escapeHtml(toast.title)}</p>
          </div>
          <iconify-icon icon="solar:check-circle-bold" class="toast-icon"></iconify-icon>
        </div>
      `,
    )
    .join("");

export const productModal = () => "";
