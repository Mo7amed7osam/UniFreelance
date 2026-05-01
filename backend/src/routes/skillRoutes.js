const router = require('express').Router();
const { getSkills, startInterview, uploadInterviewVideo, getInterviewById } = require('../controllers/skillController');
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const { upload } = require('../middleware/uploadMiddleware');

// Route to get all available skills
router.get('/', getSkills);

// Route to start a video interview for a specific skill
router.post('/:skillId/interview/start', authenticate, checkRole(['Student']), startInterview);

// New: Route to start a video interview for a specific skill
router.post('/:skillId/interviews', authenticate, checkRole(['Student']), startInterview);

// Route to upload the recorded interview video
router.post('/:skillId/interview/upload', authenticate, checkRole(['Student']), upload.single('video'), uploadInterviewVideo);

router.get('/interviews/:interviewId', authenticate, checkRole(['Student']), getInterviewById);

module.exports = router;
