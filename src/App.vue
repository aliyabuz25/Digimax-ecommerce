<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import TopNavbar from "./components/TopNavbar.vue";
import ContactSection from "./components/ContactSection.vue";
import ProductDetails from "./components/ProductDetails.vue";
import { mapProductRow, queryStoreRows } from "./lib/storeDb";

const COOKIE_CONSENT_KEY = "digimax-cookie-consent";
const CART_STORAGE_KEY = "digimax-cart-items";

const cookieAccepted = ref(false);
const cookieConsentReady = ref(false);
const activeCatalogTab = ref("");
const isCatalogLoading = ref(false);
const isAppLoading = ref(true);
const isContactView = ref(false);
const selectedProduct = ref(null);
const cartItems = ref([]);
const cartOpen = ref(false);
const flyingProducts = ref([]);
const catalogSearchQuery = ref("");
const toasts = ref([]);

const mouseX = ref(0);
const mouseY = ref(0);
const trailX = ref(0);
const trailY = ref(0);
const isCursorHovered = ref(false);

const updateCursor = (e) => {
  mouseX.value = e.clientX;
  mouseY.value = e.clientY;
  
  const target = e.target;
  if (!target || typeof target.closest !== 'function') return;
  isCursorHovered.value = !!target.closest('button, a, .nav-item, .product-card, .footer-links a, .result-add-btn');
};

const animateTrail = () => {
  trailX.value += (mouseX.value - trailX.value) * 0.15;
  trailY.value += (mouseY.value - trailY.value) * 0.15;
  requestAnimationFrame(animateTrail);
};

const showToast = (product) => {
  const toast = {
    id: Date.now(),
    title: product.title,
    image: product.image,
  };
  toasts.value.push(toast);
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== toast.id);
  }, 3000);
};

// Cart Calculations
const cartSubtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    const priceStr = item.price.replace(/[^\d.]/g, "");
    return sum + (parseFloat(priceStr) || 0);
  }, 0);
});

const cartTax = computed(() => cartSubtotal.value * 0.18); // 18% ƏDV for Azerbaijan
const cartTotal = computed(() => cartSubtotal.value + cartTax.value);

const recommendedForSelected = computed(() => {
  if (!selectedProduct.value) return [];
  // Get all unique products from all categories
  const allProds = Object.values(storeData.value).flat();
  // Filter for same platform/category if possible, or just others
  const others = allProds.filter(p => p.slug !== selectedProduct.value.slug);
  // Sort by some logic (random or relevance)
  return others.slice(0, 4);
});

// Watch for cart changes to persist in LocalStorage
watch(cartItems, (newVal) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newVal));
}, { deep: true });
const carouselRefs = ref({});
const bgVideoRef = ref(null);
const heroScrollDepth = ref(0);

const handleAddToCart = (product, event) => {
  // 1. Add to state
  cartItems.value.push(product);
  showToast(product);
  
  // 2. Trig animation
  const rect = event.target.getBoundingClientRect();
  const target = document.getElementById("main-cart-icon");
  const targetRect = target ? target.getBoundingClientRect() : { left: window.innerWidth - 100, top: 20 };

  const flyingItem = {
    id: Date.now(),
    image: product.image,
    start: { x: rect.left, y: rect.top },
    end: { x: targetRect.left, y: targetRect.top }
  };
  
  flyingProducts.value.push(flyingItem);
  
  // 3. Cleanup
  setTimeout(() => {
    flyingProducts.value = flyingProducts.value.filter(i => i.id !== flyingItem.id);
  }, 1000);
};

const handleRemoveFromCart = (index) => {
  cartItems.value.splice(index, 1);
};

const openProduct = (product) => {
  selectedProduct.value = product;
  window.scrollTo({ top: 0 });
};

const closeProduct = () => {
  selectedProduct.value = null;
  document.body.style.overflow = "";
};

const openContact = () => {
  selectedProduct.value = null;
  isContactView.value = true;
  activeCatalogTab.value = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const goHome = () => {
  selectedProduct.value = null;
  isContactView.value = false;
  activeCatalogTab.value = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// Scroll Lock for Overlays
const updateScrollLock = () => {
  const isLocked = isAppLoading.value || selectedProduct.value;
  if (isLocked) {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    if (selectedProduct.value) document.body.classList.add("modal-open");
  } else {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    document.body.classList.remove("modal-open");
  }
};

watch([isAppLoading, selectedProduct], updateScrollLock, { immediate: true });

const heroCoverGridItems = [
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/730/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/570/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1172470/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/578080/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/252490/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1716740/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/990080/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4000/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1151640/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1238810/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1238840/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1593500/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/105600/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1811260/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1053680/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/892970/library_600x900.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/381210/library_600x900.jpg"
];

const getRowItems = (row) => {
  const items = [...heroCoverGridItems];
  // Deterministic "shuffle" per row to ensure variety
  for (let i = items.length - 1; i > 0; i--) {
    const j = (row * 7 + i) % items.length;
    [items[i], items[j]] = [items[j], items[i]];
  }
  // Return enough items to cover the screen multiple times for the infinite loop
  return [...items, ...items, ...items];
};







const fallbackHotDeals = [
  {
    title: "Mortal Kombat 11 [PS4, PS5]",
    oldPrice: "1220 ₼",
    newPrice: "115 ₼",
    discount: "-91%",
    image: "/digimax_app_logo_icon.png",
  },
  {
    title: "Mafia: Trilogy [PS4]",
    oldPrice: "1305 ₼",
    newPrice: "255 ₼",
    discount: "-80%",
    image: "/digimax_app_logo_icon.png",
  },
  {
    title: "The Witcher 3: Wild Hunt [PS4, PS5]",
    oldPrice: "885 ₼",
    newPrice: "175 ₼",
    discount: "-80%",
    image: "/digimax_app_logo_icon.png",
  },
  {
    title: "Unravel Two [PS4]",
    oldPrice: "345 ₼",
    newPrice: "70 ₼",
    discount: "-80%",
    image: "/digimax_app_logo_icon.png",
  },
];

const fallbackPlayerPicks = [
  {
    title: "The Last of Us Part II Remastered",
    image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/library_600x900.jpg",
    action: "PlayStation",
    badge: "TRENDING",
    product_type: "ACTION",
  },
  {
    title: "God of War Ragnarök",
    image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1151640/library_600x900.jpg",
    action: "PlayStation",
    badge: "EXCLUSIVE",
    product_type: "ADVENTURE",
  },
  {
    title: "Cyberpunk 2077: Phantom Liberty",
    image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/library_600x900.jpg",
    action: "Xbox",
    badge: "POPULAR",
    product_type: "RPG",
  },
  {
    title: "Elden Ring: Shadow of the Erdtree",
    image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900.jpg",
    action: "PlayStation",
    badge: "BEST SELLER",
    product_type: "SOULSLIKE",
  },
  {
    title: "Spider-Man 2",
    image: "https://image.api.playstation.com/vulcan/ap/rnd/202306/1219/603921796d194517f95960485ad50fe967406a0da382e5ff.png",
    action: "PlayStation",
    badge: "TOP PICK",
    product_type: "ACTION",
  }
];

const hotDeals = ref(fallbackHotDeals);
const playerPicks = ref(fallbackPlayerPicks);
const storeProducts = ref([]);



const serviceHighlights = [
  {
    title: "Abunəliklər",
    copy: "PS Plus, Game Pass, EA Play və digər xidmətlər üçün vahid axın.",
    icon: "solar:play-stream-bold",
    action: "Servislər"
  },
  {
    title: "Oyun kataloqları",
    copy: "Sony və Xbox bölmələri üçün sürətli keçid və aydın struktur.",
    icon: "solar:widget-5-bold",
    action: "PlayStation"
  },
  {
    title: "Balans artırma",
    copy: "Steam, wallet və oyun içi valyuta məhsulları üçün ayrıca vitrın.",
    icon: "solar:wallet-money-bold",
    action: "Oyun Valyutası"
  },
];

const footerShopLinks = [
  {
    label: "Каталог Sony Турция",
    action: "PlayStation",
  },
  {
    label: "Каталог Sony Индия",
    action: "PlayStation",
  },
  {
    label: "Каталог Xbox",
    action: "Xbox",
  },
  {
    label: "Подписки",
    action: "Servislər",
  },
  {
    label: "Скидки",
    action: "PlayStation",
  },
  {
    label: "Корзина",
    action: "Servislər",
  },
];

const footerCustomerLinks = [
  { label: "Возвраты", href: "#" },
  { label: "Реквизиты", href: "#" },
  { label: "Политика конфиденциальности", href: "#" },
  { label: "Публичная оферта", href: "#" },
  { label: "Политика использования cookie", href: "#" },
];

const footerSocials = [
  {
    label: "Telegram",
    href: "#",
    icon: "simple-icons:telegram",
  },
  {
    label: "VK",
    href: "#",
    icon: "simple-icons:vk",
  },
  {
    label: "YouTube",
    href: "#",
    icon: "simple-icons:youtube",
  },
];

const footerPaymentBadges = ["logos:visa", "logos:mastercard", "logos:apple-pay", "logos:google-pay"];

const catalogTabs = {
  PlayStation: {
    eyebrow: "Sony catalog",
    title: "PlayStation oyun kataloqu",
    description: "PlayStation bölməsi üçün vahid kataloq görünüşü.",
    chips: ["PS5", "PS4", "PS Plus", "Sony Türkiyə", "Sony Azərbaycan", "Pre-order"],
    filters: ["Platforma", "Janr", "Endirim", "Naşir", "Dil", "Buraxılış tarixi"],
    banners: []
  },
  Xbox: {
    eyebrow: "Microsoft catalog",
    title: "Xbox oyun kataloqu",
    description: "Eyni layout Xbox tabı üçün də istifadə olunur.",
    chips: ["Series X|S", "Xbox One", "Game Pass", "EA Play", "Ubisoft+", "Gift Cards"],
    filters: ["Platforma", "Abunəlik", "Nəşriyyatçı", "Qiymət", "Buraxılış ili", "Region"],
    banners: []
  },
  "Servislər": {
    eyebrow: "Digital services",
    title: "Rəqəmsal servis kataloqu",
    description: "Abunəlik və servis məhsulları da eyni kataloq skeleti ilə açılır.",
    chips: ["Spotify", "Netflix", "ChatGPT", "Canva", "YouTube", "Discord Nitro"],
    filters: ["Kateqoriya", "Müddət", "Populyar", "Yeni", "Hədiyyə", "Bölgə"],
    banners: []
  },
  "Oyun Valyutası": {
    eyebrow: "Wallet & top-up",
    title: "Oyun valyutası kataloqu",
    description: "Balans artırma və oyun içi valyuta məhsulları üçün eyni səhifə sistemi tətbiq olunur.",
    chips: ["V-Bucks", "Steam Wallet", "PSN Wallet", "Xbox Gift", "Robux", "EA FC Points"],
    filters: ["Xidmət", "Nominal", "Region", "Aksiya", "Populyar", "Mövcudluq"],
    banners: []
  },
};

const activeCatalog = computed(
  () => catalogTabs[activeCatalogTab.value] || catalogTabs.PlayStation,
);
const isCatalogView = computed(() => Boolean(activeCatalogTab.value));
const filteredCatalogProducts = computed(() => {
  const query = catalogSearchQuery.value.trim().toLowerCase();
  const items = storeProducts.value.filter((item) => item.tab === activeCatalogTab.value);

  if (!query) return items;

  return items.filter((item) => {
    const haystack = [item.title, item.subtitle, item.platform, item.product_type, item.description]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
});

const openCatalogTab = (tab) => {
  isContactView.value = false;
  selectedProduct.value = null;
  activeCatalogTab.value = tab;
  catalogSearchQuery.value = "";
  if (tab) {
    isCatalogLoading.value = true;
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      isCatalogLoading.value = false;
    }, 1200); // 1.2s smooth ghost loading
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

const setCarouselRef = (key) => (element) => {
  if (element) {
    carouselRefs.value[key] = element;
  }
};

const scrollCarousel = (key, direction) => {
  const element = carouselRefs.value[key];
  if (!element) return;

  element.scrollBy({
    left: Math.max(element.clientWidth * 0.86, 280) * direction,
    behavior: "smooth",
  });
};

const handleHeroScroll = () => {
  const scroll = window.scrollY;
  heroScrollDepth.value = Math.min(scroll, 720);

  if (bgVideoRef.value && bgVideoRef.value.duration) {
    const progress = Math.min(scroll / 800, 1);
    bgVideoRef.value.currentTime = bgVideoRef.value.duration * progress;
  }

  // Button hue logic removed to support static white-theme buttons.
};

const acceptCookie = () => {
  cookieAccepted.value = true;
  localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
};

onMounted(async () => {
  window.addEventListener('mousemove', updateCursor);
  requestAnimationFrame(animateTrail);
  handleHeroScroll();
  window.addEventListener("scroll", handleHeroScroll, { passive: true });

  try {
    cookieAccepted.value = localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted";
  } catch (error) {
    console.error("Failed to read cookie consent state.", error);
  } finally {
    cookieConsentReady.value = true;
  }

  try {
    const [hotDealsRows, playerPicksRows, storeRows] = await Promise.all([
      queryStoreRows(`
        SELECT p.*
        FROM store_products p
        JOIN product_placements pp ON pp.product_id = p.id
        WHERE pp.section = 'hot_deals'
        ORDER BY pp.sort_order ASC
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

    hotDeals.value = hotDealsRows.map(mapProductRow);
    playerPicks.value = playerPicksRows.map(mapProductRow);
    storeProducts.value = storeRows.map(mapProductRow);

    // Initial Cart Load
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      try {
        const parsed = JSON.parse(storedCart);
        if (Array.isArray(parsed)) cartItems.value = parsed;
      } catch(e) {}
    }
  } catch (error) {
    console.error("Failed to load store products from SQLite.", error);
  }

  // Intersection Observer for Scroll Reveals
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in-view");
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".reveal-section").forEach(section => observer.observe(section));

  window.addEventListener('mousemove', updateCursor);
  requestAnimationFrame(animateTrail);

  // Finish Loading
  setTimeout(() => {
    isAppLoading.value = false;
    updateScrollLock();
  }, 3500);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleHeroScroll);
});
</script>

<template>
  <div class="shell min-h-screen antialiased">
    <!-- Product Detail Modal (Centered Premium Mode) -->
    <transition name="modal-bounce">
      <div v-if="selectedProduct" class="product-modal-backdrop" @click.self="closeProduct">
        <div class="product-modal-container">
          <ProductDetails 
            :product="selectedProduct" 
            :recommended-products="recommendedForSelected"
            @close="closeProduct"
            @add-to-cart="handleAddToCart($event.product, $event.event)"
            @open-product="openProduct"
          />
        </div>
      </div>
    </transition>

    <!-- Entire App Transition (Splash to Content) -->
    <transition name="splash-fade" mode="out-in">
      <div v-if="isAppLoading" key="splash" class="app-splash">
        <div class="splash-inner">
          <img src="/digimax_app_logo_icon.png" class="splash-logo" />
          <div class="splash-loader-bar">
            <div class="splash-loader-fill"></div>
          </div>
        </div>
      </div>

      <div v-else key="content" class="app-main-content">
        <TopNavbar
          :active-primary-tab="activeCatalogTab"
          :cart-items="cartItems"
          :cart-open="cartOpen"
          :cart-subtotal="cartSubtotal"
          :cart-tax="cartTax"
          :cart-total="cartTotal"
          @go-home="goHome"
          @select-primary="openCatalogTab"
          @toggle-cart="cartOpen = $event"
          @remove-item="handleRemoveFromCart"
          @add-item="handleAddToCart($event.product, $event.event)"
          @contact-clicked="openContact"
          @open-product="openProduct"
        />

        <main class="page-content">
          <div v-if="isContactView" class="contact-view">
            <ContactSection />
          </div>

          <div v-else class="store-view">

    <section v-if="isCatalogView" class="catalog-shell" data-aos="fade-up" data-aos-delay="20">
      <div class="catalog-shell__inner mx-auto max-w-[1280px]">
        <div class="catalog-shell__intro">
          <div>
            <p class="catalog-shell__eyebrow">{{ activeCatalog.eyebrow }}</p>
            <h2 class="catalog-shell__title">{{ activeCatalog.title }}</h2>
          </div>
          <p class="catalog-shell__copy">
            {{ activeCatalog.description }}
          </p>
        </div>

        <div class="catalog-shell__hero">
          <article
            v-for="banner in activeCatalog.banners"
            :key="`${activeCatalog.title}-${banner.title}`"
            class="catalog-banner"
            :style="{ backgroundImage: `linear-gradient(180deg, rgba(7, 10, 18, 0.08), rgba(7, 10, 18, 0.42)), url(${banner.image})` }"
          >
            <span class="catalog-banner__label">{{ banner.title }}</span>
            <strong class="catalog-banner__subtitle">{{ banner.subtitle }}</strong>
          </article>
        </div>

        <div class="catalog-shell__chips">
          <button
            v-for="chip in activeCatalog.chips"
            :key="chip"
            class="catalog-chip"
            type="button"
          >
            {{ chip }}
          </button>
        </div>

        <div class="catalog-layout">
          <aside class="catalog-sidebar">
            <div class="catalog-sidebar__head">
              <span>Filtrlər</span>
              <button type="button">Sıfırla</button>
            </div>

            <button
              v-for="filter in activeCatalog.filters"
              :key="filter"
              class="catalog-filter"
              type="button"
            >
              <span>{{ filter }}</span>
              <span>+</span>
            </button>
          </aside>

          <div class="catalog-main">
            <div class="catalog-toolbar">
              <label class="catalog-search">
                <span>Axtar</span>
                <input
                  v-model="catalogSearchQuery"
                  type="text"
                  placeholder="Bu bölmədə məhsul axtarın"
                />
              </label>

              <div class="catalog-toolbar__meta">
                <span>{{ filteredCatalogProducts.length }} məhsul</span>
                <button type="button">Populyarlığa görə</button>
                <div v-if="filteredCatalogProducts.length" class="carousel-controls carousel-controls--compact">
                  <button class="carousel-control" type="button" @click="scrollCarousel('catalog', -1)">
                    ←
                  </button>
                  <button class="carousel-control" type="button" @click="scrollCarousel('catalog', 1)">
                    →
                  </button>
                </div>
              </div>
            </div>

            <div
              v-if="isCatalogLoading"
              class="catalog-products catalog-products--skeleton"
            >
              <div v-for="i in 4" :key="i" class="catalog-product-skeleton">
                <div class="skeleton-media"></div>
                <div class="skeleton-line skeleton-title"></div>
                <div class="skeleton-line skeleton-price"></div>
                <div class="skeleton-button"></div>
              </div>
            </div>

            <div
              v-else-if="filteredCatalogProducts.length"
              ref="setCarouselRef('catalog')"
              class="catalog-products product-carousel"
              v-auto-animate
            >
              <article
                v-for="product in filteredCatalogProducts"
                :key="product.slug"
                class="catalog-product product-card-hover"
                @click="openProduct(product)"
              >
                <div
                  class="catalog-product__media"
                  :style="{ backgroundImage: `url(${product.image})` }"
                ></div>

                <div class="catalog-product__body">
                  <div class="catalog-product__meta">
                    <span class="catalog-product__badge">{{ product.badge || product.product_type }}</span>
                    <span class="catalog-product__platform">{{ product.platform }}</span>
                  </div>

                  <h3 class="catalog-product__title">{{ product.title }}</h3>
                  <p v-if="product.subtitle" class="catalog-product__subtitle">{{ product.subtitle }}</p>

                  <div class="catalog-product__pricing">
                    <span v-if="product.oldPrice" class="deal-card__old">{{ product.oldPrice }}</span>
                    <span class="catalog-product__price">{{ product.price }}</span>
                    <span v-if="product.discount" class="deal-card__discount">{{ product.discount }}</span>
                  </div>

                  <button class="catalog-product__button" type="button" @click.stop="handleAddToCart(product, $event)">{{ product.cta }}</button>
                </div>
              </article>
            </div>

            <div v-else class="catalog-empty">
              <span class="catalog-empty__badge">{{ activeCatalogTab }}</span>
              <h3 class="catalog-empty__title">Sorğuya uyğun məhsul tapılmadı</h3>
              <p class="catalog-empty__copy">
                Axtarış və ya filtr nəticəsində uyğun məhsul görünmür. Sorğunu dəyişib yenidən
                yoxlayın.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <main v-else class="hero-stage">
      <div class="hero-cover-grid" aria-hidden="true">
        <div class="hero-cover-grid__inner">
          <div v-for="row in 5" :key="row" :class="['hero-cover-row', `hero-cover-row--${row}`]">
            <div
              v-for="(img, idx) in getRowItems(row)"
              :key="`${row}-${idx}`"
              class="hero-cover-item"
              :style="img ? { backgroundImage: `url(${img})`, animationDelay: `-${row * 3}s` } : {}"
            ></div>
          </div>
        </div>
        <div class="hero-cover-grid__overlay"></div>
      </div>

      <section class="hero-showcase mx-auto max-w-[1320px]">
        <div class="hero-showcase__grid"></div>




        <div class="hero-showcase__content">
          <p class="hero-showcase__eyebrow">Digital storefront for console players</p>
          <h1 class="hero-showcase__title">
            Sony və Xbox oyunlarını və abunəliklərini limitsiz şəkildə əldə edin
          </h1>
          <p class="hero-showcase__copy">
            Digimax-a güvənən istifadəçilərə qoşulun. PlayStation, Xbox və rəqəmsal xidmətlər
            üçün daha sürətli, rahat və təhlükəsiz alış təcrübəsi əldə edin.
          </p>

          <div class="hero-showcase__actions">
            <button class="hero-cta hero-cta--accent btn-sketch" type="button" @click="openCatalogTab('PlayStation')">
              Sony Türkiyə Kataloqu
            </button>
            <button class="hero-cta hero-cta--accent btn-sketch" type="button" @click="openCatalogTab('PlayStation')">
              Sony Azərbaycan Kataloqu
            </button>
            <button class="hero-cta hero-cta--light btn-sketch" type="button" @click="openCatalogTab('Xbox')">
              Xbox Kataloqu
            </button>
          </div>

        </div>


      </section>
    </main>

    <section v-if="!isCatalogView" class="deals-section reveal-section" data-aos="fade-up" data-aos-delay="20">
      <div class="deals-section__inner">
        <div class="section-heading" data-aos="fade-up">
          <div>
            <p class="section-heading__eyebrow">Fresh drops</p>
            <h2 class="deals-section__title">İsti Endirimlər</h2>
          </div>
          <p class="section-heading__copy">
            Referans səviyyəsində daha güclü məhsul vitrini üçün kartları daha oxunaqlı və
            satış yönümlü qurduq.
          </p>
          <div class="carousel-controls">
            <button class="carousel-control" type="button" @click="scrollCarousel('deals', -1)">
              ←
            </button>
            <button class="carousel-control" type="button" @click="scrollCarousel('deals', 1)">
              →
            </button>
          </div>
        </div>

        <div ref="setCarouselRef('deals')" class="deals-grid product-carousel" v-auto-animate>
          <article
            v-for="deal in hotDeals"
            :key="deal.title"
            class="deal-card product-card-hover"
            data-aos="fade-up"
            data-aos-anchor-placement="top-bottom"
            @click="openProduct(deal)"
          >
            <div class="deal-card__media" :style="{ backgroundImage: `url(${deal.image})` }"></div>

            <div class="deal-card__body">
              <div class="deal-card__meta">
                <span class="deal-card__pill">{{ deal.badge || "Endirim" }}</span>
                <span class="deal-card__platform">{{ deal.platform }}</span>
              </div>
              <h3 class="deal-card__title">{{ deal.title }}</h3>

              <div class="deal-card__pricing">
                <span class="deal-card__old">{{ deal.oldPrice }}</span>
                <span class="deal-card__new">{{ deal.newPrice }}</span>
                <span class="deal-card__discount">{{ deal.discount }}</span>
              </div>

              <button class="deal-card__button btn-sketch" type="button">Kataloqa bax</button>
            </div>
          </article>
        </div>

        <div class="deals-dots">
          <span class="deals-dots__dot is-active"></span>
          <span class="deals-dots__dot"></span>
          <span class="deals-dots__dot"></span>
        </div>
      </div>
    </section>

    <section v-if="!isCatalogView" class="picks-section section-divider reveal-section" data-aos="fade-up">
      <div class="doodle-float doodle-star doodle-float--1"></div>
      <div class="doodle-float doodle-smile doodle-float--2"></div>
      <div class="doodle-float doodle-star doodle-float--3"></div>
      <div class="picks-section__inner">
        <div class="section-heading" data-aos="fade-up">
          <div>
            <p class="section-heading__eyebrow">Most wanted</p>
            <h2 class="picks-section__title">Oyunçuların Seçimi</h2>
          </div>
          <p class="section-heading__copy">
            Ən çox diqqət çəkən məhsulları daha premium kart sistemi ilə önə çıxardıq.
          </p>
          <div class="carousel-controls">
            <button class="carousel-control" type="button" @click="scrollCarousel('picks', -1)">
              ←
            </button>
            <button class="carousel-control" type="button" @click="scrollCarousel('picks', 1)">
              →
            </button>
          </div>
        </div>

        <div ref="setCarouselRef('picks')" class="picks-grid product-carousel" v-auto-animate>
          <article
            v-for="item in playerPicks"
            :key="item.title"
            class="pick-card is-poster product-card-hover"
            data-aos="fade-up"
            data-aos-anchor-placement="top-bottom"
            @click="openProduct(item)"
          >
            <div class="pick-card__media" :style="{ backgroundImage: `url(${item.image})` }">
            </div>

            <div class="pick-card__body">
              <div class="pick-card__header">
                <span v-if="item.badge" class="pick-tag">{{ item.badge }}</span>
                <span v-if="item.product_type" class="pick-type">{{ item.product_type }}</span>
              </div>
              
              <h3 class="pick-card__title">{{ item.title }}</h3>
            </div>
          </article>
        </div>

        <div class="picks-section__action" data-aos="fade-up" data-aos-delay="80">
          <button class="picks-section__catalog btn-sketch" type="button" @click="openCatalogTab('PlayStation')">
            Oyun kataloquna keç
          </button>
        </div>
      </div>
    </section>

    <section v-if="!isCatalogView" class="services-section section-divider reveal-section" data-aos="fade-up">
      <div class="doodle-float doodle-star doodle-float--1"></div>
      <div class="doodle-float doodle-smile doodle-float--2"></div>
      <div class="services-section__inner">
        <div class="section-heading">
          <div>
            <p class="section-heading__eyebrow">Store Architecture</p>
            <h2 class="picks-section__title">Platforma blokları</h2>
          </div>
          <p class="section-heading__copy">
            Aydın blok quruluşu, daha sakit və təmiz Digimax vizual dili ilə təqdim olunur.
          </p>
        </div>

        <div class="services-grid">
          <article
            v-for="item in serviceHighlights"
            :key="item.title"
            class="service-card is-clickable"
            @click="openCatalogTab(item.action)"
          >
            <div class="service-card__icon-wrapper">
              <span class="service-card__icon">
                <iconify-icon :icon="item.icon"></iconify-icon>
              </span>
              <div class="service-card__glow"></div>
            </div>
            <h3 class="service-card__title">{{ item.title }}</h3>
            <p class="service-card__copy">{{ item.copy }}</p>
            <div class="service-card__action">
              <span>Keçid et</span>
              <iconify-icon icon="solar:arrow-right-linear"></iconify-icon>
            </div>
          </article>
        </div>
      </div>
    </section>

    <aside
      v-if="cookieConsentReady && !cookieAccepted"
      class="cookie-widget"
      role="dialog"
      aria-live="polite"
      aria-label="Cookie razılığı"
    >
      <img
        class="cookie-widget__logo"
        src="/digimax_app_logo_icon.png"
        alt="Digimax logo"
      />

      <div class="cookie-widget__text">
        "Qəbul et" düyməsinə basaraq
        <a href="#" target="_blank" rel="noreferrer">
          cookie istifadəsi şərtləri
        </a>
        ilə razılaşmış olursunuz.
      </div>

      <button class="cookie-widget__button" @click="acceptCookie">
        Qəbul et
      </button>
    </aside>

          </div> <!-- end store-view -->
        </main> <!-- end page-content -->
      </div> <!-- end content div -->
    </transition>

    <footer class="site-footer">
      <div class="footer-trust">
        <div class="footer-trust__inner container">
          <div class="trust-item">
            <div class="trust-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L3 7v9c0 5 9 6 9 6s9-1 9-6V7l-9-5z"/></svg></div>
            <div class="trust-text">
              <h4>Güvənli Ödəniş</h4>
              <p>Məlumatlarınız tam qorunur</p>
            </div>
          </div>
          <div class="trust-item">
            <div class="trust-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div>
            <div class="trust-text">
              <h4>Anında Çatdırılma</h4>
              <p>2 saniyə ərzində poçtunuzda</p>
            </div>
          </div>
          <div class="trust-item">
            <div class="trust-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
            <div class="trust-text">
              <h4>7/24 Dəstək</h4>
              <p>Hər an yanınızdayıq</p>
            </div>
          </div>
        </div>
      </div>

      <div class="footer-main">
        <div class="footer-grid container">
          <div class="footer-col brand-col">
            <img src="/digimax_app_logo_icon.png" alt="Digimax" class="footer-logo" />
            <p class="footer-bio">
              Azərbaycanın ən etibarlı rəqəmsal mağazası. Populyar oyun və xidmətlərə anında giriş təmin edirik.
            </p>
            <div class="social-links">
              <a href="#" class="social-btn"><iconify-icon icon="line-md:instagram"></iconify-icon></a>
              <a href="#" class="social-btn"><iconify-icon icon="line-md:telegram"></iconify-icon></a>
              <a href="#" class="social-btn"><iconify-icon icon="line-md:youtube"></iconify-icon></a>
            </div>
          </div>

          <div class="footer-col">
            <h3 class="footer-title">Kategoriyalar</h3>
            <ul class="footer-links">
              <li><a href="#" @click.prevent="openCatalogTab('PlayStation')">PlayStation</a></li>
              <li><a href="#" @click.prevent="openCatalogTab('Xbox')">Xbox</a></li>
              <li><a href="#" @click.prevent="openCatalogTab('Servisler')">Subskripsiyalar</a></li>
              <li><a href="#" @click.prevent="openCatalogTab('Valyuta')">Oyun Valyutası</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h3 class="footer-title">Dəstək</h3>
            <ul class="footer-links">
              <li><a href="#">Necə almalı?</a></li>
              <li><a href="#">Tez-tez verilən suallar</a></li>
              <li><a href="#">Geri qaytarma</a></li>
              <li><a href="#">Əlaqə</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h3 class="footer-title">Hüquqi</h3>
            <ul class="footer-links">
              <li><a href="#">İstifadə şərtləri</a></li>
              <li><a href="#">Məxfilik siyasəti</a></li>
              <li><a href="#">FAQ</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="bottom-inner container">
          <div class="copyright">© {{ new Date().getFullYear() }} Digimax Store. Bütün hüquqlar qorunur.</div>
          <div class="payment-methods">
            <span class="pm-badge">VISA</span>
            <span class="pm-badge">MASTERCARD</span>
            <span class="pm-badge">MAESTRO</span>
            <span class="pm-badge">APPLE PAY</span>
            <span class="pm-badge">GOOGLE PAY</span>
          </div>
        </div>
      </div>
    </footer>

    <!-- Fly to cart animation container -->
    <div class="flying-container">
      <div
        v-for="item in flyingProducts"
        :key="item.id"
        class="flying-product"
        :style="{
          '--start-x': item.start.x + 'px',
          '--start-y': item.start.y + 'px',
          '--end-x': item.end.x + 'px',
          '--end-y': item.end.y + 'px',
          'background-image': `url(${item.image})`
        }"
      ></div>
    </div>

    <!-- Toast Notifications -->
    <div class="toast-container">
      <transition-group name="toast">
        <div v-for="toast in toasts" :key="toast.id" class="toast-box">
          <div class="toast-img" :style="{ backgroundImage: `url(${toast.image})` }"></div>
          <div class="toast-body">
            <h5 class="toast-title">Səbətə əlavə edildi</h5>
            <p class="toast-msg">{{ toast.title }}</p>
          </div>
          <iconify-icon icon="solar:check-circle-bold" class="toast-icon"></iconify-icon>
        </div>
      </transition-group>
    </div>



    <!-- Custom Cursor -->
    <div class="custom-cursor-wrapper">
      <div class="cursor-dot" :style="{ transform: `translate3d(${mouseX}px, ${mouseY}px, 0)` }"></div>
      <div class="cursor-trail" 
           :class="{ 'is-hover': isCursorHovered }"
           :style="{ transform: `translate3d(${trailX}px, ${trailY}px, 0)` }">
      </div>
    </div>
  </div> <!-- end shell -->
</template>
