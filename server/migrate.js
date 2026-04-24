require('dotenv').config();
const db = require('./db');

async function migrate() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      name       VARCHAR(100) NOT NULL,
      email      VARCHAR(150) UNIQUE NOT NULL,
      password   VARCHAR(255) NOT NULL,
      role       VARCHAR(20) NOT NULL CHECK (role IN ('farmer', 'manufacturer')),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS batches (
      id           SERIAL PRIMARY KEY,
      batch_id     VARCHAR(50) UNIQUE NOT NULL,
      product_name VARCHAR(150) NOT NULL,
      origin       VARCHAR(200) NOT NULL,
      harvest_date DATE NOT NULL,
      quantity     NUMERIC(10, 2) NOT NULL,
      unit         VARCHAR(20) NOT NULL CHECK (unit IN ('kg', 'tons', 'liters')),
      farmer_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status       VARCHAR(50) NOT NULL DEFAULT 'harvested',
      created_at   TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log('Migration complete.');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
