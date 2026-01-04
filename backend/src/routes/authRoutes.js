const router = require('express').Router();
const { register, login, getCurrentUser } = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../utils/validators');
const { authenticate } = require('../middleware/auth');

// Route for user registration
router.post('/register', validateRegistration, register);

// Route for user login
router.post(
    '/login',
    // Debug: log incoming request (avoid logging password)
    (req, res, next) => {
        console.log('[LOGIN] Incoming request', {
            email: req.body?.email,
            hasPassword: typeof req.body?.password === 'string' && req.body.password.length > 0,
        });
        next();
    },
    validateLogin,
    // Debug: reached here means validateLogin did not short-circuit the request
    (req, res, next) => {
        console.log('[LOGIN] Passed validateLogin, calling controller');
        next();
    },
    login
);

router.get('/me', authenticate, getCurrentUser);

module.exports = router;
