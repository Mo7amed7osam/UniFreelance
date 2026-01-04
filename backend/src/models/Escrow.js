const mongoose = require('mongoose');
const { Schema } = mongoose;

const EscrowSchema = new Schema({
    contractId: {
        type: Schema.Types.ObjectId,
        ref: 'Contract',
        required: true,
    },
    clientId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
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
    status: {
        type: String,
        enum: ['held_in_escrow', 'released'],
        default: 'held_in_escrow',
    },
    releasedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

EscrowSchema.index({ contractId: 1 }, { unique: true });

module.exports = mongoose.model('Escrow', EscrowSchema);
