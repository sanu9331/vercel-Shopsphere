const Razorpay = require('razorpay');
const Order = require('../models/orderModel');
const Wallet = require("../models/walletModel");
const Cart = require('../models/cartModel');

// const razorpay = new Razorpay({
//     key_id: "rzp_test_2iKg9k1NXeJb8P",
//     key_secret: "Uv4qKlGbPrc5cvE33Q5nWKWx"
// });
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_ID_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY
});


// const capturePayment = async (req, res) => {
//     try {
//         const { paymentId } = req.body;

//         // Capture the payment using Razorpay API
//         const captureResponse = razorpay.payments.capture(paymentId);

//         if (captureResponse.status === 'captured') {
//             // Payment captured successfully
//             // Add your logic here to update the order status in your database
//             // (e.g., retrieve order details based on paymentId and update the status)
//             console.log('payment id=', paymentId);

//             res.json({ success: true, message: 'Payment captured successfully' });
//         } else {
//             // Payment capture failed
//             res.status(400).json({ success: false, error: 'Payment capture failed' });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, error: 'Error capturing payment' });
//     }
// };
// const capturePayment = async (req, res) => {
//     try {
//         const { paymentId } = req.body;

//         const payment = await razorpay.payments.fetch(paymentId);

//         if (payment && payment.status === 'authorized') {
//             // If payment is authorized, capture the payment
//             const captureResponse = razorpay.payments.capture(paymentId);

//             if (captureResponse.status === 'captured') {
//                 // Payment successfully captured
//                 //const orderId = getOrderIdFromPayment(payment);
//                 // Update your order status as per your application logic
//                 //await updateOrderStatus(orderId, 'success');
//                 //res.json({ success: true, message: 'Payment successfully captured' });
//                 console.log('payment captured successfully');
//             } else {
//                 res.status(400).json({ success: false, message: 'Failed to capture payment' });
//             }
//         } else {
//             res.status(400).json({ success: false, message: 'Payment not authorized' });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, error: 'Error capturing payment' });
//     }
// };
const capturePayment = async (req, res) => {
    const { razorpay_payment_id, amount } = req.body;
    console.log('complete transaction=', req.body);

    const { items, address, quantity } = req.body;
    console.log('items==P ', items);
    const userId = req.session.user_id;
    const paymentMethod = req.body.paymentMethod;
    const couponDiscountPrice = req.body.couponDiscountPrice;
    console.log('CP CDP=', couponDiscountPrice);



    if (razorpay_payment_id) {
        const populatedItems = await getPopulatedItems(items);
        const order = new Order({
            customer: userId,
            status: 'pending',
            paymentMethod,
            orderAddress: address,
            totalAmount: (amount / 100).toFixed(2),
            items: populatedItems,
            orderDate: new Date(),
            quantity: quantity,
            couponDiscountPrice: couponDiscountPrice
        });


        try {
            await order.save();
            await Cart.deleteMany({}); // Remove all items from the cart
            res.status(200).json({ message: 'payment completed successfully.' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to save payment to the database.' });
        }
    } else {
        res.status(400).json({ error: 'Invalid Razorpay payment ID.' });
    }
};

async function getPopulatedItems(items) {
    return await Promise.all(
        items.map(async (itemId, index) => {
            const cartItem = await Cart.findById(itemId).populate('product_id', 'name');
            return {
                product: {
                    _id: cartItem.product_id,
                    name: cartItem.product_id.name,
                },
                quantity: cartItem.quantity,
                price: cartItem.price,
            };
        })
    );
}

// const capturePayment = async (req, res) => {
//     const { razorpay_payment_id, amount } = req.body;
//     console.log('complete transaction=', req.body);

//     const { items, address, quantity } = req.body;
//     console.log('items==P ', items);
//     const userId = req.session.user_id;
//     const paymentMethod = req.body.paymentMethod;

//     try {
//         // Check if an order with the same payment ID already exists
//         const existingOrder = await Order.findOne({ razorpay_payment_id });

//         if (existingOrder) {
//             // Return success response if the order already exists
//             return res.status(200).json({ message: 'Payment already processed.' });
//         }

//         // If the order does not exist, proceed to save the new order
//         const populatedItems = await getPopulatedItems(items);
//         const order = new Order({
//             customer: userId,
//             status: 'pending',
//             paymentMethod,
//             orderAddress: address,
//             totalAmount: amount,
//             items: populatedItems,
//             orderDate: new Date(),
//             quantity: quantity,
//             razorpay_payment_id, // Add razorpay_payment_id to the order
//         });

//         await order.save();
//         return res.status(200).json({ message: 'Payment completed successfully.' });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ error: 'Failed to save payment to the database.' });
//     }
// };


module.exports = {
    capturePayment
}