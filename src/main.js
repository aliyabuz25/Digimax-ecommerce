import { createApp } from "vue";
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'
import { MotionPlugin } from '@vueuse/motion'
import App from "./App.vue";
import "./styles.css";

const app = createApp(App);
app.use(autoAnimatePlugin);
app.use(MotionPlugin);
app.mount("#app");

requestAnimationFrame(() => {
  window.AOS?.init({
    duration: 400,
    easing: "ease-out",
    once: true,
    offset: 50,
    delay: 0,
    mirror: false,
  });
});
