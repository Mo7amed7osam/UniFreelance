const router = require('express').Router();
const {
    getStudentProfile,
    updateStudentProfile,
    browseJobs,
    submitProposal,
    uploadStudentCV,
    getStudentProposals,
} = require('../controllers/studentController');
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const { upload } = require('../middleware/uploadMiddleware');

// Route to get student profile
router.get('/:id/profile', authenticate, checkRole(['Student', 'Admin']), getStudentProfile);

// Route to update student profile
router.put('/:id/profile', authenticate, checkRole(['Student', 'Admin']), updateStudentProfile);

// Route to upload CV
router.post('/:id/upload-cv', authenticate, checkRole(['Student', 'Admin']), upload.single('cv'), uploadStudentCV);

// Route to browse available jobs
router.get('/jobs', authenticate, checkRole('Student'), browseJobs);

// Route to submit a proposal for a job
router.post('/jobs/:jobId/proposals', authenticate, checkRole('Student'), submitProposal);

// Route to view student's proposals
router.get('/:id/proposals', authenticate, checkRole(['Student', 'Admin']), getStudentProposals);

module.exports = router;
