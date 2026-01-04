const router = require('express').Router();
const {
    createJob,
    getJobs,
    getJobById,
    submitProposal,
    getJobProposals,
    getClientJobs,
    getMatchedCandidates,
    selectStudentForJob,
    getClientProposals,
} = require('../controllers/jobController');
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// Route to post a new job
router.post('/', authenticate, checkRole('Client'), createJob);

// Route to get all jobs
router.get('/', getJobs);

// Route to get jobs for a client
router.get('/mine', authenticate, checkRole('Client'), getClientJobs);

// Route to submit a proposal for a job
router.post('/:id/proposals', authenticate, checkRole('Student'), submitProposal);

// Route to get proposals for a job
router.get('/:id/proposals', authenticate, checkRole('Client'), getJobProposals);

// Route to get matched candidates for a job
router.get('/:id/matches', authenticate, checkRole('Client'), getMatchedCandidates);

// Route to select a student for a job
router.post('/:id/select', authenticate, checkRole('Client'), selectStudentForJob);

// Route to get proposals across client jobs
router.get('/proposals/client', authenticate, checkRole('Client'), getClientProposals);

// Route to get a single job
router.get('/:id', getJobById);

module.exports = router;
