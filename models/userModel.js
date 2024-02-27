const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    streetaddress: String,
    city: String,
    state: String,
    postalcode: Number,
    country: String
});


const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        //required: true
    }, gender: {
        type: String,
        enum: ['male', 'female']
    },
    password: {
        type: String,
        required: true
    },
    is_admin: {
        type: Number,
        required: true
    },
    status: {
        type: Boolean,
        default: true,
    },
    is_verified: {
        type: Number,
        default: 0
    },
    isDelete: {
        type: Boolean,
        default: false,
    },
    address: [addressSchema],

    // country: {
    //     type: String
    // },
    // city: {
    //     type: String
    // },
    // zipCode: {
    //     type: Number
    // },
    token: {
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('User', userSchema);