<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  recommendedProducts: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close', 'add-to-cart', 'open-product']);

const activeTab = ref('description');
const currentImage = ref(props.product.image);

const productScreenshots = [
  props.product.image,
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/976310/ss_8992c3004481b37130206132713f0249c56637e1.1920x1080.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/976310/ss_496350d7543881e194ea7c3014a02c3bc63554b4.1920x1080.jpg",
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/976310/ss_78e990a42426615bcf07d894e334a1795c64366d.1920x1080.jpg"
];

const discountPercent = computed(() => {
  // Simple mock calculation if not provided
  if (props.product.oldPrice) return "-85%";
  return "-60%";
});

const handleAddToCart = (e) => {
  emit('add-to-cart', { product: props.product, event: e });
};
</script>

<template>
  <div class="pd-container">
    <!-- Sketchy decorative elements for "Fun" -->
    <div class="pd-doodle pd-doodle--star" v-motion-roll-visible-left><iconify-icon icon="solar:star-bold-duotone"></iconify-icon></div>
    <div class="pd-doodle pd-doodle--circle" v-motion-pop-visible><iconify-icon icon="solar:videocamera-record-bold-duotone"></iconify-icon></div>
    <div class="pd-doodle pd-doodle--arrow" v-motion-slide-visible-right><iconify-icon icon="solar:round-alt-arrow-right-bold-duotone"></iconify-icon></div>

    <div class="pd-inner mx-auto max-w-[1100px]">
      
      <!-- Close Button -->
      <button class="pd-close" @click="emit('close')">
        <iconify-icon icon="solar:close-circle-bold-duotone"></iconify-icon>
      </button>

      <!-- Breadcrumbs -->
      <nav class="pd-breadcrumbs">
        <span>Ana Səhifə</span> / <span>Kataloq</span> / <span class="active">{{ product.title }}</span>
      </nav>

      <div class="pd-main-grid">
        
        <!-- Left Column: Visuals -->
        <div class="pd-visuals">
          <div class="pd-main-image-wrapper">
             <img :src="currentImage" alt="Main" class="pd-main-image" />
          </div>
          <div class="pd-thumbnails">
            <div 
              v-for="(img, idx) in productScreenshots" 
              :key="idx"
              class="pd-thumb"
              :class="{ active: currentImage === img }"
              @click="currentImage = img"
            >
              <img :src="img" />
            </div>
          </div>
        </div>

        <!-- Right Column: Content -->
        <div class="pd-content">
          <h1 class="pd-title">{{ product.title }}</h1>
          
          <div class="pd-specs">
            <div class="spec-item">
              <span class="label">Platforma:</span>
              <span class="value">PS4, PS5</span>
            </div>
            <div class="spec-item">
              <span class="label">Lokallaşdırma:</span>
              <span class="value">Türk dili</span>
            </div>
            <div class="spec-item">
              <span class="label">Region:</span>
              <span class="value flex items-center gap-1">
                Türkiyə <img src="https://flagcdn.com/w20/tr.png" width="16" />
              </span>
            </div>
          </div>

          <div class="pd-price-row mt-8">
            <div class="price-stack">
              <span class="old-price">{{ product.oldPrice || '120.00 AZN' }}</span>
              <div class="current-price-group">
                <span class="current-price">{{ product.price }}</span>
                <span class="discount-badge">{{ discountPercent }}</span>
              </div>
            </div>
          </div>

          <div class="pd-timer-bar mt-4">
             <div class="timer-fill"></div>
             <span class="timer-text">Endirimin bitməsinə: 01 d. 20 s. 26 d.</span>
          </div>

          <div class="pd-actions mt-8">
            <button class="pd-add-to-cart btn-sketch" @click="handleAddToCart" v-motion-pop>
               Səbətə Əlavə Et
            </button>
            <button class="pd-secondary-btn" v-motion-fade>
               Nəşri seçin
            </button>
            <button class="pd-secondary-btn flex items-center gap-2" v-motion-fade>
               <img src="https://flagcdn.com/w20/az.png" width="16" /> Azərbaycan r. - 25.00 AZN
            </button>
          </div>
        </div>
      </div>

      <!-- Tabs & Info -->
      <div class="pd-info-tabs mt-12">
        <div class="tab-triggers">
          <button 
            class="tab-trigger" 
            :class="{ active: activeTab === 'description' }"
            @click="activeTab = 'description'"
          >Təsvir</button>
          <button 
            class="tab-trigger"
            :class="{ active: activeTab === 'details' }"
            @click="activeTab = 'details'"
          >Detallar</button>
        </div>

        <div class="tab-content py-8">
          <div v-if="activeTab === 'description'" class="description-text">
            <ul class="bullet-list mb-6">
              <li>PS Plus required for online play</li>
              <li>Supports up to 8 online players with PS Plus</li>
              <li>In-game purchases optional</li>
              <li>Online play optional</li>
              <li>2 players</li>
            </ul>
            <p>Mortal Kombat geri döndü və hər zamankindən daha yaxşıdır! İkonik franşizanın növbəti təkamülündə yeni Custom Character Variations sizə döyüşçülərinizi öz istəyinizə uyğun fərdiləşdirmək üçün misilsiz nəzarət təqdim edir.</p>
          </div>
          <div v-else>
             <p>Platforma: PS5<br>Nəşriyyat: Warner Bros. Games<br>Janr: Döyüş (Fighting)</p>
          </div>
        </div>
      </div>

      <!-- Recommendations -->
      <div class="pd-recommendations mt-16">
        <h3 class="rec-title">Tövsiyə olunan oyunlar</h3>
        <div class="rec-grid">
           <div 
             v-for="product in recommendedProducts" 
             :key="product.slug" 
             class="rec-card"
             @click="emit('open-product', product)"
            >
              <div class="rec-image-wrap">
                 <img :src="product.image" />
                 <span v-if="product.discount" class="rec-badge">{{ product.discount }}</span>
              </div>
              <div class="rec-body">
                 <h5>{{ product.title }}</h5>
                 <div class="rec-price">{{ product.price }}</div>
              </div>
           </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.pd-container {
  padding: 80px 24px 60px 24px;
  background: var(--bg);
  min-height: auto;
  position: relative;
  z-index: 100;
  overflow: hidden;
}

/* Floating Doodles */
.pd-doodle {
  position: absolute;
  color: var(--accent);
  opacity: 0.12;
  font-size: 80px;
  pointer-events: none;
  z-index: 1;
}

.pd-doodle--star { top: 40px; right: 10%; transform: rotate(15deg); }
.pd-doodle--circle { bottom: 20%; left: -20px; font-size: 120px; }
.pd-doodle--arrow { top: 50%; right: -30px; font-size: 60px; transform: rotate(-20deg); }

.pd-close {
  position: fixed;
  top: 40px;
  right: 40px;
  background: none;
  border: 0;
  color: #fff;
  font-size: 40px;
  cursor: pointer;
  z-index: 110;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.pd-close:hover { opacity: 1; }

.pd-breadcrumbs {
  font-size: 13px;
  color: #8a8f9c;
  margin-bottom: 24px;
}

.pd-breadcrumbs .active { color: #fff; }

.pd-main-grid {
  display: grid;
  grid-template-columns: 450px 1fr;
  gap: 60px;
}

.pd-main-image-wrapper {
  aspect-ratio: 1;
  border-radius: 20px;
  overflow: hidden;
  background: rgba(255,255,255,0.02);
  margin-bottom: 20px;
}

.pd-main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pd-thumbnails {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.pd-thumb {
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  opacity: 0.6;
  transition: all 0.2s;
}

.pd-thumb.active { border-color: #fff; opacity: 1; }
.pd-thumb:hover { opacity: 1; }
.pd-thumb img { width: 100%; height: 100%; object-fit: cover; }

.pd-title {
  font-size: 42px;
  font-weight: 800;
  margin-bottom: 32px;
}

.pd-specs {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.spec-item {
  display: flex;
  gap: 10px;
  font-size: 14px;
}

.spec-item .label { color: #8a8f9c; }
.spec-item .value { color: #fff; font-weight: 600; }

.price-stack { display: flex; flex-direction: column; gap: 4px; }
.old-price { text-decoration: line-through; color: #8a8f9c; font-size: 18px; }
.current-price-group { display: flex; align-items: center; gap: 12px; }
.current-price { font-size: 32px; font-weight: 800; }
.discount-badge {
  background: var(--accent);
  color: #fff;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 800;
}

.pd-timer-bar {
  width: 100%;
  height: 32px;
  background: rgba(255,255,255,0.05);
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: 0 16px;
}

.timer-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 60%;
  background: linear-gradient(90deg, #9333ea, #6366f1);
  z-index: 1;
}

.timer-text {
  position: relative;
  z-index: 2;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
}

.pd-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.pd-add-to-cart {
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 800;
  background: #fff;
  color: #000;
}

.pd-secondary-btn {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 16px 24px;
  border-radius: 20px;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.pd-secondary-btn:hover { background: rgba(255,255,255,0.08); }

.tab-triggers {
  display: flex;
  gap: 32px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.tab-trigger {
  background: none;
  border: 0;
  padding: 16px 0;
  color: #8a8f9c;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  position: relative;
}

.tab-trigger.active { color: #fff; }
.tab-trigger.active::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #fff;
}

.bullet-list {
  padding-left: 20px;
  list-style-type: disc;
  color: #a4a9b8;
  line-height: 1.8;
}

.description-text p {
  color: #a4a9b8;
  line-height: 1.6;
}

.rec-title {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 24px;
}

.rec-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.rec-card {
  cursor: pointer;
  transition: transform 0.3s;
}

.rec-card:hover { transform: translateY(-5px); }

.rec-image-wrap {
  aspect-ratio: 2/3;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  margin-bottom: 12px;
}

.rec-image-wrap img { width: 100%; height: 100%; object-fit: cover; }

.rec-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #9333ea;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 800;
}

.rec-body h5 {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 4px;
}

.rec-price {
  color: var(--accent);
  font-weight: 800;
  font-size: 14px;
}

@media (max-width: 1024px) {
  .pd-main-grid { grid-template-columns: 1fr; }
  .pd-visuals { max-width: 500px; margin: 0 auto; }
  .pd-title { font-size: 32px; }
  .rec-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
