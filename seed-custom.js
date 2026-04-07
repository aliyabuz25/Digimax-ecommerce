import { upsertProduct } from "./server/admin-db.js";

const run = async () => {
  const details = [
    "🎮 Growtopia X5 Diamond Lock Satışı!",
    "📦 İstediğiniz miktarda Diamond Lock (DL) stoklarımızda mevcuttur.",
    "✔️ Yüksek miktarda DL stok garantisi",
    "✔️ Anında teslimat – Online olduğum sürece 5-10 dakika içinde teslim",
    "✔️ Güvenilir satıcı – Satış geçmişi ve yorumlar mevcut",
    "✔️ Toplu alımlarda özel indirim fırsatı",
    "🚚 Teslimat Bilgisi:",
    "✔️ World adı ve GrowID iletmeniz gerekmektedir",
    "✔️ Worldünüzde Donate Box bulunması zorunludur"
  ].join("\\n");

  await upsertProduct({
    slug: "x5-dl-satisi",
    title: "⚡ X5 DL Satışı | Anında Teslim & Güvenli",
    subtitle: "Growtopia DL (Diamond Lock)",
    description: "Anında teslimat ile Growtopia X5 Diamond Lock",
    platform: "PC / Mobile",
    product_type: "Virtual Currency",
    tab: "Oyun Valyutası", // Match the Currency tab roughly
    price_current: 5.00,
    price_old: null,
    discount_label: "",
    discount_expiry: "",
    image: "https://cdn.itemsatis.com/uploads/post_images/x5-dl-satisi-aninda-teslim-guvenli-39740774.png",
    badge: "Anında Teslimat",
    cta: "Sepete Ekle",
    sort_order: 1,
    searchable: true,
    accent: false,
    category_id: null,
    stock_quantity: 590,
    region: "Global",
    language: "Global",
    details: details,
    placements: ["all_products", "currency"]
  });

  console.log("Məhsul uğurla əlavə edildi.");
};

run();
