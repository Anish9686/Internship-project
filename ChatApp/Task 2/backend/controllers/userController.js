import userService from '../services/userService.js';
import { sendResponse } from '../utils/responseHandler.js';

// @desc    Get all users
// @route   GET /api/users
export const getUsers = async (req, res, next) => {
    try {
        const users = await userService.getAllUsers(req.user._id);
        return sendResponse(res, 200, users, 'Users retrieved');
    } catch (error) {
        next(error);
    }
};

// @desc    Search users
// @route   GET /api/users/search?q=...
export const searchUsers = async (req, res, next) => {
    try {
        const users = await userService.searchUsers(req.query.q, req.user._id);
        return sendResponse(res, 200, users, 'Users found');
    } catch (error) {
        next(error);
    }
};

// @desc    Update user status
// @route   PUT /api/users/status
export const updateStatus = async (req, res, next) => {
    try {
        const user = await userService.updateStatus(req.user._id, req.body.status);
        return sendResponse(res, 200, user, 'Status updated');
    } catch (error) {
        next(error);
    }
};
