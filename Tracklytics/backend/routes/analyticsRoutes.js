const express = require('express');
const router = express.Router();
const { getDailyAnalytics, getWeeklyAnalytics, getWebsitesBreakdown } = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

router.get('/daily', protect, getDailyAnalytics);
router.get('/weekly', protect, getWeeklyAnalytics);
router.get('/websites', protect, getWebsitesBreakdown);

module.exports = router;
