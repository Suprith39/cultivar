const db = require('../db');

async function submitRating(req, res) {
  if (req.user.role !== 'consumer')
    return res.status(403).json({ message: 'Only consumers can submit ratings.' });

  const { farmerId, batchId, rating, review, reviewPhoto } = req.body;

  if (!farmerId || !batchId || !rating || !review)
    return res.status(400).json({ message: 'farmerId, batchId, rating, and review are required.' });

  if (rating < 1 || rating > 5)
    return res.status(400).json({ message: 'Rating must be between 1 and 5.' });

  if (review.trim().length < 10)
    return res.status(400).json({ message: 'Review must be at least 10 characters.' });

  try {
    // Get batch row id from batch_id string
    const batchResult = await db.query('SELECT id FROM batches WHERE batch_id = $1', [batchId]);
    if (!batchResult.rows[0]) return res.status(404).json({ message: 'Batch not found.' });
    const batchRowId = batchResult.rows[0].id;

    const result = await db.query(
      `INSERT INTO farmer_ratings (farmer_id, consumer_id, batch_id, rating, review, review_photo)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [farmerId, req.user.id, batchRowId, rating, review.trim(), reviewPhoto || null]
    );
    res.status(201).json({ message: 'Review submitted successfully.', rating: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ message: 'You have already rated this batch.' });
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
}

async function getFarmerRatings(req, res) {
  try {
    const { farmerId } = req.params;

    const statsResult = await db.query(
      `SELECT COUNT(*) as total, AVG(rating)::NUMERIC(3,1) as average FROM farmer_ratings WHERE farmer_id = $1`,
      [farmerId]
    );

    const reviewsResult = await db.query(
      `SELECT fr.id, fr.rating, fr.review, fr.review_photo, fr.created_at,
              u.name as consumer_name, b.batch_id
       FROM farmer_ratings fr
       JOIN users u ON fr.consumer_id = u.id
       JOIN batches b ON fr.batch_id = b.id
       WHERE fr.farmer_id = $1
       ORDER BY fr.created_at DESC`,
      [farmerId]
    );

    const distResult = await db.query(
      `SELECT rating, COUNT(*) as count FROM farmer_ratings WHERE farmer_id = $1 GROUP BY rating`,
      [farmerId]
    );

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distResult.rows.forEach(r => { distribution[r.rating] = parseInt(r.count); });

    res.json({
      average: parseFloat(statsResult.rows[0].average) || 0,
      total: parseInt(statsResult.rows[0].total),
      distribution,
      reviews: reviewsResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
}

async function checkExistingRating(req, res) {
  if (req.user.role !== 'consumer') return res.json({ rated: false });
  try {
    const batchResult = await db.query('SELECT id FROM batches WHERE batch_id = $1', [req.params.batchId]);
    if (!batchResult.rows[0]) return res.json({ rated: false });

    const result = await db.query(
      'SELECT * FROM farmer_ratings WHERE consumer_id = $1 AND batch_id = $2',
      [req.user.id, batchResult.rows[0].id]
    );
    res.json({ rated: result.rows.length > 0, existing: result.rows[0] || null });
  } catch (err) {
    console.error(err);
    res.json({ rated: false });
  }
}

module.exports = { submitRating, getFarmerRatings, checkExistingRating };
