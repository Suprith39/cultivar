const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { getBatches, createBatch, getNextBatchId } = require('../controllers/batchController');

router.get('/', verifyToken, getBatches);
router.post('/', verifyToken, createBatch);
router.get('/next-id', verifyToken, getNextBatchId);

module.exports = router;
