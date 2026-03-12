import logger from '../config/logger.js';
import { sendError } from '../utils/responseHandler.js';

export const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    logger.error(`${err.message} - ${req.method} ${req.originalUrl} - ${req.ip}`);

    return sendError(
        res,
        statusCode,
        err.message,
        process.env.NODE_ENV === 'production' ? null : err.stack
    );
};
