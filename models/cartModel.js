const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({

    product_id: {
        type: String,
        required: true
    },
    // product: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Product', // Reference to the Product model
    //     required: true
    // },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    discountedPrice: {
        type: Number,
        required: false
    },
    couponDiscountPrice: {
        type: Number,
        required: false
    },

    quantity: {
        type: Number,
        default: 1  // Assuming the default quantity is 1 when adding to cart
    },
    imageURL: {
        type: String, // Adjust the type based on how you store images
        required: false,
    },
});

module.exports = mongoose.model("Cart", cartSchema);