const Activity = require('../models/Activity');

// @desc    Record browsing activity
// @route   POST /activity
// @access  Private
const recordActivity = async (req, res) => {
    try {
        const { activityData } = req.body;

        // activityData should be an array of objects
        // [{ website, category, startTime, endTime, duration }]

        if (!activityData || !Array.isArray(activityData) || activityData.length === 0) {
            return res.status(400).json({ message: 'No activity data provided' });
        }

        const activitiesToInsert = activityData.map(item => ({
            ...item,
            userId: req.user._id
        }));

        await Activity.insertMany(activitiesToInsert);

        res.status(201).json({ message: 'Activity recorded successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get daily analytics
// @route   GET /analytics/daily
// @access  Private
const getDailyAnalytics = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activities = await Activity.find({
            userId: req.user._id,
            startTime: { $gte: today }
        });

        let totalBrowsingTime = 0;
        let productiveTime = 0;
        let unproductiveTime = 0;

        activities.forEach(activity => {
            totalBrowsingTime += activity.duration;
            if (activity.category === 'Productive') productiveTime += activity.duration;
            if (activity.category === 'Unproductive') unproductiveTime += activity.duration;
        });

        res.json({
            totalBrowsingTime,
            productiveTime,
            unproductiveTime,
            date: today
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get weekly analytics
// @route   GET /analytics/weekly
// @access  Private
const getWeeklyAnalytics = async (req, res) => {
    try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        oneWeekAgo.setHours(0, 0, 0, 0);

        const activities = await Activity.aggregate([
            {
                $match: {
                    userId: req.user._id,
                    startTime: { $gte: oneWeekAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
                    productiveTime: {
                        $sum: { $cond: [{ $eq: ["$category", "Productive"] }, "$duration", 0] }
                    },
                    unproductiveTime: {
                        $sum: { $cond: [{ $eq: ["$category", "Unproductive"] }, "$duration", 0] }
                    },
                    totalTime: { $sum: "$duration" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get website breakdwon
// @route   GET /analytics/websites
// @access  Private
const getWebsitesBreakdown = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const breakdown = await Activity.aggregate([
            {
                $match: {
                    userId: req.user._id,
                    startTime: { $gte: today }
                }
            },
            {
                $group: {
                    _id: "$website",
                    category: { $first: "$category" },
                    timeSpent: { $sum: "$duration" }
                }
            },
            { $sort: { timeSpent: -1 } }
        ]);

        res.json(breakdown);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    recordActivity,
    getDailyAnalytics,
    getWeeklyAnalytics,
    getWebsitesBreakdown
};
