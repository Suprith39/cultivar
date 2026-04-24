const express = require('express');
const router = express.Router();
const { verifyBatch } = require('../controllers/verifyController');

// Public route — no JWT required
router.get('/:batchId', verifyBatch);

module.exports = router;
