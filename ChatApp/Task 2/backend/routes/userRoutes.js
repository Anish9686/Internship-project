import express from 'express';
import {
    getUsers,
    searchUsers,
    updateStatus,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getUsers);
router.get('/search', searchUsers);
router.put('/status', updateStatus);

export default router;
