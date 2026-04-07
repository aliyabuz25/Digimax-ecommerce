let dbPromise;

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

      const response = await fetch("/navigation.db");
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

export const mapProductRow = (row) => ({
  ...row,
  accent: Boolean(row.accent),
  searchable: Boolean(row.searchable),
  price: `${Number(row.price_current).toLocaleString("az-AZ")} ₼`,
  oldPrice:
    row.price_old !== null && row.price_old !== undefined
      ? `${Number(row.price_old).toLocaleString("az-AZ")} ₼`
      : null,
  discount: row.discount_label || null,
  image: row.image || "/digimax_app_logo_icon.png",
  badge: row.badge || null,
  cta: row.cta || "Səbətə at",
});
