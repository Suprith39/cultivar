const QRCode = require('qrcode');
const Batch = require('../models/Batch');
const db = require('../db');
const fetch = require('node-fetch');

const ALLOWED_STATUSES = ['harvested', 'processing', 'packaged', 'in_transit', 'verified', 'rejected'];

async function getBatches(req, res) {
  try {
    const batches = await Batch.getBatchesByFarmer(req.user.id);
    res.json(batches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
}

async function getAllBatches(req, res) {
  if (req.user.role !== 'manufacturer')
    return res.status(403).json({ message: 'Only manufacturers can view all batches.' });
  try {
    const result = await db.query(
      `SELECT b.*, u.name as farmer_name, u.email as farmer_email
       FROM batches b
       JOIN users u ON b.farmer_id = u.id
       ORDER BY b.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
}

async function getBatchById(req, res) {
  try {
    const result = await db.query(
      `SELECT b.*, u.name as farmer_name, u.email as farmer_email
       FROM batches b JOIN users u ON b.farmer_id = u.id
       WHERE b.id = $1`,
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Batch not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
}

async function getBatchByBatchId(req, res) {
  try {
    const batch = await Batch.getBatchById(req.params.batchId);
    if (!batch) return res.status(404).json({ message: 'Batch not found.' });
    res.json(batch);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
}

async function createBatch(req, res) {
  const {
    batch_id, product_name, origin, harvest_date, quantity, unit,
    farm_photo, crop_photo, verification_video,
    farm_captured_at, crop_captured_at, liveness_verified
  } = req.body;

  if (!batch_id || !product_name || !origin || !harvest_date || !quantity || !unit)
    return res.status(400).json({ message: 'All fields are required.' });

  try {
    const qr_code = await QRCode.toDataURL(batch_id);
    const batch = await Batch.createBatch({
      batch_id, product_name, origin, harvest_date, quantity, unit,
      farmer_id: req.user.id, qr_code,
      farm_photo, crop_photo, verification_video,
      farm_captured_at, crop_captured_at, liveness_verified
    });
    res.status(201).json(batch);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
}

async function analyzeImage(req, res) {
  if (req.user.role !== 'manufacturer')
    return res.status(403).json({ message: 'Only manufacturers can analyze images.' });

  try {
    const batchResult = await db.query('SELECT * FROM batches WHERE id = $1', [req.params.id]);
    const batch = batchResult.rows[0];
    if (!batch) return res.status(404).json({ message: 'Batch not found.' });

    // Use provided image, or fall back to batch photos
    const imageData = req.body.image || batch.crop_photo || batch.farm_photo;
    if (!imageData) return res.status(400).json({ message: 'No image available. Please upload an image to analyze.' });

    const aiRes = await fetch('http://localhost:5001/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageData }),
    });

    if (!aiRes.ok) throw new Error('AI service error');
    const aiData = await aiRes.json();

    // Save confidence score
    await db.query('UPDATE batches SET ai_confidence = $1 WHERE id = $2', [aiData.confidenceScore, req.params.id]);

    res.json(aiData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'AI service unavailable. Please ensure the AI service is running.' });
  }
}

async function verifyBatch(req, res) {
  if (req.user.role !== 'manufacturer')
    return res.status(403).json({ message: 'Only manufacturers can verify batches.' });

  const { productMatch, qualityCheck, quantityCheck, verificationNote } = req.body;
  const allPassed = productMatch && qualityCheck && quantityCheck;
  const newStatus = allPassed ? 'verified' : 'rejected';

  try {
    const result = await db.query(
      `UPDATE batches SET
        product_match = $1, quality_check = $2, quantity_check = $3,
        verification_note = $4, status = $5,
        verified_by = $6, verified_at = NOW()
       WHERE id = $7 RETURNING *`,
      [productMatch, qualityCheck, quantityCheck, verificationNote || null, newStatus, req.user.id, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Batch not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
}

async function updateBatchStatus(req, res) {
  if (req.user.role !== 'manufacturer')
    return res.status(403).json({ message: 'Only manufacturers can update batch status.' });

  const { status } = req.body;
  if (!ALLOWED_STATUSES.includes(status))
    return res.status(400).json({ message: `Status must be one of: ${ALLOWED_STATUSES.join(', ')}` });

  try {
    const batch = await Batch.updateBatchStatus(req.params.batchId, status);
    if (!batch) return res.status(404).json({ message: 'Batch not found.' });
    res.json(batch);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
}

async function getNextBatchId(req, res) {
  try {
    const next = await Batch.getNextBatchNumber(req.user.id);
    const batchId = `BATCH-${String(next).padStart(3, '0')}`;
    res.json({ batchId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
}

module.exports = {
  getBatches, getAllBatches, getBatchById, getBatchByBatchId,
  createBatch, analyzeImage, verifyBatch, updateBatchStatus, getNextBatchId
};
