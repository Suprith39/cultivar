const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      name       VARCHAR(255) NOT NULL,
      email      VARCHAR(255) UNIQUE NOT NULL,
      password   VARCHAR(255) NOT NULL,
      role       VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS batches (
      id                 SERIAL PRIMARY KEY,
      batch_id           VARCHAR(255) UNIQUE NOT NULL,
      product_name       VARCHAR(255) NOT NULL,
      origin             VARCHAR(255) NOT NULL,
      harvest_date       DATE,
      quantity           DECIMAL,
      unit               VARCHAR(50),
      farmer_id          INTEGER REFERENCES users(id),
      status             VARCHAR(50) DEFAULT 'harvested',
      qr_code            TEXT,
      farm_photo         TEXT,
      crop_photo         TEXT,
      farm_captured_at   TIMESTAMP,
      crop_captured_at   TIMESTAMP,
      liveness_verified  BOOLEAN DEFAULT false,
      is_verified        BOOLEAN DEFAULT false,
      created_at         TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log('Database initialization complete.');
}

module.exports = { initializeDatabase };
