const Skill = require('../models/Skill');

// Fetch all available skills
const getSkills = async (req, res) => {
    try {
        const skills = await Skill.find()
            .collation({ locale: 'en', strength: 2 })
            .sort({ name: 1 });
        res.status(200).json(skills);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching skills', error });
    }
};

module.exports = {
    getSkills,
};
