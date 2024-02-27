// // ReturnOrder.js
// const mongoose = require('mongoose');

// const returnOrderSchema = new mongoose.Schema({
//     orderNumber: {
//         type: String,
//         required: true,
//     },
//     returnReason: {
//         type: String,
//         required: true,
//     },
//     returnOptions: {
//         type: String,
//         required: true,
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now,
//     },
// });

// module.exports = mongoose.model('ReturnOrder', returnOrderSchema);
// models/ReturnData.js

const mongoose = require('mongoose');

const returnDataSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderNumber: {
        type: String,
        required: true
    },
    returnReason: {
        type: String,
        required: true
    },
    returnOptions: {
        type: String,
        required: true
    }
});

const ReturnData = mongoose.model('ReturnData', returnDataSchema);

module.exports = ReturnData;


