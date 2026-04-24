const Batch = require('../models/Batch');

async function verifyBatch(req, res) {
  try {
    const batch = await Batch.getPublicBatch(req.params.batchId);
    if (!batch) return res.status(404).json({ message: 'Batch not found.' });

    // Fetch transit events
    const eventsResult = await require('../db').query(
      `SELECT be.type, be.lat, be.lng, be.place_name, be.timestamp, u.name as agent_name
       FROM batch_events be
       LEFT JOIN users u ON be.user_id = u.id
       JOIN batches b ON be.batch_id = b.id
       WHERE b.batch_id = $1
       ORDER BY be.timestamp ASC`,
      [req.params.batchId]
    );

    res.json({ ...batch, events: eventsResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
}

module.exports = { verifyBatch };
