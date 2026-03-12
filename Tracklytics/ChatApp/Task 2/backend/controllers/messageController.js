import messageService from '../services/messageService.js';
import { sendResponse, sendError } from '../utils/responseHandler.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configure Cloudinary if keys are present
if (process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name') {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

// @desc    Send a message
// @route   POST /api/messages
export const sendMessage = async (req, res, next) => {
    try {
        const message = await messageService.sendMessage(req.user._id, req.body);
        return sendResponse(res, 201, message, 'Message sent successfully');
    } catch (error) {
        next(error);
    }
};

// @desc    Upload a file
// @route   POST /api/messages/upload
export const uploadFile = async (req, res, next) => {
    try {
        if (!req.file) {
            return sendError(res, 400, 'No file uploaded');
        }

        let fileUrl;

        // Try Cloudinary if configured
        if (process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name') {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'chatapp_uploads',
            });
            fileUrl = result.secure_url;
            // Remove local file after upload to Cloudinary
            fs.unlinkSync(req.file.path);
        } else {
            // Local storage fallback
            const protocol = req.protocol;
            const host = req.get('host');
            fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
        }

        return sendResponse(res, 200, { fileUrl }, 'File uploaded successfully');
    } catch (error) {
        next(error);
    }
};

// @desc    Get messages for a conversation
// @route   GET /api/messages/:id
export const getMessages = async (req, res, next) => {
    try {
        const messages = await messageService.getMessages(req.user._id, req.params.id);
        return sendResponse(res, 200, messages, 'Messages retrieved');
    } catch (error) {
        next(error);
    }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/read/:id
export const markAsRead = async (req, res, next) => {
    try {
        await messageService.markAsRead(req.user._id, req.params.id);
        return sendResponse(res, 200, null, 'Messages marked as read');
    } catch (error) {
        next(error);
    }
};
