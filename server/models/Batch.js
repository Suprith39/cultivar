const db = require('../db');

async function getBatchesByFarmer(farmerId) {
  const result = await db.query(
    `SELECT * FROM batches WHERE farmer_id = $1 ORDER BY created_at DESC`,
    [farmerId]
  );
  return result.rows;
}

async function createBatch({ batch_id, product_name, origin, harvest_date, quantity, unit, farmer_id }) {
  const result = await db.query(
    `INSERT INTO batches (batch_id, product_name, origin, harvest_date, quantity, unit, farmer_id, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'harvested')
     RETURNING *`,
    [batch_id, product_name, origin, harvest_date, quantity, unit, farmer_id]
  );
  return result.rows[0];
}

async function getNextBatchNumber(farmerId) {
  const result = await db.query(
    'SELECT COUNT(*) FROM batches WHERE farmer_id = $1',
    [farmerId]
  );
  return parseInt(result.rows[0].count, 10) + 1;
}

module.exports = { getBatchesByFarmer, createBatch, getNextBatchNumber };
