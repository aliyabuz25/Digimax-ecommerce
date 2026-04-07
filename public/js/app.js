import { mapProductRow, queryStoreRows } from "./modules/store-db.js";
import { CART_STORAGE_KEY, COOKIE_CONSENT_KEY, createInitialState, findProductBySlug } from "./modules/state.js";
import { createDom, renderApp } from "./modules/render.js";

const siteDataNode = document.getElementById("site-data");
const siteData = (() => {
  if (window.__SITE_DATA__) return window.__SITE_DATA__;

  if (!siteDataNode) {
    return {};
  }

  try {
    return JSON.parse(siteDataNode.textContent || "{}");
  } catch (error) {
    console.error("Failed to read embedded site data.", error);
    return {};
  }
})();
const state = createInitialState(siteData);
const dom = createDom();
const toastItems = [];

if (!dom.appSplash) {
  state.isAppLoading = false;
}

const saveCart = () => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.cartItems));
};

const showToast = (product) => {
  const toast = { id: Date.now(), title: product.title, image: product.image };
  toastItems.push(toast);
  renderApp(dom, state, siteData, toastItems);

  window.setTimeout(() => {
    const index = toastItems.findIndex((item) => item.id === toast.id);
    if (index >= 0) {
      toastItems.splice(index, 1);
      renderApp(dom, state, siteData, toastItems);
    }
  }, 3000);
};

const spawnFlyingProduct = (product, trigger) => {
  const sourceRect = trigger?.getBoundingClientRect?.();
  const targetRect = document.getElementById("main-cart-icon")?.getBoundingClientRect?.();

  if (!sourceRect || !targetRect) return;

  const node = document.createElement("div");
  node.className = "flying-product";
  node.style.setProperty("--start-x", `${sourceRect.left}px`);
  node.style.setProperty("--start-y", `${sourceRect.top}px`);
  node.style.setProperty("--end-x", `${targetRect.left}px`);
  node.style.setProperty("--end-y", `${targetRect.top}px`);
  node.style.backgroundImage = `url(${product.image})`;
  document.getElementById("flying-container")?.appendChild(node);

  window.setTimeout(() => node.remove(), 1000);
};

const addToCart = (product, trigger) => {
  state.cartItems.push(product);
  saveCart();
  showToast(product);
  spawnFlyingProduct(product, trigger);
  renderApp(dom, state, siteData, toastItems);
};

const openProduct = (product) => {
  if (!product?.slug) return;
  window.location.href = `/product/${product.slug}`;
};

const openCatalogTab = (tab) => {
  state.isContactView = false;
  state.activeCatalogTab = tab;
  state.catalogSearchQuery = "";
  state.catalogPage = 1;
  state.isCatalogLoading = true;
  renderApp(dom, state, siteData, toastItems);
  window.scrollTo({ top: 0, behavior: "smooth" });

  window.setTimeout(() => {
    state.isCatalogLoading = false;
    if (dom.catalogSkeleton) {
      dom.catalogSkeleton.hidden = true;
    }
    renderApp(dom, state, siteData, toastItems);
  }, 1200);
};

const goHome = () => {
  state.isContactView = false;
  state.activeCatalogTab = "";
  state.cartOpen = false;
  state.mobileOpen = false;
  state.searchOpen = false;
  renderApp(dom, state, siteData, toastItems);
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const openContact = () => {
  state.isContactView = true;
  state.activeCatalogTab = "";
  state.mobileOpen = false;
  state.searchOpen = false;
  renderApp(dom, state, siteData, toastItems);
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const performSearch = async (query) => {
  state.searchQuery = query;

  if (!query.trim() || query.trim().length < 2) {
    state.searchResults = [];
    state.isSearching = false;
    renderApp(dom, state, siteData, toastItems);
    return;
  }

  state.isSearching = true;
  renderApp(dom, state, siteData, toastItems);

  try {
    const safeQuery = query.replaceAll("'", "''");
    const rows = await queryStoreRows(
      `SELECT * FROM store_products WHERE title LIKE '%${safeQuery}%' OR subtitle LIKE '%${safeQuery}%' LIMIT 8`,
    );
    state.searchResults = rows.map(mapProductRow);
  } catch (error) {
    console.error("Search error:", error);
    state.searchResults = [];
  } finally {
    state.isSearching = false;
    renderApp(dom, state, siteData, toastItems);
  }
};

const initResourceRepair = () => {
  // Global listener for <img> tags
  window.addEventListener("error", (event) => {
    const target = event.target;
    if (target && target.tagName === "IMG") {
      const parent = target.parentElement;
      if (!parent) return;

      const placeholder = document.createElement("div");
      // Mimic original classes to preserve layout
      placeholder.className = target.className + " flex flex-col items-center justify-center bg-white/[0.04] rounded-[inherit] border border-white/5 gap-2 min-h-[100px]";
      placeholder.style.aspectRatio = target.style.aspectRatio || "auto";
      
      placeholder.innerHTML = `
        <span class="text-3xl filter grayscale opacity-20 select-none">🖼️</span>
        <span class="text-[8px] font-black uppercase text-white/5 tracking-widest text-center px-2">Görsəl xətası</span>
      `;
      target.replaceWith(placeholder);
    }
  }, true);

  // Background-image repair logic (Aggressive)
  const repairBackgrounds = () => {
    document.querySelectorAll('[style*="background-image"]').forEach(el => {
      const bg = el.style.backgroundImage;
      if (bg && bg.startsWith('url("http') && !el.dataset.bgChecked) {
        const url = bg.slice(5, -2);
        const img = new Image();
        img.onload = () => { el.dataset.bgChecked = "true"; };
        img.onerror = () => {
          el.style.backgroundImage = 'none';
          el.classList.add("flex", "flex-col", "items-center", "justify-center", "bg-white/[0.04]", "border", "border-white/5");
          el.innerHTML = `
            <span class="text-3xl filter grayscale opacity-10 select-none">🖼️</span>
          `;
          el.dataset.bgChecked = "true";
        };
        img.src = url;
      }
    });
  };

  // Run periodically for dynamic content
  setInterval(repairBackgrounds, 3000);
  repairBackgrounds();
};

const initPointerGlow = () => {
  const glow = document.createElement("div");
  glow.className = "pointer-glow";
  document.body.appendChild(glow);

  window.addEventListener("mousemove", (e) => {
    glow.style.setProperty("--mouse-x", `${e.clientX}px`);
    glow.style.setProperty("--mouse-y", `${e.clientY}px`);
  });
};

const initRevealObserver = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in-view");
        }
      });
    },
    { threshold: 0.1 },
  );

  document.querySelectorAll(".reveal-section").forEach((section) => observer.observe(section));
};

const initTranslations = () => {
  window.gtranslateSettings = {
    default_language: "az",
    languages: ["az", "ru", "tr", "en"],
    wrapper_selector: ".gtranslate_wrapper",
  };

  if (!document.getElementById("gtranslate-script")) {
    const script = document.createElement("script");
    script.id = "gtranslate-script";
    script.src = "https://cdn.gtranslate.net/widgets/latest/flags.js";
    script.defer = true;
    document.body.appendChild(script);
  }
};

const initEvents = () => {
  document.addEventListener("click", (event) => {
    const navTarget = event.target.closest("[data-nav-action]");
    if (navTarget) {
      const action = navTarget.dataset.navAction;

      // If we are not on the root page, let the links navigate normally to /
      if (window.location.pathname !== "/") {
        return;
      }

      event.preventDefault();

      if (action === "contact") {
        openContact();
      } else if (!action || action === "home") {
        goHome();
      } else {
        openCatalogTab(action);
      }
      return;
    }

    if (event.target.closest("#search-open-btn")) {
      state.searchOpen = true;
      renderApp(dom, state, siteData, toastItems);
      dom.searchInput?.focus();
      return;
    }

    if (event.target.closest("#search-close-btn") || event.target.closest("#search-overlay")) {
      if (event.target.id === "search-overlay" || event.target.closest("#search-close-btn")) {
        state.searchOpen = false;
        renderApp(dom, state, siteData, toastItems);
      }
      return;
    }

    if (event.target.closest("#main-cart-icon") || event.target.closest("#mobile-cart-btn")) {
      state.cartOpen = true;
      state.mobileOpen = false;
      renderApp(dom, state, siteData, toastItems);
      return;
    }

    if (event.target.closest("#cart-close-btn") || event.target.closest("#cart-overlay")) {
      if (event.target.id === "cart-overlay" || event.target.closest("#cart-close-btn") || event.target.closest("[data-close-cart='true']")) {
        state.cartOpen = false;
        renderApp(dom, state, siteData, toastItems);
      }
      return;
    }

    if (event.target.closest("#mobile-menu-open-btn")) {
      state.mobileOpen = true;
      renderApp(dom, state, siteData, toastItems);
      return;
    }

    if (event.target.closest("#mobile-menu-close-btn")) {
      state.mobileOpen = false;
      renderApp(dom, state, siteData, toastItems);
      return;
    }

    const addTarget = event.target.closest("[data-add-product-slug]");
    if (addTarget) {
      event.stopPropagation();
      const product = findProductBySlug(state, addTarget.dataset.addProductSlug);
      if (product) {
        addToCart(product, addTarget);
      }
      return;
    }

    const removeTarget = event.target.closest("[data-remove-cart-index]");
    if (removeTarget) {
      event.stopPropagation();
      state.cartItems.splice(Number(removeTarget.dataset.removeCartIndex), 1);
      saveCart();
      renderApp(dom, state, siteData, toastItems);
      return;
    }

    const openProductTarget = event.target.closest("[data-open-product-slug]");
    if (openProductTarget) {
      const product = findProductBySlug(state, openProductTarget.dataset.openProductSlug);
      if (product) {
        openProduct(product);
      }
      return;
    }

    const screenshot = event.target.closest("[data-product-image]");
    if (screenshot) {
      document.getElementById("pd-main-image").src = screenshot.dataset.productImage;
      document.querySelectorAll(".pd-thumb").forEach((thumb) => thumb.classList.remove("active"));
      screenshot.classList.add("active");
      return;
    }

    if (event.target.closest("#cookie-accept-btn")) {
      state.cookieAccepted = true;
      localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
      renderApp(dom, state, siteData, toastItems);
      return;
    }

    const carouselButton = event.target.closest("[data-carousel-key]");
    if (carouselButton) {
      const key = carouselButton.dataset.carouselKey;
      const direction = Number(carouselButton.dataset.direction || "1");
      const target = document.getElementById(`${key}-grid`) || document.getElementById(`${key}-products`);

      if (target) {
        target.scrollBy({
          left: Math.max(target.clientWidth * 0.86, 280) * direction,
          behavior: "smooth",
        });
      }
    }

    const catalogPageButton = event.target.closest("[data-catalog-page]");
    if (catalogPageButton) {
      const nextPage = Number(catalogPageButton.dataset.catalogPage || "1");
      state.catalogPage = nextPage;
      renderApp(dom, state, siteData, toastItems);
      dom.catalogShell?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    const checkoutTarget = event.target.closest(".checkout-btn");
    if (checkoutTarget) {
      checkoutTarget.disabled = true;
      checkoutTarget.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          <span>Ödənişə yönləndirilirsiniz...</span>
        </div>
      `;

      setTimeout(() => {
        state.cartItems = [];
        saveCart();
        renderApp(dom, state, siteData, toastItems);
        // Here you can add the actual external redirect URL
        // window.location.href = "https://external-payment-gateway.com";
        alert("Xarici ödəniş sisteminə yönləndirilmə simulyasiya edildi. Səbət təmizləndi.");
      }, 2000);
      return;
    }
  });

  dom.searchInput?.addEventListener("input", (event) => {
    performSearch(event.target.value);
  });

  const catalogSearchInput = document.getElementById("catalog-search-input");
  catalogSearchInput?.addEventListener("input", (event) => {
    state.catalogSearchQuery = event.target.value;
    state.catalogPage = 1;
    renderApp(dom, state, siteData, toastItems);
  });

  document.getElementById("catalog-reset-btn")?.addEventListener("click", () => {
    state.catalogSearchQuery = "";
    state.catalogPage = 1;
    if (catalogSearchInput) {
      catalogSearchInput.value = "";
    }
    renderApp(dom, state, siteData, toastItems);
  });

  document.getElementById("contact-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const submitButton = document.getElementById("contact-submit-btn");

    if (!form.get("name") || !form.get("email") || !submitButton) {
      return;
    }

    submitButton.textContent = "Göndərildi!";
    event.currentTarget.reset();

    window.setTimeout(() => {
      submitButton.textContent = "Mesajı Göndər";
    }, 3000);
  });
};

const loadStoreData = async () => {
  try {
    const [hotDealsRows, playerPicksRows, storeRows] = await Promise.all([
      queryStoreRows(`
        SELECT p.*
        FROM store_products p
        ORDER BY p.id DESC
        LIMIT 16
      `),
      queryStoreRows(`
        SELECT p.*
        FROM store_products p
        JOIN product_placements pp ON pp.product_id = p.id
        WHERE pp.section = 'player_picks'
        ORDER BY pp.sort_order ASC
      `),
      queryStoreRows(`
        SELECT *
        FROM store_products
        ORDER BY sort_order ASC
      `),
    ]);

    state.hotDeals = hotDealsRows.length ? hotDealsRows.map(mapProductRow) : state.hotDeals;
    state.playerPicks = playerPicksRows.length ? playerPicksRows.map(mapProductRow) : state.playerPicks;
    state.storeProducts = storeRows.map(mapProductRow);
  } catch (error) {
    console.error("Failed to load store products from SQLite.", error);
  }
};

const restorePersistedState = () => {
  try {
    state.cookieAccepted = localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted";
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      const parsed = JSON.parse(storedCart);
      if (Array.isArray(parsed)) {
        state.cartItems = parsed;
      }
    }
  } catch (error) {
    console.error("Failed to restore local state.", error);
  } finally {
    state.cookieConsentReady = true;
  }
};

const bootstrap = async () => {
  const releaseSplash = () => {
    state.isAppLoading = false;
    renderApp(dom, state, siteData, toastItems);
    window.AOS?.init({
      duration: 400,
      easing: "ease-out",
      once: true,
      offset: 50,
      delay: 0,
      mirror: false,
    });
  };

  const splashTimer = window.setTimeout(releaseSplash, 3500);

  try {
    initResourceRepair();
    initEvents();
    initPointerGlow();
    initRevealObserver();
    initTranslations();
    restorePersistedState();
    renderApp(dom, state, siteData, toastItems);
    await loadStoreData();
    renderApp(dom, state, siteData, toastItems);
  } catch (error) {
    console.error("Bootstrap error:", error);
  } finally {
    if (state.isAppLoading) {
      window.clearTimeout(splashTimer);
      releaseSplash();
    }
  }
};

bootstrap();

// Region Stack (Flag Scatter) Logic
document.addEventListener("DOMContentLoaded", () => {
  const stack = document.getElementById("region-stack");
  if (!stack) return;

  stack.addEventListener("click", (e) => {
    e.stopPropagation();
    
    // If clicking a specific flag while expanded
    const flag = e.target.closest(".region-flag");
    if (flag && stack.classList.contains("is-expanded")) {
      stack.querySelectorAll(".region-flag").forEach(f => f.classList.remove("active"));
      flag.classList.add("active");
      
      const region = flag.dataset.region;
      console.log(`Region changed to: ${region}`);
      
      // Optional: Store region in localStorage
      localStorage.setItem("selected_region", region);
      
      // Collapse after selection
      setTimeout(() => stack.classList.remove("is-expanded"), 300);
      return;
    }

    // Toggle expansion
    stack.classList.toggle("is-expanded");
  });

  // Collapse on outside click
  document.addEventListener("click", (e) => {
    if (stack.classList.contains("is-expanded") && !stack.contains(e.target)) {
      stack.classList.remove("is-expanded");
    }
  });

  // Load saved region
  const savedRegion = localStorage.getItem("selected_region");
  if (savedRegion) {
    stack.querySelectorAll(".region-flag").forEach(f => {
      f.classList.toggle("active", f.dataset.region === savedRegion);
    });
  }
});
