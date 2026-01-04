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
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically set the creation date
    },
}, {
    timestamps: true,
});

// Exporting the Proposal model
const Proposal = mongoose.model('Proposal', ProposalSchema);
module.exports = Proposal;
