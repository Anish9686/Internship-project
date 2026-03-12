const express = require('express');
const router = express.Router();
const { recordActivity } = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, recordActivity);

module.exports = router;
