const mongoose = require('mongoose');
const { Schema } = mongoose;

const WithdrawalRequestSchema = new Schema({
    studentId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    payoutMethod: {
        type: String,
        enum: ['BANK', 'INSTAPAY'],
        required: true,
    },
    bankAccount: {
        type: String,
        trim: true,
    },
    instapayHandle: {
        type: String,
        trim: true,
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

WithdrawalRequestSchema.index({ studentId: 1, createdAt: -1 });
WithdrawalRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('WithdrawalRequest', WithdrawalRequestSchema);
