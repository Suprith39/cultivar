const db = require('../db');

async function updateLocation(req, res) {
  if (req.user.role !== 'logistics_agent')
    return res.status(403).json({ message: 'Only logistics agents can update location.' });

  const { batchId, location } = req.body;
  if (!batchId) return res.status(400).json({ message: 'batchId is required.' });

  try {
    // Find batch by batch_id string
    const batchResult = await db.query('SELECT id FROM batches WHERE batch_id = $1', [batchId]);
    if (!batchResult.rows[0]) return res.status(404).json({ message: 'Batch not found.' });

    const batchRowId = batchResult.rows[0].id;

    // Insert event
    const eventResult = await db.query(
      `INSERT INTO batch_events (batch_id, type, lat, lng, place_name, user_id)
       VALUES ($1, 'IN_TRANSIT', $2, $3, $4, $5)
       RETURNING *`,
      [batchRowId, location?.lat || null, location?.lng || null, location?.placeName || null, req.user.id]
    );

    // Update batch status
    await db.query("UPDATE batches SET status = 'in_transit' WHERE id = $1", [batchRowId]);

    res.json({ message: 'Location updated successfully.', event: eventResult.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
}

async function getLastLocation(req, res) {
  try {
    const batchResult = await db.query('SELECT id FROM batches WHERE batch_id = $1', [req.params.batchId]);
    if (!batchResult.rows[0]) return res.status(404).json({ message: 'Batch not found.' });

    const batchRowId = batchResult.rows[0].id;
    const result = await db.query(
      `SELECT be.*, u.name as agent_name
       FROM batch_events be
       LEFT JOIN users u ON be.user_id = u.id
       WHERE be.batch_id = $1
       ORDER BY be.timestamp DESC
       LIMIT 1`,
      [batchRowId]
    );

    if (!result.rows[0]) return res.status(404).json({ message: 'No location events found.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
}

async function getAllEvents(req, res) {
  try {
    const batchResult = await db.query('SELECT id FROM batches WHERE batch_id = $1', [req.params.batchId]);
    if (!batchResult.rows[0]) return res.status(404).json({ message: 'Batch not found.' });

    const result = await db.query(
      `SELECT be.*, u.name as agent_name
       FROM batch_events be
       LEFT JOIN users u ON be.user_id = u.id
       WHERE be.batch_id = $1
       ORDER BY be.timestamp ASC`,
      [batchResult.rows[0].id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
}

module.exports = { updateLocation, getLastLocation, getAllEvents };
