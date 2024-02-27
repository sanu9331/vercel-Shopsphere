
const mongoose = require('mongoose');



const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming you have a User model for customers
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'Cancelled', 'returned', 'returnApproved', 'returnRejected'],
        default: 'pending'
    },

    paymentMethod: {
        type: String,
        enum: ['creditCard', 'payPal', 'cashOnDelivery'],
        required: true
    },
    orderAddress: {
        type: String
    },

    totalAmount: {
        type: Number,
        required: true
    },
    couponDiscountPrice: {
        type: Number,
        required: false
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product', // Assuming you have a Product model
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],
    razorpay_payment_id: { type: String, unique: true }

});




module.exports = mongoose.model('Order', orderSchema);
