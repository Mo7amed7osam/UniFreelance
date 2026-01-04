const mongoose = require('mongoose');
const { Schema } = mongoose;

const TransactionSchema = new Schema({
    fromUserId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    toUserId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    type: {
        type: String,
        enum: ['ESCROW_HOLD', 'ESCROW_RELEASE', 'TOPUP_APPROVED', 'WITHDRAWAL_APPROVED'],
        required: true,
    },
    contractId: {
        type: Schema.Types.ObjectId,
        ref: 'Contract',
    },
    relatedRequestId: {
        type: Schema.Types.ObjectId,
    },
}, {
    timestamps: true,
});

TransactionSchema.index({ contractId: 1, createdAt: -1 });
TransactionSchema.index({ fromUserId: 1, createdAt: -1 });
TransactionSchema.index({ toUserId: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
