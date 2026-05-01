const mongoose = require('mongoose');
const { Schema } = mongoose;

const TopUpRequestSchema = new Schema({
    clientId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    screenshotPath: {
        type: String,
        required: true,
    },
    note: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'DECLINED'],
        default: 'PENDING',
    },
    adminId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    decisionReason: {
        type: String,
        trim: true,
    },
    processedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

TopUpRequestSchema.index({ clientId: 1, createdAt: -1 });
TopUpRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('TopUpRequest', TopUpRequestSchema);
