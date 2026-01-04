const mongoose = require('mongoose');
const { Schema } = mongoose;

// Create the Job schema
const JobSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    requiredSkills: {
        type: [Schema.Types.ObjectId],
        ref: 'Skill',
        required: true,
    },
    applicants: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
        default: [],
    },
    employer: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    selectedStudent: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    status: {
        type: String,
        enum: ['open', 'filled'],
        default: 'open',
    },
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
});

// Export the Job model
const Job = mongoose.model('Job', JobSchema);
module.exports = Job;
