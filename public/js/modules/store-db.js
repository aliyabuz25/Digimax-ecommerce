let dbPromise;

const normalizeImageUrl = (image) => {
  if (!image) return "/digimax_app_logo_icon.png";

  const value = String(image)
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)[0] || "";

  if (
    value.startsWith("/") ||
    value.startsWith("data:") ||
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    const simpleIconsMatch = value.match(
      /^https:\/\/cdn\.simpleicons\.org\/([^/]+)\/([A-Fa-f0-9]{3,8})$/,
    );

    if (simpleIconsMatch) {
      const [, iconName, color] = simpleIconsMatch;
      return `https://api.iconify.design/simple-icons:${iconName}.svg?color=%23${color.toLowerCase()}`;
    }

    return value;
  }

  return "/digimax_app_logo_icon.png";
};

const rowsFromExec = (db, query) => {
  const result = db.exec(query)[0];
  if (!result) return [];

  return result.values.map((row) =>
    Object.fromEntries(result.columns.map((column, index) => [column, row[index]])),
  );
};

export const loadStoreDb = async () => {
  if (!dbPromise) {
    dbPromise = (async () => {
      if (!window.initSqlJs) {
        throw new Error("sql.js is not loaded");
      }

      const SQL = await window.initSqlJs({
        locateFile: (file) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`,
      });

      const response = await fetch("/navigation.db?v=" + new Date().getTime(), { cache: "no-store" });
      const buffer = await response.arrayBuffer();
      return new SQL.Database(new Uint8Array(buffer));
    })();
  }

  return dbPromise;
};

export const queryStoreRows = async (query) => {
  const db = await loadStoreDb();
  return rowsFromExec(db, query);
};

export const mapProductRow = (row) => {
  const currentPrice =
    row.price_current !== null && row.price_current !== undefined
      ? `${Number(row.price_current).toLocaleString("az-AZ")} ₼`
      : row.price || null;

  return {
    ...row,
    accent: Boolean(row.accent),
    searchable: Boolean(row.searchable),
    price: currentPrice,
    newPrice: currentPrice,
    oldPrice:
      row.price_old !== null && row.price_old !== undefined
        ? `${Number(row.price_old).toLocaleString("az-AZ")} ₼`
        : null,
    discount: row.discount_label || null,
    image: normalizeImageUrl(row.image),
    badge: row.badge || null,
    cta: row.cta || "Səbətə at",
  };
};
