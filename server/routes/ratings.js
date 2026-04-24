const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { submitRating, getFarmerRatings, checkExistingRating } = require('../controllers/ratingController');

router.post('/submit', verifyToken, submitRating);
router.get('/farmer/:farmerId', getFarmerRatings);
router.get('/check/:batchId', verifyToken, checkExistingRating);

module.exports = router;
