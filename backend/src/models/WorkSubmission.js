const mongoose = require('mongoose');
const { Schema } = mongoose;

const WorkSubmissionSchema = new Schema({
    contractId: {
        type: Schema.Types.ObjectId,
        ref: 'Contract',
        required: true,
    },
    studentId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    links: {
        type: [String],
        default: [],
    },
    attachments: {
        type: [String],
        default: [],
    },
}, {
    timestamps: true,
});

WorkSubmissionSchema.index({ contractId: 1, createdAt: -1 });

module.exports = mongoose.model('WorkSubmission', WorkSubmissionSchema);
