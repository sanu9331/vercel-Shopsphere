const mongoose = require('mongoose');

const useryOTPverification = new mongoose.Schema({

    email: {
        type: String,
        required: true,
        unique: true

    },

    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'

    },
    otpCode: {
        type: String,
        required: true,
    },
    otpExpiration: {
        type: Date,
        required: true,
    },
});


module.exports = mongoose.model('UserOTPRecord', useryOTPverification)