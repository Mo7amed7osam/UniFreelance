const mongoose = require('mongoose');
const { Schema } = mongoose;

// Proposal schema defining the structure of the Proposal model
const ProposalSchema = new Schema({
    jobId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'Job', // Reference to the Job model
    },
    studentId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'User', // Reference to the User model (Student)
    },
    details: {
        type: String,
        required: true,
    },
    proposedBudget: {
        type: Number,
        min: 0,
    },
    status: {
        type: String,
        enum: ['submitted', 'shortlisted', 'rejected', 'accepted'],
        default: 'submitted',
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically set the creation date
    },
}, {
    timestamps: true,
});

ProposalSchema.index({ jobId: 1, studentId: 1 }, { unique: true });

// Exporting the Proposal model
const Proposal = mongoose.model('Proposal', ProposalSchema);
module.exports = Proposal;
