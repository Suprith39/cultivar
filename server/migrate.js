require('dotenv').config();
const db = require('./db');

async function migrate() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      name       VARCHAR(100) NOT NULL,
      email      VARCHAR(150) UNIQUE NOT NULL,
      password   VARCHAR(255) NOT NULL,
      role       VARCHAR(20) NOT NULL CHECK (role IN ('farmer', 'manufacturer', 'consumer', 'logistics_agent')),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS batches (
      id                 SERIAL PRIMARY KEY,
      batch_id           VARCHAR(50) UNIQUE NOT NULL,
      product_name       VARCHAR(150) NOT NULL,
      origin             VARCHAR(200) NOT NULL,
      harvest_date       DATE NOT NULL,
      quantity           NUMERIC(10, 2) NOT NULL,
      unit               VARCHAR(20) NOT NULL CHECK (unit IN ('kg', 'tons', 'liters')),
      farmer_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status             VARCHAR(50) NOT NULL DEFAULT 'harvested',
      qr_code            TEXT,
      farm_photo         TEXT,
      crop_photo         TEXT,
      verification_video TEXT,
      farm_captured_at   TIMESTAMP,
      crop_captured_at   TIMESTAMP,
      liveness_verified  BOOLEAN DEFAULT false,
      is_verified        BOOLEAN DEFAULT false,
      created_at         TIMESTAMP DEFAULT NOW()
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS batch_events (
      id         SERIAL PRIMARY KEY,
      batch_id   INTEGER NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
      type       VARCHAR(50) NOT NULL,
      lat        DECIMAL,
      lng        DECIMAL,
      place_name TEXT,
      user_id    INTEGER REFERENCES users(id),
      timestamp  TIMESTAMP DEFAULT NOW()
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS farmer_ratings (
      id           SERIAL PRIMARY KEY,
      farmer_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      consumer_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      batch_id     INTEGER NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
      rating       INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      review       TEXT NOT NULL,
      review_photo TEXT,
      created_at   TIMESTAMP DEFAULT NOW(),
      UNIQUE(consumer_id, batch_id)
    );
  `);

  const alterColumns = [
    `ALTER TABLE batches ADD COLUMN IF NOT EXISTS qr_code TEXT`,
    `ALTER TABLE batches ADD COLUMN IF NOT EXISTS farm_photo TEXT`,
    `ALTER TABLE batches ADD COLUMN IF NOT EXISTS crop_photo TEXT`,
    `ALTER TABLE batches ADD COLUMN IF NOT EXISTS verification_video TEXT`,
    `ALTER TABLE batches ADD COLUMN IF NOT EXISTS farm_captured_at TIMESTAMP`,
    `ALTER TABLE batches ADD COLUMN IF NOT EXISTS crop_captured_at TIMESTAMP`,
    `ALTER TABLE batches ADD COLUMN IF NOT EXISTS liveness_verified BOOLEAN DEFAULT false`,
    `ALTER TABLE batches ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false`,
    `ALTER TABLE batches ADD COLUMN IF NOT EXISTS image_url VARCHAR(500)`,
    `ALTER TABLE batches ADD COLUMN IF NOT EXISTS ai_confidence NUMERIC`,
    `ALTER TABLE batches ADD COLUMN IF NOT EXISTS product_match BOOLEAN`,
    `ALTER TABLE batches ADD COLUMN IF NOT EXISTS quality_check BOOLEAN`,
    `ALTER TABLE batches ADD COLUMN IF NOT EXISTS quantity_check BOOLEAN`,
    `ALTER TABLE batches ADD COLUMN IF NOT EXISTS verification_note TEXT`,
    `ALTER TABLE batches ADD COLUMN IF NOT EXISTS verified_by INTEGER REFERENCES users(id)`,
    `ALTER TABLE batches ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP`,
    `ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check`,
    `ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('farmer', 'manufacturer', 'consumer', 'logistics_agent'))`,
    `ALTER TABLE batches DROP CONSTRAINT IF EXISTS batches_status_check`,
    `ALTER TABLE batches ADD CONSTRAINT batches_status_check CHECK (status IN ('harvested', 'processing', 'packaged', 'in_transit', 'verified', 'rejected'))`,
  ];

  for (const sql of alterColumns) {
    await db.query(sql);
  }

  console.log('Migration complete.');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
