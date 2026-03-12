export const sendResponse = (res, statusCode, data = null, message = 'Success', error = null) => {
    return res.status(statusCode).json({
        success: statusCode >= 200 && statusCode < 300,
        message,
        data,
        error,
    });
};

export const sendError = (res, statusCode, message = 'Error', error = null) => {
    return res.status(statusCode).json({
        success: false,
        message,
        data: null,
        error,
    });
};
