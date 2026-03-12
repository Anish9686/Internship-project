import express from 'express';
import {
    sendMessage,
    getMessages,
    markAsRead,
    uploadFile,
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', sendMessage);
router.post('/upload', upload.single('file'), uploadFile);
router.get('/:id', getMessages);
router.put('/read/:id', markAsRead);

export default router;
