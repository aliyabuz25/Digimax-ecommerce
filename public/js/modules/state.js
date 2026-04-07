export const COOKIE_CONSENT_KEY = "digimax-cookie-consent";
export const CART_STORAGE_KEY = "digimax-cart-items";

export const createInitialState = (siteData) => ({
  cookieAccepted: false,
  cookieConsentReady: false,
  activeCatalogTab: "",
  isCatalogLoading: false,
  isAppLoading: true,
  isContactView: false,
  selectedProduct: null,
  cartItems: [],
  cartOpen: false,
  mobileOpen: false,
  searchOpen: false,
  searchQuery: "",
  searchResults: [],
  isSearching: false,
  catalogSearchQuery: "",
  catalogPage: 1,
  catalogPageSize: 8,
  hotDeals: siteData.fallbackHotDeals ?? [],
  playerPicks: siteData.fallbackPlayerPicks ?? [],
  storeProducts: [],
});

export const getActiveCatalog = (state, siteData) =>
  siteData.catalogTabs[state.activeCatalogTab] || siteData.catalogTabs.PlayStation;

export const getFilteredCatalogProducts = (state) => {
  const query = state.catalogSearchQuery.trim().toLowerCase();
  const items =
    state.activeCatalogTab === "AllProducts"
      ? state.storeProducts
      : state.storeProducts.filter((item) => item.tab === state.activeCatalogTab);

  if (!query) return items;

  return items.filter((item) => {
    const haystack = [item.title, item.subtitle, item.platform, item.product_type, item.description]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
};

export const getCatalogPagination = (state) => {
  const items = getFilteredCatalogProducts(state);
  const pageSize = Math.max(Number(state.catalogPageSize) || 8, 1);
  const totalItems = items.length;
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);
  const currentPage = Math.min(Math.max(Number(state.catalogPage) || 1, 1), totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = items.slice(startIndex, startIndex + pageSize);

  return {
    items,
    paginatedItems,
    pageSize,
    totalItems,
    totalPages,
    currentPage,
    startIndex,
    endIndex: Math.min(startIndex + paginatedItems.length, totalItems),
  };
};

export const getRecommendedProducts = (state) => {
  if (!state.selectedProduct) return [];

  return state.storeProducts
    .filter((product) => product.slug !== state.selectedProduct.slug)
    .slice(0, 4);
};

export const findProductBySlug = (state, slug) =>
  state.storeProducts.find((product) => product.slug === slug) ||
  state.hotDeals.find((product) => product.slug === slug) ||
  state.playerPicks.find((product) => product.slug === slug) ||
  null;
