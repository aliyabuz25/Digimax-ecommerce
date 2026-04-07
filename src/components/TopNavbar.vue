<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { mapProductRow, queryStoreRows } from "../lib/storeDb";

defineProps({
  activePrimaryTab: {
    type: String,
    default: "",
  },
  cartItems: {
    type: Array,
    default: () => [],
  },
  cartOpen: {
    type: Boolean,
    default: false,
  },
  cartSubtotal: { type: Number, default: 0 },
  cartTax: { type: Number, default: 0 },
  cartTotal: { type: Number, default: 0 },
});

const emit = defineEmits(["go-home", "select-primary", "toggle-cart", "remove-item", "add-item", "contact-clicked", "open-product"]);

const formatPrice = (val) => val.toFixed(2) + " ₼";

const isScrolled = ref(false);
const mobileOpen = ref(false);
const searchOpen = ref(false);
const searchQuery = ref("");
const searchResults = ref([]);
const isSearching = ref(false);

import { watch } from "vue";
watch(searchQuery, async (newVal) => {
  if (!newVal.trim() || newVal.length < 2) {
    searchResults.value = [];
    return;
  }
  isSearching.value = true;
  try {
    // Search both title and description/subtitle
    const query = `SELECT * FROM store_products WHERE title LIKE '%${newVal}%' OR subtitle LIKE '%${newVal}%' LIMIT 8`;
    const rows = await queryStoreRows(query);
    searchResults.value = rows.map(mapProductRow);
  } catch (e) {
    console.error("Search error:", e);
  } finally {
    isSearching.value = false;
  }
});

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20;
};

const navigation = [
  { 
    label: "PlayStation", 
    action: "PlayStation",
    icon: `<svg width="19" height="15" viewBox="0 0 19 15" fill="currentColor"><path d="M18.8316 11.4803C18.4603 11.9594 17.5509 12.3009 17.5509 12.3009L10.7868 14.7865V12.9529L15.7649 11.1379C16.3297 10.9315 16.416 10.6385 15.9574 10.485C15.4989 10.3315 14.6689 10.3747 14.1032 10.5829L10.7868 11.7776V9.87618L10.9777 9.80912C10.9777 9.80912 11.9363 9.46235 13.2836 9.30971C14.6318 9.15794 16.2822 9.33088 17.5776 9.83294C19.0372 10.305 19.2013 11.0012 18.8316 11.4803ZM11.4302 8.35853V3.67235C11.4302 3.12176 11.3309 2.61529 10.8257 2.47235C10.4397 2.34529 10.1996 2.71235 10.1996 3.26206V15L7.10514 13.995V0C8.42046 0.249706 10.3377 0.840882 11.3681 1.19559C13.9892 2.11588 14.8779 3.26206 14.8779 5.84294C14.8779 8.35853 13.3596 9.31147 11.4302 8.35853ZM1.42671 12.7624C-0.072566 12.33 -0.322158 11.43 0.360981 10.9121C0.992301 10.4338 2.06667 10.0738 2.06667 10.0738L6.50405 8.45912V10.2997L3.31031 11.4688C2.74635 11.6753 2.65999 11.9682 3.11772 12.1218C3.57717 12.2762 4.40713 12.2321 4.97195 12.0247L6.50405 11.4565V13.1021L6.19832 13.155C4.66622 13.4109 3.03481 13.3041 1.42671 12.7624Z"/></svg>` 
  },
  { 
    label: "Xbox", 
    action: "Xbox",
    icon: `<svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor"><path d="M2.56501 13.146C3.93002 14.3432 5.68435 15.0023 7.5 15C9.31681 15.0025 11.0724 14.3435 12.4387 13.146C13.6117 11.9505 9.741 7.7025 7.5 6.00975C5.26125 7.7025 1.38751 11.9505 2.56351 13.146M9.5385 4.14225C11.1007 5.9925 14.2155 10.5877 13.3357 12.2122C14.4153 10.8799 15.003 9.21632 15 7.5015C15.0013 6.50862 14.8046 5.52545 14.4215 4.60946C14.0384 3.69348 13.4765 2.86306 12.7687 2.16675C12.7687 2.16675 12.7515 2.15325 12.7177 2.1405C12.6613 2.12109 12.6019 2.11145 12.5422 2.112C12.1717 2.112 11.301 2.38425 9.5385 4.14225ZM2.28376 2.14125C2.24776 2.154 2.23276 2.16675 2.22976 2.1675C1.52224 2.86393 0.96065 3.69441 0.577801 4.61039C0.194952 5.52637 -0.0014729 6.50948 8.31521e-06 7.50225C8.31521e-06 9.2865 0.624008 10.923 1.66276 12.2107C0.788257 10.5825 3.90075 5.991 5.46375 4.14225C3.70125 2.3835 2.829 2.1135 2.46001 2.1135C2.40014 2.11147 2.34048 2.12142 2.28451 2.14275L2.28376 2.14125ZM7.5 2.21925C7.5 2.21925 5.6595 1.14225 4.2225 1.09125C3.65775 1.071 3.31275 1.27575 3.2715 1.30275C4.6125 0.40425 6.0375 0 7.491 0H7.5C8.95875 0 10.3785 0.4035 11.7285 1.30275C11.6865 1.27425 11.3445 1.07025 10.779 1.09125C9.34125 1.14225 7.5 2.21625 7.5 2.21625V2.21925Z"/></svg>`
  },
  { 
    label: "Servislər", 
    action: "Servislər",
    icon: `<svg width="13" height="14" viewBox="0 0 13 14" fill="currentColor"><path d="M2.52778 0H10.4722C10.5843 0 10.6949 0.0253015 10.7952 0.0739009C10.8955 0.1225 10.9827 0.193063 11.05 0.28L13 2.8V13.3C13 13.4857 12.9239 13.6637 12.7885 13.795C12.653 13.9263 12.4693 14 12.2778 14H0.722222C0.530677 14 0.346977 13.9263 0.211534 13.795C0.076091 13.6637 0 13.4857 0 13.3V2.8L1.95 0.28C2.01727 0.193063 2.10451 0.1225 2.20479 0.0739009C2.30507 0.0253015 2.41566 0 2.52778 0ZM11.1944 2.8L10.1111 1.4H2.88889L1.80556 2.8H11.1944ZM4.33333 5.6H2.88889V7C2.88889 7.92826 3.26934 8.8185 3.94656 9.47487C4.62377 10.1313 5.54227 10.5 6.5 10.5C7.45773 10.5 8.37623 10.1313 9.05344 9.47487C9.73066 8.8185 10.1111 7.92826 10.1111 7V5.6H8.66667V7C8.66667 7.55695 8.43839 8.0911 8.03206 8.48492C7.62574 8.87875 7.07464 9.1 6.5 9.1C5.92536 9.1 5.37426 8.87875 4.96794 8.48492C4.56161 8.0911 4.33333 7.55695 4.33333 7V5.6Z"/></svg>`
  },
  { 
    label: "Valyuta", 
    action: "Oyun Valyutası",
    icon: `<svg width="14" height="14" viewBox="0 0 401.601 401.6" fill="currentColor"><path d="M116.682,229.329c11.286,0,22.195-0.729,32.518-2.086V114.094c-10.322-1.356-21.232-2.085-32.518-2.085 c-64.441,0-116.681,23.693-116.681,52.921v11.477C0.001,205.634,52.241,229.329,116.682,229.329z"/><path d="M116.682,288.411c11.286,0,22.195-0.729,32.518-2.084v-33.166c-10.325,1.356-21.229,2.095-32.518,2.095 c-56.25,0-103.199-18.054-114.227-42.082c-1.606,3.5-2.454,7.124-2.454,10.839v11.477 C0.001,264.718,52.241,288.411,116.682,288.411z"/><path d="M149.199,314.823v-2.578c-10.325,1.356-21.229,2.095-32.518,2.095c-56.25,0-103.199-18.054-114.227-42.082 C0.848,275.757,0,279.381,0,283.096v11.477c0,29.229,52.24,52.922,116.681,52.922c12.887,0,25.282-0.95,36.873-2.7 c-2.873-5.877-4.355-12.075-4.355-18.496V314.823z"/><path d="M284.92,22.379c-64.441,0-116.681,23.693-116.681,52.921v11.477c0,29.228,52.24,52.921,116.681,52.921 c64.44,0,116.681-23.693,116.681-52.921V75.3C401.601,46.072,349.36,22.379,284.92,22.379z"/><path d="M284.92,165.626c-56.25,0-103.199-18.053-114.227-42.082c-1.606,3.499-2.454,7.123-2.454,10.839v11.477 c0,29.228,52.24,52.921,116.681,52.921c64.44,0,116.681-23.693,116.681-52.921v-11.477c0-3.716-0.848-7.34-2.454-10.839 C388.119,147.573,341.17,165.626,284.92,165.626z"/><path d="M284.92,224.71c-56.25,0-103.199-18.054-114.227-42.082c-1.606,3.499-2.454,7.123-2.454,10.839v11.477 c0,29.229,52.24,52.922,116.681,52.922c64.44,0,116.681-23.693,116.681-52.922v-11.477c0-3.716-0.848-7.34-2.454-10.839 C388.119,206.657,341.17,224.71,284.92,224.71z"/><path d="M284.92,286.983c-56.25,0-103.199-18.054-114.227-42.082c-1.606,3.5-2.454,7.123-2.454,10.838v11.478 c0,29.228,52.24,52.921,116.681,52.921c64.44,0,116.681-23.693,116.681-52.921v-11.478c0-3.715-0.848-7.34-2.454-10.838 C388.119,268.928,341.17,286.983,284.92,286.983z"/><path d="M284.92,346.066c-56.25,0-103.199-18.053-114.227-42.081c-1.606,3.5-2.454,7.125-2.454,10.838V326.3 c0,29.228,52.24,52.921,116.681,52.921c64.44,0,116.681-23.693,116.681-52.921v-11.478c0-3.715-0.848-7.34-2.454-10.838 C388.119,328.012,341.17,346.066,284.92,346.066z"/></svg>`
  },
  { 
    label: "Əlaqə", 
    action: "contact",
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`
  }
];

const subHeaderLinks = [
  { label: "Sale", action: "PlayStation", type: "sale" },
  { label: "Sony Türkiyə Oyun Kataloqu", action: "PlayStation" },
  { label: "Sony Azərbaycan Oyun Kataloqu", action: "PlayStation" },
  { label: "Steam", action: "Servislər" },
  { label: "Spotify", action: "Servislər" },
  { label: "ChatGPT", action: "Servislər" }
];

const handleSelect = (action) => {
  if (action === "contact") {
    emit("contact-clicked");
    mobileOpen.value = false;
    return;
  }
  emit("select-primary", action);
  mobileOpen.value = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

onMounted(async () => {
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  // GTranslate Settings
  window.gtranslateSettings = {
    "default_language": "az",
    "languages": ["az", "ru", "tr", "en"],
    "wrapper_selector": ".gtranslate_wrapper"
  };

  // Inject GTranslate Flags Script (Only once)
  if (!document.getElementById("gtranslate-script")) {
    const glScript = document.createElement("script");
    glScript.id = "gtranslate-script";
    glScript.src = "https://cdn.gtranslate.net/widgets/latest/flags.js";
    glScript.defer = true;
    document.body.appendChild(glScript);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<template>
  <header :class="['header-root', { 'is-sticky': isScrolled }]">
    <!-- Main Navbar Row -->
    <div class="navbar-main">
      <div class="navbar-container">
        <div class="navbar-inner">
          
          <!-- Logo & Navigation (Left) -->
          <div class="navbar-left">
            <a href="/" class="logo-link" @click.prevent="emit('go-home')">
              <img src="/digimax_app_logo_icon.png" alt="Digimax" class="logo-img" />
            </a>

            <nav class="desktop-only">
              <ul class="nav-menu">
                <li 
                  v-for="item in navigation" 
                  :key="item.label"
                  :class="['nav-item', { 'active': activePrimaryTab === item.action }]"
                  @click="handleSelect(item.action)"
                >
                  <span class="nav-icon" v-html="item.icon"></span>
                  <span class="nav-label">{{ item.label }}</span>
                </li>
              </ul>
            </nav>
          </div>

          <!-- Actions (Right) -->
          <div class="navbar-right">
            <div class="gtranslate_wrapper desktop-only"></div>

            <button class="icon-btn desktop-only" aria-label="Search" @click="searchOpen = true">
              <img src="https://gamepropaganda.com/wp-content/uploads/2024/04/Vector-5.svg" class="svg-icon" />
            </button>


            <div class="cart-wrapper desktop-only" @click="emit('toggle-cart', true)">
              <button id="main-cart-icon" class="icon-btn" aria-label="Cart">
                <svg viewBox="0 0 32 32" class="svg-icon stroke-mode"><circle cx="12.667" cy="24.667" r="2"/><circle cx="23.333" cy="24.667" r="2"/><path d="M9.285 10.036a1 1 0 0 1 .776-.37h15.272a1 1 0 0 1 .99 1.142l-1.333 9.333A1 1 0 0 1 24 21H12a1 1 0 0 1-.98-.797L9.083 10.87a1 1 0 0 1 .203-.834m2.005 1.63L12.814 19h10.319l1.047-7.333z"/><path d="M5.667 6.667a1 1 0 0 1 1-1h2.666a1 1 0 0 1 .984.82l.727 4a1 1 0 1 1-1.967.359l-.578-3.18H6.667a1 1 0 0 1-1-1"/></svg>
                <transition name="scale">
                  <span v-if="cartItems.length" class="cart-badge">{{ cartItems.length }}</span>
                </transition>
              </button>
            </div>

            <button class="burger-btn mobile-only" @click="mobileOpen = !mobileOpen">
              <img src="https://gamepropaganda.com/wp-content/uploads/2025/09/Frame-1948756238-1.svg" />
            </button>
          </div>

        </div>
      </div>
    </div>

    <!-- Subheader Row -->
    <div class="navbar-sub">
      <div class="navbar-container">
        <div class="sub-menu">
          <a 
            v-for="link in subHeaderLinks" 
            :key="link.label" 
            href="#" 
            :class="['sub-link', { 'is-sale': link.type === 'sale' }]"
            @click.prevent="handleSelect(link.action)"
          >
            {{ link.label }}
          </a>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <transition name="fade">
      <div v-if="searchOpen" class="modal-overlay" @click.self="searchOpen = false">
        <div class="search-modal">
          <div class="search-input-wrapper">
            <input v-model="searchQuery" type="text" placeholder="Məhsul axtar..." autofocus />
            <div v-if="isSearching" class="search-loader"></div>
          </div>
          
          <button class="search-close-btn" @click="searchOpen = false">
            <iconify-icon icon="solar:close-circle-bold-duotone"></iconify-icon>
          </button>

          <!-- Search Results -->
          <div v-if="searchQuery.length >= 2" class="search-results-container">
            <div v-if="searchResults.length" class="search-results-grid" v-auto-animate>
              <div v-for="product in searchResults" :key="product.id" class="search-result-card" @click="emit('open-product', product); searchOpen = false;">
                <div class="result-img" :style="{ backgroundImage: `url(${product.image})` }"></div>
                <div class="result-content">
                  <h4>{{ product.title }}</h4>
                  <p>{{ product.price }}</p>
                </div>
                <button class="result-add-btn" @click.stop="emit('add-item', {product, event: $event})">
                  <iconify-icon icon="solar:cart-plus-bold"></iconify-icon>
                </button>
              </div>
            </div>
            <div v-else-if="!isSearching" class="no-results">
              <p>"{{ searchQuery }}" üçün nəticə tapılmadı.</p>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <transition name="drawer">
      <div v-if="cartOpen" class="modal-overlay" @click.self="emit('toggle-cart', false)">
        <div class="cart-drawer">
          <div class="drawer-header">
            <h3>Mənim səbətim</h3>
            <button class="drawer-close" @click="emit('toggle-cart', false)">×</button>
          </div>
          <div class="drawer-body" v-auto-animate>
            <div v-for="(item, idx) in cartItems" :key="item.id + '-' + idx" class="cart-item" @click="emit('open-product', item); emit('toggle-cart', false);">
              <div class="item-img" :style="{ backgroundImage: `url(${item.image})` }"></div>
              <div class="item-info">
                <h4>{{ item.title }}</h4>
                <p>{{ item.price }}</p>
              </div>
              <button class="item-remove" @click="emit('remove-item', idx)">
                <iconify-icon icon="solar:trash-bin-trash-bold"></iconify-icon>
              </button>
            </div>
            
            <div v-if="!cartItems.length" class="empty-cart">
              <iconify-icon icon="solar:cart-large-minimalistic-bold-duotone" class="empty-icon"></iconify-icon>
              <p>Səbətiniz hələ ki boşdur.</p>
              <button class="empty-btn" @click="emit('toggle-cart', false)">Alış-verişə davam et</button>
            </div>
          </div>

          <div v-if="cartItems.length" class="drawer-footer">
            <div class="cart-breakdown">
              <div class="breakdown-row">
                <span>Cəmi:</span>
                <span>{{ formatPrice(cartSubtotal) }}</span>
              </div>
              <div class="breakdown-row">
                <span>ƏDV (18%):</span>
                <span>{{ formatPrice(cartTax) }}</span>
              </div>
              <div class="breakdown-row total-row">
                <span>Yekun:</span>
                <span>{{ formatPrice(cartTotal) }}</span>
              </div>
            </div>
            <button class="checkout-btn btn-sketch">Sifarişi rəsmiləşdir</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Mobile Menu Overlay -->
    <transition name="mobile-nav">
      <div v-if="mobileOpen" class="mobile-menu-overlay">
        <div class="mobile-menu-inner">
          <div class="mobile-menu-header">
            <img src="/digimax_app_logo_icon.png" class="logo-img" />
            <button class="mobile-close" @click="mobileOpen = false">×</button>
          </div>
          <ul class="mobile-nav-list">
            <li v-for="item in navigation" :key="item.label" @click="handleSelect(item.action)">
              <div class="mobile-nav-item">
                <span v-html="item.icon" class="mobile-nav-icon"></span>
                <span>{{ item.label }}</span>
              </div>
            </li>
          </ul>
          
          <div class="mobile-menu-footer">
            <button class="mobile-cart-btn" @click="mobileOpen = false; emit('toggle-cart', true)">
              <iconify-icon icon="solar:cart-large-minimalistic-bold"></iconify-icon>
              <span>Səbət ({{ cartItems.length }}) Items</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </header>
</template>

<style scoped>
.header-root {
  position: fixed !important;
  top: 0;
  left: 0;
  right: 0;
  z-index: 99999 !important;
  background: #0d0d0f;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;
}

.is-sticky {
  background: rgba(13, 13, 15, 0.85);
  backdrop-filter: blur(16px);
}

.navbar-container {
  width: 100%;
  padding: 0 40px;
}

/* Main Navbar Row */
.navbar-main {
  height: 80px;
  display: flex;
  align-items: center;
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.navbar-left { 
  display: flex; 
  align-items: center; 
  gap: 40px; 
}

.navbar-right { 
  display: flex; 
  align-items: center; 
  gap: 20px; 
}

.logo-img { height: 42px; width: auto; }

.nav-menu {
  display: flex;
  list-style: none;
  gap: 32px;
  padding: 0;
  margin: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #a4a9b8;
  font-size: 14px;
  font-weight: 700;
  transition: color 0.2s ease;
}

.nav-item:hover, .nav-item.active {
  color: #fff;
}

.nav-icon {
  display: flex;
  align-items: center;
  color: currentColor;
}

/* Action Buttons */
.icon-btn {
  background: transparent;
  border: 0;
  padding: 8px;
  cursor: pointer;
  color: #fff;
  border-radius: 50%;
  transition: background 0.2s;
  position: relative;
}

.icon-btn:hover { background: rgba(255, 255, 255, 0.05); }

.svg-icon { width: 22px; height: 22px; fill: currentColor; }
.svg-icon.stroke-mode { fill: none; stroke: currentColor; stroke-width: 2px; }

.nav-pill-btn {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  height: 40px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.nav-pill-btn:hover { background: rgba(255, 255, 255, 0.08); }
.chevron { width: 8px; }

/* Subheader Row */
.navbar-sub {
  background: #090a0c;
  border-top: 1px solid rgba(255, 255, 255, 0.03);
  height: 48px;
  display: flex;
  align-items: center;
}

.sub-menu {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.sub-link {
  color: #8a8f9c;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  transition: color 0.2s;
}

.sub-link:hover { color: #fff; }

.sub-link.is-sale {
  color: #fff;
  animation: blink 2.5s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Cart Badge */
.cart-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background: #ffffff;
  color: #111111;
  font-size: 11px;
  font-weight: 900;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  pointer-events: none;
  z-index: 5;
}

.scale-enter-active, .scale-leave-active {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.scale-enter-from, .scale-leave-to {
  transform: scale(0);
}

/* Dropdown */
.dropdown-wrapper { position: relative; }
.nav-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 220px;
  background: #14151a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  padding: 8px 0;
  margin-top: 8px;
}

.dropdown-link {
  display: block;
  padding: 10px 20px;
  color: #a4a9b8;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
}

.dropdown-link:hover { background: rgba(255, 255, 255, 0.05); color: #fff; }

/* Modals & Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 2000;
  display: flex;
  justify-content: center;
}

.search-modal {
  width: 100%;
  max-width: 720px;
  padding-top: 120px;
  position: relative;
}

.search-modal input {
  width: 100%;
  background: transparent;
  border: 0;
  border-bottom: 2px solid #fff;
  padding: 16px 0;
  color: #fff;
  font-size: 24px;
  font-family: 'Sora', sans-serif;
  outline: none;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
}

.search-loader {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.1);
  border-top-color: #fff;
  border-radius: 50%;
  animation: search-spin 0.6s linear infinite;
}

@keyframes search-spin {
  to { transform: translateY(-50%) rotate(360deg); }
}

.search-results-container {
  margin-top: 40px;
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 10px;
}

.search-results-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.search-result-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.search-result-card:hover {
  background: rgba(255,255,255,0.07);
  transform: translateX(10px);
}

.result-img {
  width: 50px;
  height: 65px;
  border-radius: 6px;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}

.result-content {
  flex: 1;
}

.result-content h4 {
  margin: 0;
  font-size: 15px;
  color: #fff;
  font-weight: 700;
}

.result-content p {
  margin: 4px 0 0;
  color: var(--accent);
  font-weight: 800;
  font-size: 14px;
}

.result-add-btn {
  background: #fff;
  color: #000;
  border: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  transition: transform 0.2s;
}

.result-add-btn:hover {
  transform: scale(1.1);
}

.no-results {
  text-align: center;
  padding: 40px;
  color: #8a8f9c;
  font-size: 16px;
}

.search-close-btn {
  background: none;
  border: 0;
  color: #fff;
  font-size: 32px;
  cursor: pointer;
  position: absolute;
  top: 110px;
  right: -60px;
  opacity: 0.6;
  transition: all 0.2s ease;
}

.search-close-btn:hover {
  opacity: 1;
  transform: rotate(90deg);
}

@media (max-width: 1024px) {
  .search-close-btn {
    right: 0;
    top: 60px;
  }
}

/* Cart Drawer */
.cart-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 400px;
  background: #0d0d0f;
  padding: 32px;
  display: flex;
  flex-direction: column;
  box-shadow: -20px 0 60px rgba(0,0,0,0.8);
}

.drawer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.drawer-header h3 { margin: 0; font-family: 'Sora', sans-serif; font-weight: 800; font-size: 20px; }
.drawer-close { background: none; border: 0; color: #fff; font-size: 32px; cursor: pointer; }

.drawer-body {
  flex: 1;
  overflow-y: auto;
  margin: 0 -16px;
  padding: 0 16px;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.item-img { width: 60px; height: 75px; border-radius: 4px; background-size: cover; background-position: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
.item-info { flex: 1; }
.item-info h4 { margin: 0; font-size: 14px; color: #fff; font-weight: 700; line-height: 1.4; }
.item-info p { margin: 4px 0 0; color: var(--accent); font-weight: 800; font-size: 13px; }

.item-remove {
  background: none;
  border: 0;
  color: #4a4d58;
  font-size: 20px;
  cursor: pointer;
  transition: color 0.2s;
  padding: 8px;
}
.item-remove:hover { color: #ff3366; }

.empty-cart {
  padding: 60px 20px;
  text-align: center;
}

.empty-icon { font-size: 64px; color: rgba(255,255,255,0.05); margin-bottom: 20px; }
.empty-cart p { color: #8a8f9c; font-size: 15px; margin-bottom: 24px; }
.empty-btn {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: #fff;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.drawer-footer {
  margin-top: auto;
  padding-top: 24px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.cart-breakdown {
  margin-bottom: 24px;
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #a4a9b8;
  font-size: 14px;
}

.total-row {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed rgba(255,255,255,0.1);
  color: #fff;
  font-weight: 800;
  font-size: 18px;
}

.checkout-btn {
  width: 100%;
  height: 54px;
  background: #fff;
  color: #000;
  border: 0;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 14px;
  cursor: pointer;
  position: relative;
}

/* Reusing btn-sketch styles in drawer */
.checkout-btn.btn-sketch::before {
  content: "";
  position: absolute;
  inset: -4px;
  border: 2px solid #fff;
  border-radius: 2px;
  z-index: -1;
  pointer-events: none;
}

@media (max-width: 1024px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: flex !important; }
  .navbar-container { padding: 0 20px; }
  .navbar-sub { display: none; }
  .cart-drawer { width: 100%; padding: 24px; }
  
  .navbar-right {
    display: flex;
    justify-content: flex-end;
  }
}

/* Mobile Menu Styling */
.mobile-menu-overlay {
  position: fixed;
  inset: 0;
  background: #0d0d0f;
  z-index: 999999;
  display: flex;
  flex-direction: column;
}

.mobile-menu-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 40px 24px;
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 60px;
}

.mobile-close {
  background: none;
  border: 0;
  color: #fff;
  font-size: 48px;
  line-height: 1;
  cursor: pointer;
}

.mobile-nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  color: #fff;
  font-size: 20px;
  font-weight: 700;
}

.mobile-nav-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
}

.mobile-menu-footer {
  margin-top: auto;
  padding-top: 40px;
}

.mobile-cart-btn {
  width: 100%;
  height: 60px;
  background: #fff;
  color: #000;
  border: 0;
  border-radius: 8px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 16px;
}

/* Mobile Nav Animation */
.mobile-nav-enter-active, .mobile-nav-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.mobile-nav-enter-from { transform: translateY(-100%); }
.mobile-nav-leave-to { transform: translateY(-100%); }

/* GTranslate Styling Override */
.gtranslate_wrapper {
  margin-right: 12px;
  display: flex;
  align-items: center;
}

:deep(.gtranslate_wrapper a) {
  display: inline-flex !important;
  align-items: center;
  padding: 4px !important;
  border-radius: 4px;
  transition: background 0.2s;
}

:deep(.gtranslate_wrapper a:hover) {
  background: rgba(255, 255, 255, 0.05);
}

:deep(.gtranslate_wrapper img) {
  width: 22px !important;
  height: 22px !important;
  border-radius: 50%;
  object-fit: cover !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Animations */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.drawer-enter-active, .drawer-leave-active { transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.drawer-enter-from, .drawer-leave-to { transform: translateX(100%); }

.dropdown-enter-active, .dropdown-leave-active { transition: all 0.2s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
