const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { updateLocation, getLastLocation, getAllEvents } = require('../controllers/logisticsController');

router.post('/update-location', verifyToken, updateLocation);
router.get('/last-location/:batchId', verifyToken, getLastLocation);
router.get('/events/:batchId', verifyToken, getAllEvents);

module.exports = router;
