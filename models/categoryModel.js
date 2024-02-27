const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({

    category: {

        type: String,
        required: true,
    },
    sub_Category: {

        type: [String],
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    description: {

        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,

    },
    updatedAt: {
        type: Date,
        default: Date.now,

    }




});


module.exports = mongoose.model('Category', categorySchema);