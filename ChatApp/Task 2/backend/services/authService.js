import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import logger from '../config/logger.js';

class AuthService {
    async register(userData) {
        const { name, email, password } = userData;
        const userExists = await User.findOne({ email });

        if (userExists) {
            throw new Error('User already exists');
        }

        const user = await User.create({ name, email, password });
        logger.info(`New user registered: ${email}`);

        return {
            user,
            token: generateToken(user._id)
        };
    }

    async login(email, password) {
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            logger.info(`User logged in: ${email}`);
            return {
                user,
                token: generateToken(user._id)
            };
        } else {
            throw new Error('Invalid email or password');
        }
    }

    async getProfile(userId) {
        return await User.findById(userId);
    }
}

export default new AuthService();
