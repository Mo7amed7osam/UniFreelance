const router = require('express').Router();
const { acceptProposal } = require('../controllers/proposalController');
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// Route to accept a proposal and create a contract with escrow
router.post('/:proposalId/accept', authenticate, checkRole('Client'), acceptProposal);

module.exports = router;
