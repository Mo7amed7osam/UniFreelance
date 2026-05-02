const router = require('express').Router();
const { getSkills } = require('../controllers/skillController');

// Route to get all available skills
router.get('/', getSkills);

module.exports = router;
