import User from '../models/userModel.js';
import logger from '../config/logger.js';

class UserService {
    async getAllUsers(excludeUserId) {
        return await User.find({ _id: { $ne: excludeUserId } }).select('-password');
    }

    async searchUsers(query, excludeUserId) {
        return await User.find({
            $and: [
                { _id: { $ne: excludeUserId } },
                {
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { email: { $regex: query, $options: 'i' } },
                    ],
                },
            ],
        }).select('-password');
    }

    async updateStatus(userId, status) {
        logger.info(`User ${userId} status updated to ${status}`);
        return await User.findByIdAndUpdate(
            userId,
            { status, lastSeen: Date.now() },
            { new: true }
        );
    }
}

export default new UserService();
