const mongoose = require('mongoose');

const transactionsSchema = new mongoose.Schema({
    txnHash: {
        type: String,
        required: true,
    },
    investorAddress: {
        type: String,
        required: true,
    },
    tokenAmount: {
        type: Number,
        required: true,
    },
    diamAmount: {
        type: Number,
        required: true,
    },
    action: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const TransactionsData = mongoose.model('TransactionsData', transactionsSchema);

module.exports = TransactionsData;
