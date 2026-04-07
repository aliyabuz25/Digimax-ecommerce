import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fs from "fs";
import session from "express-session";
import bcrypt from "bcrypt";
import { siteData as fallbackSiteData } from "./config/site-data.js";
import {
  addProductKeys,
  buildPublicSiteData,
  createUser,
  deleteCategory,
  deleteCategoryCover,
  deletePage,
  deleteProduct,
  getAdminDashboardStats,
  getDb,
  getProductBySlug,
  getUserByEmail,
  getUserById,
  getUserOrders,
  iconOptions,
  listCategories,
  listCategoryCovers,
  listOrders,
  listPages,
  listProducts,
  listUsers,
  updateOrderStatus,
  updateUserBalance,
  updateUserInfo,
  updateUserStatus,
  upsertCategory,
  upsertCategoryCover,
  upsertPage,
  upsertProduct,
} from "./server/admin-db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "pages"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "digimax-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

app.use(async (req, res, next) => {
  try {
    if (req.session.user) {
      const latestUser = await getUserById(req.session.user.id).catch(() => null);
      if (latestUser) {
        req.session.user = latestUser;
      }
    }
    res.locals.user = req.session.user || null;
    
    // Attempt to build site data with a fallback
    try {
      res.locals.siteData = await buildPublicSiteData();
    } catch (dbError) {
      console.error("Database error in middleware:", dbError);
      res.locals.siteData = fallbackSiteData;
    }
    
    next();
  } catch (error) {
    console.error("Global middleware error:", error);
    res.locals.siteData = fallbackSiteData;
    next();
  }
});

const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === "admin") {
    return next();
  }
  res.redirect("/login");
};

const isAuth = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect("/login");
};

app.get("/", async (_req, res) => {
  try {
    res.render("index", {
      siteData: res.locals.siteData,
    });
  } catch (error) {
    console.error("Failed to build public site data:", error);
    res.render("index", {
      siteData: fallbackSiteData,
    });
  }
});

app.get("/register", (req, res) => res.render("register", { title: "Qeydiyyat" }));
app.post("/register", async (req, res) => {
  const { name, email, gsm, password } = req.body;
  const existingUser = await getUserByEmail(email);
  if (existingUser) return res.send("Bu email artıq istifadə olunur.");
  const hashedPassword = await bcrypt.hash(password, 10);
  await createUser({ name, email, gsm, password: hashedPassword });
  res.redirect("/login");
});

app.get("/login", (req, res) => res.render("login", { title: "Giriş" }));
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await getUserByEmail(email);
  if (!user || user.is_banned) return res.send("Email və ya şifrə yanlışdır, yaxud hesabınız bloklanıb.");
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.send("Email və ya şifrə yanlışdır.");
  req.session.user = user;
  res.redirect(user.role === "admin" ? "/admin" : "/profile");
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.get("/profile", isAuth, async (req, res) => {
  const orders = await getUserOrders(req.session.user.id);
  res.render("profile", { title: "Profilim", user: req.session.user, orders });
});

app.get("/profile/edit", isAuth, (req, res) => {
  res.render("edit-profile", { 
    title: "Məlumatlarım", 
    user: req.session.user,
    success: req.query.success === 'true',
    error: req.query.error
  });
});

app.post("/profile/edit", isAuth, async (req, res) => {
  const { name, email, gsm, password } = req.body;
  const userId = req.session.user.id;

  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser && existingUser.id !== userId) {
      return res.render("edit-profile", {
        title: "Məlumatlarım",
        user: { ...req.session.user, name, email, gsm },
        error: "Bu email artıq istifadə olunur.",
        success: false
      });
    }

    const updateData = { name, email, gsm };
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    await updateUserInfo(userId, updateData);
    
    // Refresh session data
    const updatedUser = await getUserById(userId);
    req.session.user = updatedUser;

    res.redirect("/profile/edit?success=true");
  } catch (error) {
    console.error("Error updating profile:", error);
    res.render("edit-profile", {
      title: "Məlumatlarım",
      user: { ...req.session.user, name, email, gsm },
      error: "Məlumatları yeniləyərkən xəta baş verdi.",
      success: false
    });
  }
});

app.get("/cart", async (req, res) => {
  try {
    const siteData = await buildPublicSiteData();
    res.render("cart", { 
      title: "Səbətim", 
      user: req.session.user || null,
      siteData 
    });
  } catch (error) {
    res.redirect("/");
  }
});

const normalizeImageUrl = (image) => {
  if (!image) return "/digimax_app_logo_icon.png";

  const value = String(image).trim();
  const simpleIconsMatch = value.match(/^https:\/\/cdn\.simpleicons\.org\/([^/]+)\/([A-Fa-f0-9]{3,8})$/);

  if (simpleIconsMatch) {
    const [, iconName, color] = simpleIconsMatch;
    return `https://api.iconify.design/simple-icons:${iconName}.svg?color=%23${color.toLowerCase()}`;
  }

  return value;
};

const parseProductImages = (imageValue) => {
  const values = String(imageValue || "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

  const normalized = values.map(normalizeImageUrl);
  return normalized.length ? normalized : ["/digimax_app_logo_icon.png"];
};

const formatPublicProduct = (product) => ({
  ...product,
  images: parseProductImages(product.image),
  image: parseProductImages(product.image)[0],
  price: `${Number(product.price_current || 0).toLocaleString("az-AZ")} ₼`,
  oldPrice:
    product.price_old !== null && product.price_old !== undefined
      ? `${Number(product.price_old).toLocaleString("az-AZ")} ₼`
      : "",
  discount: product.discount_label || "",
  details: JSON.parse(product.details_json || "[]"),
  stock_quantity: product.stock_quantity || 0,
  isInStock: (product.stock_quantity || 0) > 0,
  region: product.region || "Turkey",
  language: product.language || "Turkish",
  discount_expiry: product.discount_expiry || "",
});

app.get("/product/:slug", async (req, res) => {
  try {
    await getDb();
    const siteData = await buildPublicSiteData();
    const product = await getProductBySlug(req.params.slug);

    if (!product) {
      res.status(404).render("404", {
        title: "Məhsul tapılmadı",
        siteData,
      });
      return;
    }

    const allProducts = (await listProducts()).map(formatPublicProduct);
    const currentProduct = formatPublicProduct(product);
    const recommendedProducts = allProducts
      .filter((item) => item.slug !== currentProduct.slug)
      .slice(0, 4);

    res.render("product", {
      title: currentProduct.title,
      siteData,
      product: currentProduct,
      recommendedProducts,
    });
  } catch (error) {
    console.error("Product page error:", error);
    res.status(500).send("Product page could not be loaded.");
  }
});

app.get("/admin", isAdmin, (req, res) => res.redirect("/admin/dashboard"));

app.get("/admin/dashboard", isAdmin, async (req, res) => {
  try {
    await getDb();
    res.render("admin/dashboard", {
      title: "İdarəetmə Paneli",
      active: "dashboard",
      stats: await getAdminDashboardStats(),
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).send("İdarəetmə paneli yüklənə bilmədi.");
  }
});

app.get("/admin/pages", async (_req, res) => {
  try {
    await getDb();
    res.render("admin/pages", {
      title: "Pages",
      active: "pages",
      pages: await listPages(),
      iconOptions,
    });
  } catch (error) {
    console.error("Admin pages error:", error);
    res.status(500).send("Admin pages could not be loaded.");
  }
});

app.post("/admin/pages", async (req, res) => {
  await upsertPage(req.body);
  res.redirect("/admin/pages");
});

app.post("/admin/pages/:id/update", async (req, res) => {
  await upsertPage({ ...req.body, id: req.params.id });
  res.redirect("/admin/pages");
});

app.post("/admin/pages/:id/delete", async (req, res) => {
  await deletePage(Number(req.params.id));
  res.redirect("/admin/pages");
});

app.get("/admin/covers", async (_req, res) => {
  try {
    await getDb();
    res.render("admin/covers", {
      title: "Kategoriya Qapaqları",
      active: "covers",
      covers: await listCategoryCovers(),
      products: await listProducts(),
    });
  } catch (error) {
    console.error("Admin covers error:", error);
    res.status(500).send("Admin covers could not be loaded.");
  }
});

app.post("/admin/covers", isAdmin, upload.single("imageUpload"), async (req, res) => {
  const payload = { ...req.body };
  if (req.file) {
    payload.image = `/uploads/${req.file.filename}`;
  }
  await upsertCategoryCover(payload);
  res.redirect("/admin/covers");
});

app.post("/admin/covers/:id/update", isAdmin, upload.single("imageUpload"), async (req, res) => {
  const payload = { ...req.body, id: req.params.id };
  if (req.file) {
    payload.image = `/uploads/${req.file.filename}`;
  }
  await upsertCategoryCover(payload);
  res.redirect("/admin/covers");
});

app.post("/admin/covers/:id/delete", async (req, res) => {
  await deleteCategoryCover(Number(req.params.id));
  res.redirect("/admin/covers");
});

app.get("/admin/categories", async (_req, res) => {
  try {
    await getDb();
    res.render("admin/categories", {
      title: "Categories",
      active: "categories",
      categories: await listCategories(),
    });
  } catch (error) {
    console.error("Admin categories error:", error);
    res.status(500).send("Admin categories could not be loaded.");
  }
});

app.post("/admin/categories", async (req, res) => {
  await upsertCategory(req.body);
  res.redirect("/admin/categories");
});

app.post("/admin/categories/:id/update", async (req, res) => {
  await upsertCategory({ ...req.body, id: req.params.id });
  res.redirect("/admin/categories");
});

app.post("/admin/categories/:id/delete", async (req, res) => {
  await deleteCategory(Number(req.params.id));
  res.redirect("/admin/categories");
});

app.get("/admin/products", async (_req, res) => {
  try {
    await getDb();
    res.render("admin/products", {
      title: "Products",
      active: "products",
      products: await listProducts(),
      pages: await listPages(),
      categories: await listCategories(),
    });
  } catch (error) {
    console.error("Admin products error:", error);
    res.status(500).send("Admin products could not be loaded.");
  }
});

app.post("/admin/products", isAdmin, upload.array("images[]"), async (req, res) => {
  const payload = { ...req.body };
  if (req.files && req.files.length > 0) {
    const uploadedUrls = req.files.map((file) => `/uploads/${file.filename}`).join("\n");
    payload.image = payload.image ? `${payload.image}\n${uploadedUrls}` : uploadedUrls;
  }
  const productId = await upsertProduct(payload);
  if (req.body.keys) {
    await addProductKeys(productId || req.body.id, req.body.keys);
  }
  res.redirect("/admin/products");
});

app.post("/admin/products/:id/update", isAdmin, upload.array("images[]"), async (req, res) => {
  const payload = { ...req.body, id: req.params.id };
  if (req.files && req.files.length > 0) {
    const uploadedUrls = req.files.map((file) => `/uploads/${file.filename}`).join("\n");
    payload.image = payload.image ? `${payload.image}\n${uploadedUrls}` : uploadedUrls;
  }
  await upsertProduct(payload);
  if (req.body.keys) {
    await addProductKeys(req.params.id, req.body.keys);
  }
  res.redirect("/admin/products");
});

app.post("/admin/products/:id/delete", isAdmin, async (req, res) => {
  await deleteProduct(Number(req.params.id));
  res.redirect("/admin/products");
});

app.get("/admin/users", isAdmin, async (req, res) => {
  res.render("admin/users", {
    title: "İstifadəçilər",
    active: "users",
    users: await listUsers(),
  });
});

app.post("/admin/users/:id/ban", isAdmin, async (req, res) => {
  await updateUserStatus(req.params.id, true);
  res.redirect("/admin/users");
});

app.post("/admin/users/:id/unban", isAdmin, async (req, res) => {
  await updateUserStatus(req.params.id, false);
  res.redirect("/admin/users");
});

app.post("/admin/users/:id/update-balance", isAdmin, async (req, res) => {
  const { balance } = req.body;
  await updateUserBalance(req.params.id, balance);
  res.redirect("/admin/users");
});

app.get("/admin/sales", isAdmin, async (_req, res) => {
  try {
    res.render("admin/sales", {
      title: "Satışlar",
      active: "sales",
      orders: await listOrders(),
    });
  } catch (error) {
    console.error("Admin sales error:", error);
    res.status(500).send("Satışlar yüklənə bilmədi.");
  }
});

app.post("/admin/sales/:id/approve", isAdmin, async (req, res) => {
  await updateOrderStatus(req.params.id, "approved", "delivered");
  res.redirect("/admin/sales");
});

app.listen(port, () => {
  console.log(`Digimax EJS app listening on http://localhost:${port}`);
});
