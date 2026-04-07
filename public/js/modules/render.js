import {
  catalogPagination,
  catalogProducts,
  cartItems,
  dealCards,
  formatPrice,
  pickCards,
  productModal,
  searchResults,
  toasts,
} from "./templates.js";
import { getActiveCatalog, getCatalogPagination, getRecommendedProducts } from "./state.js";

export const createDom = () => ({
  appSplash: document.getElementById("app-splash"),
  appContent: document.getElementById("app-content"),
  contactView: document.getElementById("contact-view"),
  storeView: document.getElementById("store-view"),
  homeShell: document.getElementById("home-shell"),
  catalogShell: document.getElementById("catalog-shell"),
  catalogEyebrow: document.getElementById("catalog-eyebrow"),
  catalogTitle: document.getElementById("catalog-title"),
  catalogDescription: document.getElementById("catalog-description"),
  catalogBanners: document.getElementById("catalog-banners"),
  catalogChips: document.getElementById("catalog-chips"),
  catalogFilters: document.getElementById("catalog-filters"),
  catalogCount: document.getElementById("catalog-count"),
  catalogProducts: document.getElementById("catalog-products"),
  catalogEmpty: document.getElementById("catalog-empty"),
  catalogEmptyBadge: document.getElementById("catalog-empty-badge"),
  catalogSkeleton: document.getElementById("catalog-skeleton"),
  catalogCarouselControls: document.getElementById("catalog-carousel-controls"),
  catalogPagination: document.getElementById("catalog-pagination"),
  searchOverlay: document.getElementById("search-overlay"),
  searchInput: document.getElementById("search-input"),
  searchLoader: document.getElementById("search-loader"),
  searchResultsContainer: document.getElementById("search-results-container"),
  cartOverlay: document.getElementById("cart-overlay"),
  cartBadge: document.getElementById("cart-badge"),
  mobileCartCount: document.getElementById("mobile-cart-count"),
  cartItemsList: document.getElementById("cart-items-list"),
  cartFooter: document.getElementById("cart-footer"),
  cartSubtotal: document.getElementById("cart-subtotal"),
  cartTax: document.getElementById("cart-tax"),
  cartTotal: document.getElementById("cart-total"),
  mobileMenuOverlay: document.getElementById("mobile-menu-overlay"),
  cookieWidget: document.getElementById("cookie-widget"),
  dealsGrid: document.getElementById("deals-grid"),
  picksGrid: document.getElementById("picks-grid"),
  productModalRoot: document.getElementById("product-modal-root"),
  toastContainer: document.getElementById("toast-container"),
});

const renderCatalogMeta = (dom, state, siteData) => {
  const catalog = getActiveCatalog(state, siteData);
  const pagination = getCatalogPagination(state);
  const items = pagination.items;

  if (
    !dom.catalogEyebrow ||
    !dom.catalogTitle ||
    !dom.catalogDescription ||
    !dom.catalogChips ||
    !dom.catalogFilters ||
    !dom.catalogBanners ||
    !dom.catalogCount ||
    !dom.catalogProducts ||
    !dom.catalogSkeleton ||
    !dom.catalogEmpty ||
    !dom.catalogEmptyBadge ||
    !dom.catalogCarouselControls ||
    !dom.catalogPagination
  ) {
    return;
  }

  dom.catalogEyebrow.textContent = catalog.eyebrow;
  dom.catalogTitle.textContent = catalog.title;
  dom.catalogDescription.textContent = catalog.description;
  dom.catalogChips.innerHTML = catalog.chips
    .map((chip) => `<button class="catalog-chip" type="button">${chip}</button>`)
    .join("");
  dom.catalogFilters.innerHTML = catalog.filters
    .map(
      (filter) => `
        <button class="catalog-filter" type="button">
          <span>${filter}</span>
          <span>+</span>
        </button>
      `,
    )
    .join("");
  dom.catalogBanners.innerHTML = "";
  dom.catalogCount.textContent = `${items.length} məhsul`;
  dom.catalogProducts.hidden = state.isCatalogLoading;
  dom.catalogProducts.innerHTML = state.isCatalogLoading ? "" : catalogProducts(pagination.paginatedItems);
  dom.catalogSkeleton.hidden = !state.isCatalogLoading;
  dom.catalogEmpty.hidden = items.length > 0 || state.isCatalogLoading;
  dom.catalogEmptyBadge.textContent = state.activeCatalogTab;
  dom.catalogCarouselControls.hidden = true;
  dom.catalogPagination.hidden = state.isCatalogLoading || items.length === 0 || pagination.totalPages <= 1;
  dom.catalogPagination.innerHTML = state.isCatalogLoading ? "" : catalogPagination(pagination);
};

const renderSearch = (dom, state) => {
  if (!dom.searchOverlay || !dom.searchLoader || !dom.searchResultsContainer) {
    return;
  }

  dom.searchOverlay.dataset.active = String(state.searchOpen);
  if (state.searchOpen) {
    dom.searchOverlay.hidden = false;
  } else {
    setTimeout(() => { if (!state.searchOpen) dom.searchOverlay.hidden = true; }, 500);
  }

  dom.searchLoader.hidden = !state.isSearching;
  dom.searchResultsContainer.innerHTML = searchResults(state.searchResults, state.searchQuery, state.isSearching);
};

const renderCart = (dom, state) => {
  const subtotal = state.cartItems.reduce((sum, item) => {
    const parsed = Number(String(item.price || "").replace(/[^\d.]/g, "")) || 0;
    return sum + parsed;
  }, 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  // Handle Overlay/Drawer if present (Modal mode)
  if (dom.cartOverlay) {
    const cartDrawer = dom.cartOverlay.querySelector(".cart-drawer");
    dom.cartOverlay.dataset.active = String(state.cartOpen);
    if (cartDrawer) cartDrawer.dataset.active = String(state.cartOpen);

    if (state.cartOpen) {
      dom.cartOverlay.hidden = false;
    } else {
      setTimeout(() => {
        if (!state.cartOpen) dom.cartOverlay.hidden = true;
      }, 500);
    }
  }

  // Populate list if present (Both modal and standalone page)
  if (dom.cartItemsList) {
    dom.cartItemsList.innerHTML = cartItems(state.cartItems);
  }

  // Toggle footer visibility
  if (dom.cartFooter) {
    dom.cartFooter.hidden = state.cartItems.length === 0;
  }

  // Totals
  if (dom.cartSubtotal) dom.cartSubtotal.textContent = formatPrice(subtotal);
  if (dom.cartTax) dom.cartTax.textContent = formatPrice(tax);
  if (dom.cartTotal) dom.cartTotal.textContent = formatPrice(total);

  // Badges
  if (dom.cartBadge) {
    dom.cartBadge.hidden = state.cartItems.length === 0;
    dom.cartBadge.textContent = String(state.cartItems.length);
  }
  if (dom.mobileCartCount) {
    dom.mobileCartCount.textContent = `Səbət (${state.cartItems.length})`;
  }
};

const renderNavigation = (state) => {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.navAction === state.activeCatalogTab);
  });
};

const renderModal = (dom, state) => {
  if (!dom.productModalRoot) {
    return;
  }

  dom.productModalRoot.innerHTML = productModal(state.selectedProduct, getRecommendedProducts(state));
  document.body.classList.toggle(
    "modal-open",
    Boolean(state.selectedProduct || state.cartOpen || state.searchOpen)
  );
};

const renderView = (dom, state, siteData) => {
  if (dom.appSplash) {
    dom.appSplash.hidden = !state.isAppLoading;
  }
  if (dom.appContent) {
    dom.appContent.hidden = state.isAppLoading;
  }
  if (dom.contactView) {
    dom.contactView.hidden = !state.isContactView;
  }
  if (dom.storeView) {
    dom.storeView.hidden = state.isContactView;
  }
  if (dom.catalogShell) {
    dom.catalogShell.hidden = !state.activeCatalogTab || state.isContactView;
  }
  if (dom.homeShell) {
    dom.homeShell.hidden = Boolean(state.activeCatalogTab) || state.isContactView;
  }
  if (dom.cookieWidget) {
    dom.cookieWidget.hidden =
      !state.cookieConsentReady || state.cookieAccepted || state.activeCatalogTab || state.isContactView;
  }
  if (dom.mobileMenuOverlay) {
    dom.mobileMenuOverlay.dataset.active = String(state.mobileOpen);
    if (state.mobileOpen) {
      dom.mobileMenuOverlay.hidden = false;
    } else {
      setTimeout(() => { if (!state.mobileOpen) dom.mobileMenuOverlay.hidden = true; }, 500);
    }
  }

  if (state.activeCatalogTab) {
    renderCatalogMeta(dom, state, siteData);
  }
};

export const renderApp = (dom, state, siteData, toastItems) => {
  renderView(dom, state, siteData);
  renderNavigation(state);
  renderSearch(dom, state);
  renderCart(dom, state);
  renderModal(dom, state);
  if (dom.dealsGrid) {
    dom.dealsGrid.innerHTML = dealCards(state.hotDeals);
  }
  if (dom.picksGrid) {
    dom.picksGrid.innerHTML = pickCards(state.playerPicks);
  }
  if (dom.toastContainer) {
    dom.toastContainer.innerHTML = toasts(toastItems);
  }
};
