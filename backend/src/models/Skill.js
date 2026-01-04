const mongoose = require('mongoose');
const { Schema } = mongoose;

// Create the Skill schema
const SkillSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true, // Ensure skill names are unique
    },
    description: {
        type: String,
        required: true,
    },
});

// Create the Skill model
const Skill = mongoose.model('Skill', SkillSchema);

// Export the Skill model
module.exports = Skill;
