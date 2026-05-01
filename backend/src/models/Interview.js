const mongoose = require('mongoose');
const { Schema } = mongoose;

// Create the Interview schema
const InterviewSchema = new Schema({
    studentId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'User' // Reference to the User model
    },
    skillId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'Skill' // Reference to the Skill model
    },
    questions: {
        type: [String],
        required: true,
    },
    responses: {
        type: [
            {
                question: { type: String, required: true },
                videoUrl: { type: String, required: true },
            },
        ],
        default: [],
    },
    reviewStatus: {
        type: String,
        enum: ['pending', 'pass', 'fail'],
        default: 'pending'
    },
    score: {
        type: Number,
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
    isSubmitted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

// Export the Interview model
const Interview = mongoose.model('Interview', InterviewSchema);
module.exports = Interview;
