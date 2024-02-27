// Define the Coupon schema
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    discountPercentage: {
        type: Number,
        required: true,
    },
    expiry: {
        type: Date,
        required: true,
    },
    minOrderAmount: {
        type: Number,
        default: 0,
    },

    isActive: {
        type: Boolean,
        default: true,
    },
    usedUsers: [
        {
            user_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user",
            }
        }
    ]
});

// Create the Coupon model
module.exports = mongoose.model('Coupon', couponSchema);