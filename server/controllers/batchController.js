const Batch = require('../models/Batch');

async function getBatches(req, res) {
  try {
    const batches = await Batch.getBatchesByFarmer(req.user.id);
    res.json(batches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
}

async function createBatch(req, res) {
  const { batch_id, product_name, origin, harvest_date, quantity, unit } = req.body;
  if (!batch_id || !product_name || !origin || !harvest_date || !quantity || !unit)
    return res.status(400).json({ message: 'All fields are required.' });

  try {
    const batch = await Batch.createBatch({
      batch_id,
      product_name,
      origin,
      harvest_date,
      quantity,
      unit,
      farmer_id: req.user.id,
    });
    res.status(201).json(batch);
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

module.exports = { getBatches, createBatch, getNextBatchId };
