const db = require('../db');

async function getBatchesByFarmer(farmerId) {
  const result = await db.query(
    `SELECT b.*, u.name as farmer_name
     FROM batches b
     JOIN users u ON b.farmer_id = u.id
     WHERE b.farmer_id = $1
     ORDER BY b.created_at DESC`,
    [farmerId]
  );
  return result.rows;
}

async function getBatchById(batchId) {
  const result = await db.query(
    `SELECT b.*, u.name as farmer_name
     FROM batches b
     JOIN users u ON b.farmer_id = u.id
     WHERE b.batch_id = $1`,
    [batchId]
  );
  return result.rows[0] || null;
}

async function createBatch({
  batch_id, product_name, origin, harvest_date, quantity, unit, farmer_id, qr_code,
  farm_photo, crop_photo, verification_video, farm_captured_at, crop_captured_at, liveness_verified
}) {
  const is_verified = !!(farm_photo && crop_photo && liveness_verified);

  const result = await db.query(
    `INSERT INTO batches
      (batch_id, product_name, origin, harvest_date, quantity, unit, farmer_id, status, qr_code,
       farm_photo, crop_photo, verification_video, farm_captured_at, crop_captured_at, liveness_verified, is_verified)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'harvested',$8,$9,$10,$11,$12,$13,$14,$15)
     RETURNING *`,
    [
      batch_id, product_name, origin, harvest_date, quantity, unit, farmer_id, qr_code,
      farm_photo || null, crop_photo || null, verification_video || null,
      farm_captured_at || null, crop_captured_at || null,
      liveness_verified || false, is_verified
    ]
  );
  return result.rows[0];
}

async function updateBatchStatus(batchId, status) {
  const result = await db.query(
    `UPDATE batches SET status = $1 WHERE batch_id = $2 RETURNING *`,
    [status, batchId]
  );
  return result.rows[0] || null;
}

async function getNextBatchNumber(farmerId) {
  const result = await db.query(
    'SELECT COUNT(*) FROM batches WHERE farmer_id = $1',
    [farmerId]
  );
  return parseInt(result.rows[0].count, 10) + 1;
}

async function getPublicBatch(batchId) {
  const result = await db.query(
    `SELECT b.batch_id, b.product_name, b.origin, b.harvest_date, b.quantity, b.unit,
            b.status, b.is_verified, b.farm_photo, b.crop_photo, b.farm_lat, b.farm_lng,
            b.photo_taken_at, b.created_at, b.farmer_id, u.name as farmer_name
     FROM batches b
     JOIN users u ON b.farmer_id = u.id
     WHERE b.batch_id = $1`,
    [batchId]
  );
  return result.rows[0] || null;
}

module.exports = { getBatchesByFarmer, getBatchById, getPublicBatch, createBatch, updateBatchStatus, getNextBatchNumber };
