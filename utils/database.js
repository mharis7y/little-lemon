// utils/database.js
// All SQLite operations for the Little Lemon app

/**
 * Creates the menu table if it doesn't exist.
 * @param {import('expo-sqlite').SQLiteDatabase} db
 */
export async function createTable(db) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS menu (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      image TEXT,
      category TEXT
    );
  `);
}

/**
 * Retrieves all menu items from the database.
 * @param {import('expo-sqlite').SQLiteDatabase} db
 * @returns {Promise<Array>}
 */
export async function getMenuItems(db) {
  return await db.getAllAsync('SELECT * FROM menu;');
}

/**
 * Saves an array of menu items to the database.
 * @param {import('expo-sqlite').SQLiteDatabase} db
 * @param {Array} items
 */
export async function saveMenuItems(db, items) {
  const statement = await db.prepareAsync(
    'INSERT OR IGNORE INTO menu (name, price, description, image, category) VALUES ($name, $price, $description, $image, $category);'
  );
  try {
    for (const item of items) {
      await statement.executeAsync({
        $name: item.name,
        $price: item.price,
        $description: item.description ?? '',
        $image: item.image ?? '',
        $category: item.category ?? '',
      });
    }
  } finally {
    await statement.finalizeAsync();
  }
}

/**
 * Filters menu items by active categories and a text query.
 * Both filters are ANDed together.
 * @param {import('expo-sqlite').SQLiteDatabase} db
 * @param {string[]} categories  - array of active category names (empty = all)
 * @param {string} query         - text search string
 * @returns {Promise<Array>}
 */
export async function filterMenuItems(db, categories, query) {
  const conditions = [];
  const params = {};

  if (query && query.trim().length > 0) {
    conditions.push('name LIKE $query');
    params.$query = `%${query.trim()}%`;
  }

  if (categories && categories.length > 0) {
    // Build placeholders like ($cat0, $cat1, ...)
    const placeholders = categories
      .map((_, i) => `$cat${i}`)
      .join(', ');
    conditions.push(`category IN (${placeholders})`);
    categories.forEach((cat, i) => {
      params[`$cat${i}`] = cat;
    });
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  return await db.getAllAsync(`SELECT * FROM menu ${whereClause};`, params);
}
