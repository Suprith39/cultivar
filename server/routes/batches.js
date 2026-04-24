const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const {
  getBatches, getAllBatches, getBatchById, getBatchByBatchId,
  createBatch, analyzeImage, verifyBatch, updateBatchStatus, getNextBatchId
} = require('../controllers/batchController');

router.get('/next-id', verifyToken, getNextBatchId);
router.get('/all', verifyToken, getAllBatches);
router.get('/', verifyToken, getBatches);
router.post('/', verifyToken, createBatch);
router.get('/:id/by-id', verifyToken, getBatchById);
router.post('/:id/analyze', verifyToken, analyzeImage);
router.put('/verify/:id', verifyToken, verifyBatch);
router.get('/:batchId', verifyToken, getBatchByBatchId);
router.patch('/:batchId/status', verifyToken, updateBatchStatus);

module.exports = router;
