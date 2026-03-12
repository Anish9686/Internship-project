import authService from '../services/authService.js';
import { sendResponse, sendError } from '../utils/responseHandler.js';

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req, res, next) => {
    try {
        const result = await authService.register(req.body);

        res.cookie('token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return sendResponse(res, 201, result, 'User registered successfully');
    } catch (error) {
        next(error);
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
export const authUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);

        res.cookie('token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return sendResponse(res, 200, result, 'Login successful');
    } catch (error) {
        next(error);
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
export const logoutUser = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    return sendResponse(res, 200, null, 'Logged out successfully');
};

// @desc    Get user profile
// @route   GET /api/auth/profile
export const getUserProfile = async (req, res, next) => {
    try {
        const user = await authService.getProfile(req.user._id);
        if (!user) return sendError(res, 404, 'User not found');

        return sendResponse(res, 200, user, 'Profile retrieved');
    } catch (error) {
        next(error);
    }
};
