const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { getBatches, getBatchById, createBatch, updateBatchStatus, getNextBatchId } = require('../controllers/batchController');

router.get('/next-id', verifyToken, getNextBatchId);
router.get('/', verifyToken, getBatches);
router.post('/', verifyToken, createBatch);
router.get('/:batchId', verifyToken, getBatchById);
router.patch('/:batchId/status', verifyToken, updateBatchStatus);

module.exports = router;
