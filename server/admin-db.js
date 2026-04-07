import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import initSqlJs from "sql.js";
import { siteData as fallbackSiteData } from "../config/site-data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "..", "public", "navigation.db");

let dbPromise;
let SQLPromise;

export const iconOptions = [
  { key: "lucide:gamepad-2", label: "Oyun Pultu" },
  { key: "lucide:play-circle", label: "Video/Play" },
  { key: "lucide:joystick", label: "Joystick" },
  { key: "lucide:layout-grid", label: "Kataloq" },
  { key: "lucide:wallet", label: "Balans" },
  { key: "lucide:credit-card", label: "Kartlar" },
  { key: "lucide:star", label: "Ulduz" },
  { key: "lucide:shopping-bag", label: "Səbət" },
  { key: "lucide:message-circle", label: "Mesaj" },
];

const parseJsonArray = (value, fallback = []) => {
  if (!value) return fallback;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const rowsFromExec = (db, query, params = {}) => {
  const statement = db.prepare(query);
  statement.bind(params);
  const rows = [];

  while (statement.step()) {
    rows.push(statement.getAsObject());
  }

  statement.free();
  return rows;
};

const runStatement = (db, query, params = {}) => {
  db.run(query, params);
};

export const persistDb = async (db) => {
  const data = db.export();
  await fs.writeFile(dbPath, Buffer.from(data));
};

const getSql = async () => {
  if (!SQLPromise) {
    const distPath = path.join(__dirname, "..", "node_modules", "sql.js", "dist");
    SQLPromise = initSqlJs({
      locateFile: (file) => path.join(distPath, file),
    });
  }

  return SQLPromise;
};

const ensureColumn = (db, tableName, columnName, ddl) => {
  const columns = rowsFromExec(db, `PRAGMA table_info(${tableName})`);
  const exists = columns.some((column) => column.name === columnName);
  if (!exists) {
    db.run(`ALTER TABLE ${tableName} ADD COLUMN ${ddl}`);
  }
};

const initializeSchema = (db) => {
  db.run(`
    CREATE TABLE IF NOT EXISTS admin_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      tab_key TEXT NOT NULL UNIQUE,
      eyebrow TEXT DEFAULT '',
      title TEXT DEFAULT '',
      description TEXT DEFAULT '',
      icon_key TEXT DEFAULT 'solar:widget-5-bold-duotone',
      chips_json TEXT DEFAULT '[]',
      filters_json TEXT DEFAULT '[]',
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      is_banned INTEGER DEFAULT 0,
      balance REAL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS product_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      pin_code TEXT NOT NULL,
      is_sold INTEGER DEFAULT 0,
      order_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS store_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE,
      title TEXT NOT NULL,
      subtitle TEXT,
      description TEXT,
      platform TEXT,
      product_type TEXT,
      tab TEXT,
      price_current REAL DEFAULT 0,
      price_old REAL,
      discount_label TEXT,
      discount_expiry TEXT,
      image TEXT,
      badge TEXT,
      cta TEXT DEFAULT 'Səbətə at',
      sort_order INTEGER DEFAULT 0,
      searchable INTEGER DEFAULT 1,
      accent INTEGER DEFAULT 0,
      stock_quantity INTEGER DEFAULT 0,
      region TEXT,
      language TEXT,
      details_json TEXT DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS product_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sales_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_code TEXT NOT NULL UNIQUE,
      user_id INTEGER,
      product_id INTEGER,
      customer_name TEXT,
      customer_email TEXT,
      item_count INTEGER DEFAULT 1,
      total_amount REAL DEFAULT 0,
      payment_method TEXT,
      payment_status TEXT DEFAULT 'pending',
      delivery_status TEXT DEFAULT 'pending',
      payment_proof TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS product_placements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      section TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      UNIQUE(product_id, section)
    );

    CREATE TABLE IF NOT EXISTS category_covers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      image TEXT,
      target_url TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  ensureColumn(db, "users", "gsm", "gsm TEXT");
  ensureColumn(db, "users", "balance", "balance REAL DEFAULT 0");
  ensureColumn(db, "store_products", "stock_quantity", "stock_quantity INTEGER DEFAULT 0");
  ensureColumn(db, "sales_orders", "payment_status", "payment_status TEXT DEFAULT 'pending'");
  ensureColumn(db, "sales_orders", "delivery_status", "delivery_status TEXT DEFAULT 'pending'");
  ensureColumn(db, "sales_orders", "payment_proof", "payment_proof TEXT");
};

const seedDefaults = (db) => {
  const defaults = [
    {
      name: "All Products",
      slug: "all-products",
      tab_key: "AllProducts",
      eyebrow: "Full catalog",
      title: "Bütün məhsullar",
      description: "Bütün platforma və kateqoriyalardakı məhsullar tək səhifədə, səhifələmə ilə göstərilir.",
      icon_key: "solar:widget-5-bold-duotone",
      chips_json: JSON.stringify(["Hamısı", "Oyunlar", "Paketlər", "Servislər", "Valyuta", "Yeni gələnlər"]),
      filters_json: JSON.stringify(["Platforma", "Kateqoriya", "Qiymət", "Endirim", "Məhsul növü", "Region"]),
      sort_order: 0,
    },
    {
      name: "PlayStation",
      slug: "playstation",
      tab_key: "PlayStation",
      eyebrow: "Sony catalog",
      title: "PlayStation oyun kataloqu",
      description: "PlayStation bölməsi üçün vahid kataloq görünüşü.",
      icon_key: "solar:gamepad-bold-duotone",
      chips_json: JSON.stringify(["PS5", "PS4", "PS Plus", "Sony Türkiyə", "Sony Azərbaycan", "Pre-order"]),
      filters_json: JSON.stringify(["Platforma", "Janr", "Endirim", "Naşir", "Dil", "Buraxılış tarixi"]),
      sort_order: 1,
    },
    {
      name: "Xbox",
      slug: "xbox",
      tab_key: "Xbox",
      eyebrow: "Microsoft catalog",
      title: "Xbox oyun kataloqu",
      description: "Eyni layout Xbox tabı üçün də istifadə olunur.",
      icon_key: "solar:xbox-bold-duotone",
      chips_json: JSON.stringify(["Series X|S", "Xbox One", "Game Pass", "EA Play", "Ubisoft+", "Gift Cards"]),
      filters_json: JSON.stringify(["Platforma", "Abunəlik", "Nəşriyyatçı", "Qiymət", "Buraxılış ili", "Region"]),
      sort_order: 2,
    },
    {
      name: "Services",
      slug: "services",
      tab_key: "Servislər",
      eyebrow: "Digital services",
      title: "Rəqəmsal servis kataloqu",
      description: "Abunəlik və servis məhsulları da eyni kataloq skeleti ilə açılır.",
      icon_key: "solar:play-stream-bold-duotone",
      chips_json: JSON.stringify(["Spotify", "Netflix", "ChatGPT", "Canva", "YouTube", "Discord Nitro"]),
      filters_json: JSON.stringify(["Kateqoriya", "Müddət", "Populyar", "Yeni", "Hədiyyə", "Bölgə"]),
      sort_order: 3,
    },
    {
      name: "Currency",
      slug: "currency",
      tab_key: "Oyun Valyutası",
      eyebrow: "Wallet & top-up",
      title: "Oyun valyutası kataloqu",
      description: "Balans artırma və oyun içi valyuta məhsulları üçün eyni səhifə sistemi tətbiq olunur.",
      icon_key: "solar:wallet-money-bold-duotone",
      chips_json: JSON.stringify(["V-Bucks", "Steam Wallet", "PSN Wallet", "Xbox Gift", "Robux", "EA FC Points"]),
      filters_json: JSON.stringify(["Xidmət", "Nominal", "Region", "Aksiya", "Populyar", "Mövcudluq"]),
      sort_order: 4,
    },
  ];

  defaults.forEach((page) => {
    const exists = rowsFromExec(
      db,
      "SELECT id FROM admin_pages WHERE tab_key = $tab_key LIMIT 1",
      { $tab_key: page.tab_key },
    )[0];

    if (!exists) {
      runStatement(
        db,
        `
          INSERT INTO admin_pages (name, slug, tab_key, eyebrow, title, description, icon_key, chips_json, filters_json, sort_order)
          VALUES ($name, $slug, $tab_key, $eyebrow, $title, $description, $icon_key, $chips_json, $filters_json, $sort_order)
        `,
        {
          $name: page.name,
          $slug: page.slug,
          $tab_key: page.tab_key,
          $eyebrow: page.eyebrow,
          $title: page.title,
          $description: page.description,
          $icon_key: page.icon_key,
          $chips_json: page.chips_json,
          $filters_json: page.filters_json,
          $sort_order: page.sort_order,
        },
      );
    }
  });

  const categoryCount = rowsFromExec(db, "SELECT COUNT(*) AS count FROM product_categories")[0]?.count ?? 0;
  if (!categoryCount) {
    [
      { name: "Action", slug: "action", sort_order: 1 },
      { name: "Adventure", slug: "adventure", sort_order: 2 },
      { name: "Subscription", slug: "subscription", sort_order: 3 },
      { name: "Wallet", slug: "wallet", sort_order: 4 },
    ].forEach((category) => {
      runStatement(
        db,
        "INSERT INTO product_categories (name, slug, sort_order) VALUES ($name, $slug, $sort_order)",
        { $name: category.name, $slug: category.slug, $sort_order: category.sort_order },
      );
    });
  }

  const salesCount = rowsFromExec(db, "SELECT COUNT(*) AS count FROM sales_orders")[0]?.count ?? 0;
  if (!salesCount) {
    [
      { order_code: "DGX-1001", customer_name: "Aysel Məmmədova", customer_email: "aysel@example.com", item_count: 2, total_amount: 89.9, status: "paid" },
      { order_code: "DGX-1002", customer_name: "Elvin Quliyev", customer_email: "elvin@example.com", item_count: 1, total_amount: 34.5, status: "processing" },
      { order_code: "DGX-1003", customer_name: "Nihat Əliyev", customer_email: "nihat@example.com", item_count: 3, total_amount: 126.0, status: "completed" },
    ].forEach((sale) => {
      runStatement(
        db,
        `
          INSERT INTO sales_orders (order_code, customer_name, customer_email, item_count, total_amount, status)
          VALUES ($order_code, $customer_name, $customer_email, $item_count, $total_amount, $status)
        `,
        {
          $order_code: sale.order_code,
          $customer_name: sale.customer_name,
          $customer_email: sale.customer_email,
          $item_count: sale.item_count,
          $total_amount: sale.total_amount,
          $status: sale.status,
        },
      );
    });
  }
};

export const getDb = async () => {
  if (!dbPromise) {
    dbPromise = (async () => {
      const SQL = await getSql();
      let fileBuffer;

      try {
        fileBuffer = await fs.readFile(dbPath);
      } catch {
        fileBuffer = null;
      }

      const db = fileBuffer ? new SQL.Database(fileBuffer) : new SQL.Database();
      initializeSchema(db);
      seedDefaults(db);
      await persistDb(db);
      return db;
    })();
  }

  return dbPromise;
};

export const listPages = async () =>
  rowsFromExec(await getDb(), "SELECT * FROM admin_pages ORDER BY sort_order ASC, id ASC").map((page) => ({
    ...page,
    chips: parseJsonArray(page.chips_json),
    filters: parseJsonArray(page.filters_json),
  }));

export const upsertPage = async (payload) => {
  const db = await getDb();
  const data = {
    $id: payload.id ? Number(payload.id) : null,
    $name: payload.name.trim(),
    $slug: payload.slug.trim(),
    $tab_key: payload.tab_key.trim(),
    $eyebrow: payload.eyebrow.trim(),
    $title: payload.title.trim(),
    $description: payload.description.trim(),
    $icon_key: payload.icon_key.trim(),
    $chips_json: JSON.stringify(String(payload.chips || "").split("\n").map((value) => value.trim()).filter(Boolean)),
    $filters_json: JSON.stringify(String(payload.filters || "").split("\n").map((value) => value.trim()).filter(Boolean)),
    $sort_order: Number(payload.sort_order || 0),
    $is_active: payload.is_active ? 1 : 0,
  };

  if (data.$id) {
    runStatement(
      db,
      `
        UPDATE admin_pages
        SET name=$name, slug=$slug, tab_key=$tab_key, eyebrow=$eyebrow, title=$title, description=$description,
            icon_key=$icon_key, chips_json=$chips_json, filters_json=$filters_json, sort_order=$sort_order,
            is_active=$is_active, updated_at=CURRENT_TIMESTAMP
        WHERE id=$id
      `,
      data,
    );
  } else {
    runStatement(
      db,
      `
        INSERT INTO admin_pages (name, slug, tab_key, eyebrow, title, description, icon_key, chips_json, filters_json, sort_order, is_active)
        VALUES ($name, $slug, $tab_key, $eyebrow, $title, $description, $icon_key, $chips_json, $filters_json, $sort_order, $is_active)
      `,
      data,
    );
  }

  await persistDb(db);
};

export const deletePage = async (id) => {
  const db = await getDb();
  runStatement(db, "DELETE FROM admin_pages WHERE id = $id", { $id: id });
  await persistDb(db);
};

export const listCategories = async () =>
  rowsFromExec(await getDb(), "SELECT * FROM product_categories ORDER BY sort_order ASC, id ASC");

export const upsertCategory = async (payload) => {
  const db = await getDb();
  const data = {
    $id: payload.id ? Number(payload.id) : null,
    $name: payload.name.trim(),
    $slug: payload.slug.trim(),
    $sort_order: Number(payload.sort_order || 0),
  };

  if (data.$id) {
    runStatement(
      db,
      "UPDATE product_categories SET name=$name, slug=$slug, sort_order=$sort_order WHERE id=$id",
      data,
    );
  } else {
    runStatement(
      db,
      "INSERT INTO product_categories (name, slug, sort_order) VALUES ($name, $slug, $sort_order)",
      data,
    );
  }

  await persistDb(db);
};

export const deleteCategory = async (id) => {
  const db = await getDb();
  runStatement(db, "DELETE FROM product_categories WHERE id = $id", { $id: id });
  await persistDb(db);
};

export const listCategoryCovers = async () =>
  rowsFromExec(await getDb(), "SELECT * FROM category_covers ORDER BY sort_order ASC, id ASC");

export const upsertCategoryCover = async (payload) => {
  const db = await getDb();
  const data = {
    $id: payload.id ? Number(payload.id) : null,
    $title: payload.title.trim(),
    $image: (payload.image || "").trim(),
    $target_url: (payload.target_url || "").trim(),
    $sort_order: Number(payload.sort_order || 0),
  };

  if (data.$id) {
    runStatement(
      db,
      "UPDATE category_covers SET title=$title, image=$image, target_url=$target_url, sort_order=$sort_order WHERE id=$id",
      data,
    );
  } else {
    runStatement(
      db,
      "INSERT INTO category_covers (title, image, target_url, sort_order) VALUES ($title, $image, $target_url, $sort_order)",
      data,
    );
  }

  await persistDb(db);
};

export const deleteCategoryCover = async (id) => {
  const db = await getDb();
  runStatement(db, "DELETE FROM category_covers WHERE id = $id", { $id: id });
  await persistDb(db);
};

const syncPlacements = (db, productId, placements) => {
  runStatement(db, "DELETE FROM product_placements WHERE product_id = $product_id", { $product_id: productId });
  placements.forEach((placement) => {
    runStatement(
      db,
      `
        INSERT OR REPLACE INTO product_placements (product_id, section, sort_order)
        VALUES ($product_id, $section, 0)
      `,
      { $product_id: productId, $section: placement },
    );
  });
};

const getLastInsertId = (db) => rowsFromExec(db, "SELECT last_insert_rowid() AS id")[0]?.id;

export const listProducts = async () => {
  const db = await getDb();
  return rowsFromExec(
    db,
    `
      SELECT p.*, c.name AS category_name
      FROM store_products p
      LEFT JOIN product_categories c ON c.id = p.category_id
      ORDER BY p.sort_order ASC, p.id ASC
    `,
  ).map((product) => ({
    ...product,
    placements: rowsFromExec(
      db,
      "SELECT section FROM product_placements WHERE product_id = $product_id ORDER BY sort_order ASC, id ASC",
      { $product_id: product.id },
    ).map((placement) => placement.section),
  }));
};

export const getProductBySlug = async (slug) => {
  const products = await listProducts();
  return products.find((product) => product.slug === slug) || null;
};

export const upsertProduct = async (payload) => {
  const db = await getDb();
  const data = {
    $id: payload.id ? Number(payload.id) : null,
    $slug: payload.slug.trim(),
    $title: payload.title.trim(),
    $subtitle: String(payload.subtitle || "").trim(),
    $description: String(payload.description || "").trim(),
    $platform: String(payload.platform || "").trim(),
    $product_type: String(payload.product_type || "").trim(),
    $tab: String(payload.tab || "").trim(),
    $price_current: Number(payload.price_current || 0),
    $price_old: payload.price_old ? Number(payload.price_old) : null,
    $discount_label: String(payload.discount_label || "").trim(),
    $discount_expiry: String(payload.discount_expiry || "").trim(),
    $image: String(payload.image || "").trim(),
    $badge: String(payload.badge || "").trim(),
    $cta: String(payload.cta || "Səbətə at").trim(),
    $sort_order: Number(payload.sort_order || 0),
    $searchable: payload.searchable ? 1 : 0,
    $accent: payload.accent ? 1 : 0,
    $category_id: payload.category_id ? Number(payload.category_id) : null,
    $stock_quantity: Number(payload.stock_quantity || 0),
    $region: String(payload.region || "").trim(),
    $language: String(payload.language || "").trim(),
    $details_json: JSON.stringify(
      String(payload.details || "")
        .split("\n")
        .map((v) => v.trim())
        .filter(Boolean),
    ),
  };

  let productId = data.$id;

  if (productId) {
    runStatement(
      db,
      `
        UPDATE store_products
        SET slug=$slug, title=$title, subtitle=$subtitle, description=$description, platform=$platform,
            product_type=$product_type, tab=$tab, price_current=$price_current, price_old=$price_old,
            discount_label=$discount_label, discount_expiry=$discount_expiry, image=$image, badge=$badge,
            cta=$cta, sort_order=$sort_order, searchable=$searchable, accent=$accent,
            category_id=$category_id, stock_quantity=$stock_quantity, region=$region,
            language=$language, details_json=$details_json
        WHERE id=$id
      `,
      data,
    );
  } else {
    runStatement(
      db,
      `
        INSERT INTO store_products (
          slug, title, subtitle, description, platform, product_type, tab, price_current, price_old,
          discount_label, discount_expiry, image, badge, cta, sort_order, searchable, accent,
          category_id, stock_quantity, region, language, details_json
        ) VALUES (
          $slug, $title, $subtitle, $description, $platform, $product_type, $tab, $price_current, $price_old,
          $discount_label, $discount_expiry, $image, $badge, $cta, $sort_order, $searchable, $accent,
          $category_id, $stock_quantity, $region, $language, $details_json
        )
      `,
      data,
    );
    productId = getLastInsertId(db);
  }

  const placements = Array.isArray(payload.placements)
    ? payload.placements
    : payload.placements
      ? [payload.placements]
      : [];
  syncPlacements(db, productId, placements);
  await persistDb(db);
};

export const deleteProduct = async (id) => {
  const db = await getDb();
  syncPlacements(db, id, []);
  runStatement(db, "DELETE FROM store_products WHERE id = $id", { $id: id });
  await persistDb(db);
};

export const listUsers = async () =>
  rowsFromExec(await getDb(), "SELECT id, name, email, role, is_banned, balance, created_at FROM users ORDER BY created_at DESC");

export const createUser = async (data) => {
  const db = await getDb();
  runStatement(
    db,
    "INSERT INTO users (name, email, gsm, password, role) VALUES ($name, $email, $gsm, $password, $role)",
    {
      $name: data.name,
      $email: data.email,
      $gsm: data.gsm || null,
      $password: data.password,
      $role: data.role || 'user',
    }
  );
  await persistDb(db);
};

export const getUserByEmail = async (email) => {
  const db = await getDb();
  return rowsFromExec(db, "SELECT * FROM users WHERE email = $email LIMIT 1", { $email: email })[0] || null;
};

export const updateUserStatus = async (id, isBanned) => {
  const db = await getDb();
  runStatement(db, "UPDATE users SET is_banned = $is_banned WHERE id = $id", {
    $id: id,
    $is_banned: isBanned ? 1 : 0,
  });
  await persistDb(db);
};

export const updateUserBalance = async (id, balance) => {
  const db = await getDb();
  runStatement(db, "UPDATE users SET balance = $balance WHERE id = $id", {
    $id: id,
    $balance: Number(balance),
  });
  await persistDb(db);
};

export const updateUserInfo = async (id, data) => {
  const db = await getDb();
  if (data.password) {
    runStatement(
      db,
      "UPDATE users SET name = $name, email = $email, gsm = $gsm, password = $password WHERE id = $id",
      {
        $id: id,
        $name: data.name,
        $email: data.email,
        $gsm: data.gsm || null,
        $password: data.password,
      }
    );
  } else {
    runStatement(
      db,
      "UPDATE users SET name = $name, email = $email, gsm = $gsm WHERE id = $id",
      {
        $id: id,
        $name: data.name,
        $email: data.email,
        $gsm: data.gsm || null,
      }
    );
  }
  await persistDb(db);
};

export const getUserById = async (id) => {
  const db = await getDb();
  return rowsFromExec(db, "SELECT * FROM users WHERE id = $id LIMIT 1", { $id: id })[0] || null;
};

export const listOrders = async () => {
  const db = await getDb();
  return rowsFromExec(
    db,
    `
      SELECT o.*, p.title AS product_title
      FROM sales_orders o
      LEFT JOIN store_products p ON p.id = o.product_id
      ORDER BY o.created_at DESC
    `
  );
};

export const updateOrderStatus = async (id, paymentStatus, deliveryStatus) => {
  const db = await getDb();
  runStatement(
    db,
    "UPDATE sales_orders SET payment_status = $payment_status, delivery_status = $delivery_status WHERE id = $id",
    {
      $id: id,
      $payment_status: paymentStatus,
      $delivery_status: deliveryStatus,
    }
  );

  if (paymentStatus === 'approved' && deliveryStatus === 'delivered') {
    // Deliver keys
    const order = rowsFromExec(db, "SELECT product_id, item_count FROM sales_orders WHERE id = $id", { $id: id })[0];
    if (order) {
      const keys = rowsFromExec(db, "SELECT id FROM product_keys WHERE product_id = $product_id AND is_sold = 0 LIMIT $limit", {
        $product_id: order.product_id,
        $limit: order.item_count
      });
      
      for (const key of keys) {
        runStatement(db, "UPDATE product_keys SET is_sold = 1, order_id = $order_id WHERE id = $id", {
          $id: key.id,
          $order_id: id
        });
      }
    }
  }
  await persistDb(db);
};

export const getUserOrders = async (userId) => {
  const db = await getDb();
  const rows = rowsFromExec(
    db,
    `
      SELECT o.*, p.title AS product_title, p.image AS product_image
      FROM sales_orders o
      LEFT JOIN store_products p ON p.id = o.product_id
      WHERE o.user_id = $user_id
      ORDER BY o.created_at DESC
    `,
    { $user_id: userId }
  );

  const orders = [];
  for (const row of rows) {
    const keys = rowsFromExec(db, "SELECT pin_code FROM product_keys WHERE order_id = $order_id", { $order_id: row.id }).map(k => k.pin_code);
    orders.push({ ...row, keys });
  }
  return orders;
};

export const addProductKeys = async (productId, keysString) => {
  const db = await getDb();
  const keys = keysString.split("\n").map(k => k.trim()).filter(Boolean);
  for (const pin of keys) {
    runStatement(db, "INSERT INTO product_keys (product_id, pin_code) VALUES ($product_id, $pin_code)", {
      $product_id: productId,
      $pin_code: pin
    });
  }
  await persistDb(db);
};

export const getAdminDashboardStats = async () => {
  const db = await getDb();
  return {
    pageCount: rowsFromExec(db, "SELECT COUNT(*) AS count FROM admin_pages")[0]?.count ?? 0,
    productCount: rowsFromExec(db, "SELECT COUNT(*) AS count FROM store_products")[0]?.count ?? 0,
    userCount: rowsFromExec(db, "SELECT COUNT(*) AS count FROM users")[0]?.count ?? 0,
    salesCount: rowsFromExec(db, "SELECT COUNT(*) AS count FROM sales_orders WHERE payment_status = 'approved'")[0]?.count ?? 0,
    totalRevenue: rowsFromExec(db, "SELECT SUM(total_amount) AS total FROM sales_orders WHERE payment_status = 'approved'")[0]?.total ?? 0,
  };
};

export const buildPublicSiteData = async () => {
  const pages = (await listPages()).filter((page) => page.is_active);

  if (!pages.length) {
    return fallbackSiteData;
  }

  return {
    ...fallbackSiteData,
    categoryCovers: await listCategoryCovers(),
    navigation: [
      ...pages.map((page) => ({
        label: page.name,
        action: page.tab_key,
        icon: page.icon_key,
      })),
      {
        label: "Əlaqə",
        action: "contact",
        icon: "solar:chat-round-like-bold-duotone",
      },
    ],
    subHeaderLinks: pages.slice(0, 6).map((page) => ({
      label: page.name,
      action: page.tab_key,
    })),
    catalogTabs: Object.fromEntries(
      pages.map((page) => [
        page.tab_key,
        {
          eyebrow: page.eyebrow,
          title: page.title,
          description: page.description,
          chips: page.chips,
          filters: page.filters,
          banners: [],
        },
      ]),
    ),
    footerShopLinks: pages.map((page) => ({
      label: page.name,
      action: page.tab_key,
    })),
  };
};
