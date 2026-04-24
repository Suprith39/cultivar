const QRCode = require('qrcode');
const Batch = require('../models/Batch');

const ALLOWED_STATUSES = ['harvested', 'processing', 'packaged'];

async function getBatches(req, res) {
  try {
    const batches = await Batch.getBatchesByFarmer(req.user.id);
    res.json(batches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
}

async function getBatchById(req, res) {
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
    farm_photo, crop_photo, verification_video, farm_lat, farm_lng, photo_taken_at
  } = req.body;

  if (!batch_id || !product_name || !origin || !harvest_date || !quantity || !unit)
    return res.status(400).json({ message: 'All fields are required.' });

  try {
    const qr_code = await QRCode.toDataURL(batch_id);
    const batch = await Batch.createBatch({
      batch_id, product_name, origin, harvest_date, quantity, unit,
      farmer_id: req.user.id, qr_code,
      farm_photo, crop_photo, verification_video, farm_lat, farm_lng, photo_taken_at
    });
    res.status(201).json(batch);
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

module.exports = { getBatches, getBatchById, createBatch, updateBatchStatus, getNextBatchId };
