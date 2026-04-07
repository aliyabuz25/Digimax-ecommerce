<script setup>
import { ref } from 'vue';

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
});

const isSent = ref(false);

const handleSubmit = () => {
  if (!form.value.name || !form.value.email) return;
  isSent.value = true;
  setTimeout(() => {
    isSent.value = false;
    form.value = { name: '', email: '', subject: '', message: '' };
  }, 3000);
};
</script>

<template>
  <div class="contact-root">
    <!-- Sketchy Decorative Elements -->
    <div class="sketch-decor decor-1"></div>
    <div class="sketch-decor decor-2"></div>
    <div class="sketch-decor decor-3"></div>
    <div class="sketch-decor decor-4"></div>

    <div class="contact-container mx-auto max-w-[1280px]">
      <div class="contact-grid">
        
        <!-- Left: Form -->
        <div class="contact-form-side" data-aos="fade-right">
          <div class="section-badge">Əlaqə Saxla</div>
          <h2 class="section-title">Bizə bir mesaj <span class="sketch-highlight">göndər</span></h2>
          <p class="section-desc">Hər hansı bir sualınız və ya təklifiniz varsa, bizimlə əlaqə saxlamaqdan çəkinməyin.</p>

          <form @submit.prevent="handleSubmit" class="main-form">
            <div class="form-row">
              <div class="input-group">
                <label>Adınız</label>
                <input v-model="form.name" type="text" placeholder="Məhəmməd Əliyev" required />
              </div>
              <div class="input-group">
                <label>E-poçt</label>
                <input v-model="form.email" type="email" placeholder="ali@example.com" required />
              </div>
            </div>
            <div class="input-group">
              <label>Mövzu</label>
              <input v-model="form.subject" type="text" placeholder="Sifariş haqqında" />
            </div>
            <div class="input-group">
              <label>Mesajınız</label>
              <textarea v-model="form.message" placeholder="Mesajınızı buraya yazın..." rows="5"></textarea>
            </div>

            <button type="submit" class="submit-btn btn-sketch" :disabled="isSent">
              <span v-if="!isSent">Mesajı Gönder</span>
              <span v-else>Gönderildi!</span>
            </button>
          </form>
        </div>

        <!-- Right: Info -->
        <div class="contact-info-side" data-aos="fade-left">
          <div class="info-card">
            <div class="info-item">
              <div class="info-icon">
                <iconify-icon icon="solar:map-point-bold-duotone"></iconify-icon>
              </div>
              <div class="info-text">
                <h4>Ünvanımız</h4>
                <p>Bakı şəhəri, Nizami küç. 102, Azərbaycan</p>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon">
                <iconify-icon icon="solar:phone-bold-duotone"></iconify-icon>
              </div>
              <div class="info-text">
                <h4>Əlaqə nömrəsi</h4>
                <p>+994 (55) 123 45 67</p>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon">
                <iconify-icon icon="solar:letter-bold-duotone"></iconify-icon>
              </div>
              <div class="info-text">
                <h4>E-poçt</h4>
                <p>info@digimax.az</p>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon">
                <iconify-icon icon="solar:clock-circle-bold-duotone"></iconify-icon>
              </div>
              <div class="info-text">
                <h4>İş saatları</h4>
                <p>Bax - Şənbə: 10:00 - 20:00</p>
              </div>
            </div>
          </div>

          <!-- Map -->
          <div class="map-wrapper">
             <iframe 
               src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12157.06059955365!2d49.85244569345719!3d40.37503022510344!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40307d077c61fef3%3A0xfa91a337fe6f0db5!2sNizami%20Street%2C%20Bak%C4%B1!5e0!3m2!1sen!2saz!4v1700000000000!5m2!1sen!2saz" 
               width="100%" 
               height="250" 
               style="border:0;" 
               allowfullscreen="" 
               loading="lazy"
               class="google-map"
             ></iframe>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.contact-root {
  padding: 160px 40px 120px 40px;
  background: var(--bg);
  min-height: 80vh;
  position: relative;
  overflow: hidden;
}

.contact-container {
  position: relative;
  z-index: 2;
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 80px;
  align-items: start;
}

.section-badge {
  display: inline-block;
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 20px;
  line-height: 1.1;
}

.sketch-highlight {
  position: relative;
  display: inline-block;
}

.sketch-highlight::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 8px;
  background: rgba(255,255,255,0.1);
  transform: skewX(-15deg);
  z-index: -1;
}

.section-desc {
  color: var(--muted);
  font-size: 18px;
  max-width: 500px;
  margin-bottom: 48px;
}

.main-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-row {
  display: flex;
  gap: 24px;
}

.input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  opacity: 0.8;
}

.input-group input, 
.input-group textarea {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 14px 18px;
  border-radius: 12px;
  color: #fff;
  font-family: inherit;
  transition: all 0.3s ease;
}

.input-group input:focus, 
.input-group textarea:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.06);
}

.submit-btn {
  width: fit-content;
  padding: 16px 40px;
  font-size: 16px;
  font-weight: 700;
  margin-top: 12px;
}

.info-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
}

.info-item {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.info-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.info-text h4 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
}

.info-text p {
  color: var(--muted);
  font-size: 15px;
  line-height: 1.4;
}

.map-wrapper {
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  filter: grayscale(1) invert(0.9) brightness(0.9);
}

/* Sketchy Decorative Shapes */
.sketch-decor {
  position: absolute;
  pointer-events: none;
  z-index: 1;
  opacity: 0.15;
  border: 2px solid #fff;
}

.decor-1 {
  width: 300px;
  height: 300px;
  top: 10%;
  right: -5%;
  border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
  animation: morph 20s linear infinite;
}

.decor-2 {
  width: 150px;
  height: 150px;
  bottom: 10%;
  left: 2%;
  border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
  animation: morph 15s linear infinite reverse;
}

.decor-3 {
  width: 80px;
  height: 80px;
  top: 40%;
  left: 30%;
  border-radius: 50%;
  border: 2px dashed #fff;
  opacity: 0.1;
  animation: float 10s ease-in-out infinite;
}

.decor-4 {
  width: 40px;
  height: 40px;
  bottom: 25%;
  right: 25%;
  border-radius: 20%;
  transform: rotate(45deg);
  animation: float 8s ease-in-out infinite reverse;
}

@keyframes morph {
  0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
  33% { border-radius: 53% 47% 41% 59% / 33% 56% 44% 67%; }
  66% { border-radius: 41% 59% 70% 30% / 50% 40% 60% 50%; }
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(10px, -20px) rotate(5deg); }
  66% { transform: translate(-10px, 15px) rotate(-5deg); }
}

@media (max-width: 1024px) {
  .sketch-decor {
    opacity: 0.08;
  }
}
</style>
