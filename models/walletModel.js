const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({

    paymentType: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        require: true
    },
    date: {
        type: Date,
        require: true
    },
    description: {
        type: String,
        required: true
    }


});
module.exports = mongoose.model('Wallet', walletSchema);