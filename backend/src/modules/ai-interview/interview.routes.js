const router = require('express').Router();

const { authenticate } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/roleCheck');
const { upload } = require('../../middleware/uploadMiddleware');
const {
  getInterviewResult,
  getInterviewSession,
  startInterview,
  submitInterviewAnswer,
} = require('./interview.controller');

router.post('/start', authenticate, checkRole(['Student']), startInterview);
router.get('/:sessionId', authenticate, checkRole(['Student', 'Admin']), getInterviewSession);
router.post(
  '/:sessionId/answer',
  authenticate,
  checkRole(['Student']),
  upload.single('video'),
  submitInterviewAnswer
);
router.get('/:sessionId/result', authenticate, checkRole(['Student', 'Admin']), getInterviewResult);

module.exports = router;
