const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const { uploadTopupScreenshot } = require('../middleware/topupUpload');
const {
    getWalletBalance,
    createTopUpRequest,
    listTopUpRequests,
    getTopUpScreenshot,
    createWithdrawalRequest,
    listWithdrawalRequests,
} = require('../controllers/walletController');

// Balance for current user
router.get('/balance', authenticate, checkRole(['Student', 'Client']), getWalletBalance);

const handleTopupUpload = (req, res, next) => {
    uploadTopupScreenshot.single('screenshot')(req, res, (error) => {
        if (error) {
            return res.status(400).json({ message: error.message || 'Invalid screenshot upload.' });
        }
        next();
    });
};

// Client top-ups
router.post('/topups', authenticate, checkRole('Client'), handleTopupUpload, createTopUpRequest);
router.get('/topups', authenticate, checkRole('Client'), listTopUpRequests);
router.get('/topups/:id/screenshot', authenticate, checkRole(['Client', 'Admin']), getTopUpScreenshot);

// Student withdrawals
router.post('/withdrawals', authenticate, checkRole('Student'), createWithdrawalRequest);
router.get('/withdrawals', authenticate, checkRole('Student'), listWithdrawalRequests);

module.exports = router;
