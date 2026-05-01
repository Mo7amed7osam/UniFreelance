const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const { upload } = require('../middleware/uploadMiddleware');
const { uploadInterviewVideo, submitInterview } = require('../controllers/interviewController');

router.post('/:id/videos', authenticate, checkRole(['Student']), upload.single('video'), uploadInterviewVideo);
router.post('/:id/submit', authenticate, checkRole(['Student']), submitInterview);

module.exports = router;
