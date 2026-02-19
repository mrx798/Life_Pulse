const rateLimit = require('express-rate-limit');

const otpLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // Limit each IP to 100 OTP requests per minute
    message: { error: 'Too many OTP requests from this IP, please try again after a minute' },
    standardHeaders: true,
    legacyHeaders: false,
});

const registerLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // Limit each IP to 100 registration attempts per minute
    message: { error: 'Too many registration attempts from this IP, please try again after a minute' },
    standardHeaders: true,
    legacyHeaders: false,
});

const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // Limit each IP to 100 login attempts per minute
    message: { error: 'Too many login attempts from this IP, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    otpLimiter,
    registerLimiter,
    loginLimiter,
};
