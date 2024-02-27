const User = require('../models/userModel');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Coupon = require("../models/couponModel");
const mongoose = require('mongoose');
const { name } = require('ejs');
const ReturnData = require('../models/ReturnOrder');
const Wallet = require("../models/walletModel");


// const loadOrderPlaced = async (req, res) => {
//     try {
//         const userId = req.session.user_id;
//         // const orders = await Order.find({}).populate('items.product');
//         // const orders = await Order.find({ 'customer': userId }).populate('items.product');
//         const orders = await Order.find({ 'customer': userId }).populate('customer items.product');
//         console.log('orders=', orders);
//         const userData = await User.findById(userId);
//         console.log('userdata=', userData);

//         res.render('orderPlaced', { userData, orders });
//     } catch (error) {
//         console.log(error.message);
//     }

// }

const loadOrderPlaced = async (req, res) => {
    try {
        const userId = req.session.user_id;
        // const orders = await Order.find({}).populate('items.product');
        // const orders = await Order.find({ 'customer': userId }).populate('items.product');
        const orders = await Order.find({ 'customer': userId }).populate('customer').populate({ path: 'items.product', model: 'Product' });

        const userData = await User.findById(userId);

        const cartItems = await Cart.find({ couponDiscountPrice: { $ne: null } });


        if (cartItems) {
            await Cart.updateMany({ couponDiscountPrice: { $ne: null } }, { $unset: { couponDiscountPrice: 1 } });
            console.log('Products with couponDiscountPrice removed from the cart.');

        }


        res.render('orderPlaced', { userData, orders });
    } catch (error) {
        console.log(error.message);
    }

}





// const loadOrder = async (req, res) => {
//     //orders
//     try {
//         const orders = await Order.find().populate('items.product');
//         res.render('orders', { orders });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Internal Server Error');
//     }
// };

// const createOrder = async (req, res) => {
//     //create-orders
//     try {
//         // Get product IDs and quantities from the request body
//         const { products } = req.body;

//         // Fetch product details from the database based on product IDs
//         const productsWithDetails = await Promise.all(
//             products.map(async (product) => {
//                 const productDetails = await Product.findById(product.productId);
//                 return {
//                     product: productDetails,
//                     quantity: product.quantity,
//                 };
//             })
//         );

//         // Calculate the total price
//         const totalPrice = productsWithDetails.reduce(
//             (total, item) => total + item.product.price * item.quantity,
//             0
//         );

//         // Create a new order in the database
//         const newOrder = new Order({
//             items: productsWithDetails,
//             totalPrice,
//             // Add other relevant fields as needed
//         });

//         await newOrder.save();

//         res.status(201).json({ message: 'Order created successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

// const placeOrder = async (req, res) => {
//     try {
//         // Extract relevant data from the request
//         const { items, quantity, totalPrice, paymentMethod, address } = req.body;

//         console.log('selected Address=', address);
//         console.log('Selected Payment Method=:', paymentMethod);



//         const userId = req.session.user_id;

//         // const orderItems = items.map(itemId => ({
//         //     product: itemId,
//         //     quantity: 1,
//         //     price: 4,
//         //     name: name
//         // }));

//         const populatedItems = await Promise.all(
//             items.map(async (itemId, index) => {
//                 const cartItem = await Cart.findById(itemId).populate('product_id', 'name'); // Add 'name' here
//                 return {
//                     product: {
//                         _id: cartItem.product_id, // Adjust here
//                         name: cartItem.product_id.name, // Add 'name' here
//                     },
//                     quantity: cartItem.quantity,
//                     price: cartItem.price,

//                 };
//             })
//         );



//         // Create the order object
//         const order = new Order({
//             customer: userId,
//             status: 'pending', // You might adjust this based on your application logic
//             paymentMethod,
//             orderAddress: address,
//             totalAmount: totalPrice,
//             //items: orderItems,
//             items: populatedItems,
//             orderDate: new Date(),
//             quantity: quantity

//         });

//         // Save the order to the database
//         await order.save();

//         res.redirect('/orderPlaced');
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, error: 'Error placing order' });
//     }
// };

//************ proceed to checkout management ***********

const loadProceedToCheckout = async (req, res) => {
    try {

        console.log('reqsanuuuu=', req.body);
        const activeCoupons = await Coupon.find({ isActive: true });
        totalCartItems = await Cart.countDocuments({});
        //const user = await User.findById(req.user.id);
        const user = await User.findById({ _id: req.session.user_id });

        const cartItems = await Cart.find({});
        // const productData = await Product.find({});
        if (totalCartItems > 0) {
            return res.render('proceedToCheckout', { cartItems, user, activeCoupons });
        } else {
            req.flash('error', 'no products in cart,ADD PRODUCTS');
            return res.redirect('/cart');
        }


    } catch (error) {
        console.log(error.message);
    }
}



const updateBillingInfo = async (req, res) => {
    try {
        // Get user ID from the session or wherever it's stored

        //const userId = req.session.userId;
        const userId = await User.findById({ _id: req.session.user_id });
        // Find the user in the database
        const user = await User.findById(userId);

        console.log('User ID from session:', userId);

        // Check if the user is not found
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update user details
        user.name = req.body.name;
        user.email = req.body.email;
        user.mobile = req.body.phone;
        user.address = req.body.address;
        user.country = req.body.country;
        user.city = req.body.city;
        user.zipCode = req.body.zipCode;


        // Save the updated user
        const userData = await user.save();
        console.log('User details updated successfully');
        //res.json({ success: true, message: 'User details updated successfully' });
        req.flash('success', 'profile updated successfully.');
        //return res.render('proceedToCheckout', { userData });
        return res.redirect('/checkout');
    } catch (error) {
        console.error('Error updating user details:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};


const removeOrder = async (req, res) => {
    try {
        const { order_id } = req.body;

        console.log('Received order_id:', order_id);

        // Validate if product_id is a valid ObjectId
        if (!mongoose.isValidObjectId(order_id)) {
            console.log('Invalid product_id.');
            //res.sendStatus(400); / / Bad Request
            return;
        }

        const result = await Order.deleteOne({ _id: order_id });

        if (result.deletedCount === 1) {
            // Product successfully removed from cart
            console.log('order removed .');
            return res.status(200).json({ success: true });

        } else {
            // Product with the given product_id not found in the cart
            console.log('order not found .');
            return res.sendStatus(404); // Not Found
        }
    } catch (error) {
        console.error('Error:', error);
        res.sendStatus(500); // Internal Server Error
    }
};

// **** order cancel ****

// Cancel Order
const cancelOrder = async (req, res) => {
    const orderId = req.params.id;
    console.log('sanu ');
    try {
        const order = await Order.findByIdAndUpdate(orderId, { status: 'Cancelled' }, { new: true });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        if (order.couponDiscountPrice !== null) {
            const walletTransaction = new Wallet({
                paymentType: 'credit',
                amount: order.couponDiscountPrice,
                date: new Date(),
                description: `Refund for order ${orderId}`,
            });
            await walletTransaction.save();
        } else {
            const walletTransaction = new Wallet({
                paymentType: 'credit',
                amount: order.totalAmount,
                date: new Date(),
                description: `Refund for order ${orderId}`,
            });
            await walletTransaction.save();
        }

        //return res.status(200).json({ success: true, message: 'Order cancelled successfully' });
        req.flash('success', 'Order cancelled successfully');
        return res.redirect('/viewUserOrders');

    } catch (error) {
        console.error('Error cancelling order:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Complete Order (change status to 'Delivered')
const completeOrder = async (req, res) => {
    const orderId = req.params.id;

    try {
        const order = await Order.findByIdAndUpdate(orderId, { status: 'Delivered' }, { new: true });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        return res.status(200).json({ success: true, message: 'Order completed successfully' });
    } catch (error) {
        console.error('Error completing order:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};



//******* payment ********
// const placeOrder = async (req, res) => {
//     try {
//         const { items, quantity, totalPrice, paymentMethod, address, productName, } = req.body;
//         const userId = req.session.user_id;

//         console.log('Selected Payment Method:', paymentMethod);

//         if (paymentMethod === 'cashOnDelivery') {
//             // Code for credit card or PayPal payment method
// const populatedItems = await Promise.all(
//     items.map(async (itemId, index) => {
//         const cartItem = await Cart.findById(itemId).populate('product_id', 'name');
//         return {
//             product: {
//                 _id: cartItem.product_id,
//                 name: cartItem.product_id.name,
//             },
//             quantity: cartItem.quantity,
//             price: cartItem.price,
//         };
//     })
// );

//             const order = new Order({
//                 customer: userId,
//                 status: 'pending',
//                 paymentMethod,
//                 orderAddress: address,
//                 totalAmount: totalPrice,
//                 items: populatedItems,
//                 orderDate: new Date(),
//                 quantity: quantity
//             });

//             await order.save();

//             res.redirect('/orderPlaced');
//         } else if (paymentMethod === 'creditCard' || paymentMethod === 'payPal') {
//             console.log('payment method=', paymentMethod);
//             // Code for cash on delivery payment method

//             const razorpays = new Razorpay({
//                 key_id: "rzp_test_2iKg9k1NXeJb8P",
//                 key_secret: "Uv4qKlGbPrc5cvE33Q5nWKWx"
//             });

//             const amount = totalPrice * 100
//             const options = {
//                 amount: amount,
//                 currency: 'INR',
//                 receipt: 'razorUser@gmail.com'
//             };



//             const response = await razorpays.orders.create(options);
//             res.json(response);
//             // const walletTransaction = new Wallet({
//             //     paymentType: 'Razorpay',
//             //     amount: response.amount / 100,
//             //     date: new Date(),
//             //     description: 'Added money to wallet',
//             // });



//         } else {
//             // Handle unsupported payment methods or other conditions
//             res.status(400).json({ success: false, error: 'Unsupported payment method' });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, error: 'Error placing order' });
//     }
// };



// const razorpay = new Razorpay({
//     key_id: 'rzp_test_2iKg9k1NXeJb8P',
//     key_secret: 'Uv4qKlGbPrc5cvE33Q5nWKWx',
// });


// const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;
require('dotenv').config();
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_ID_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY
});
console.log('R id key=', process.env.RAZORPAY_ID_KEY);
console.log('R secret key=', process.env.RAZORPAY_SECRET_KEY);

const placeOrder = async (req, res) => {
    try {

        const { items, amount, address, quantity } = req.body;
        const couponDiscountPrice = req.body.couponDiscountPrice;
        console.log('couponDiscountPrice=', couponDiscountPrice);
        console.log('req body==', req.body);
        console.log('items==', items);
        const userId = req.session.user_id;
        const paymentMethod = req.body.paymentMethod;

        console.log('Selected Payment Method:', paymentMethod);
        // console.log('totalPrice=', totalPrice);

        // const totalPrice = parseFloat(req.body.totalPrice);
        // const amount = totalPrice * 100;


        if (paymentMethod === 'cashOnDelivery') {
            const populatedItems = await getPopulatedItems(items);
            console.log('testingg 1');
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
            console.log('testing 2');
            await order.save();

            await Cart.deleteMany({}); // Remove all items from the cart
            //return res.redirect('/orderPlaced');
            res.json({ success: true });

        } else if (paymentMethod === 'creditCard' || paymentMethod === 'payPal') {

            const currency = 'INR';

            const options = {
                amount,
                currency,
                receipt: 'razorUser@gmail.com',
                payment_capture: 1,
            };

            const response = await razorpay.orders.create(options);
            // res.json(response);
            res.json({
                key_id: process.env.RAZORPAY_ID_KEY,
                ...response,
            });
            // const populatedItems = await getPopulatedItems(items);
            // const order = new Order({
            //     customer: userId,
            //     status: 'pending',
            //     paymentMethod,
            //     orderAddress: address,
            //     totalAmount: amount,
            //     items: populatedItems,
            //     orderDate: new Date(),
            //     quantity: quantity,
            // });
            // await order.save();
        } else {
            // Handle unsupported payment methods or other conditions
            res.status(400).json({ success: false, error: 'Unsupported payment method' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error placing order' });
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






const loadReturnOrders = async (req, res) => {
    try {
        const orderId = req.params.id;
        //const orderDetails = await Order.findById(orderId);
        const orderDetails = await Order.findById(orderId).populate('items.product');
        //console.log('OD S =', orderDetails);
        if (!orderDetails) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        //const userId = req.session.user_id;
        const userId = orderDetails.customer;
        //console.log('OD.customer=', userId);
        // Render the view with orderDetails
        res.render('returnOrders', { orderDetails, userId });
    } catch (error) {
        console.log(error);
    }
}

// const submitOrderReturn = async (req, res) => {
//     try {
//         const { orderNumber, returnReason, returnOptions } = req.body;
//         console.log('orderNumber=', orderNumber);
//         console.log('returnReason=', returnReason);
//         console.log('returnOptions=', returnOptions);
//         // Assuming you have a model named Order and a field named 'status'
//         // Update the order status to 'returned'
//         const updatedOrder = await Order.findOneAndUpdate(
//             { _id: orderNumber },
//             { $set: { status: 'returned' } },
//             { new: true }
//         );

//         if (!updatedOrder) {
//             return res.status(404).send('Order not found');
//         }

//         res.redirect(`/viewUserOrders`);
//         // res.redirect(`/ viewUserOrders ? orderNumber = ${ orderNumber }& returnReason=${ returnReason }& returnOptions=${ returnOptions } `);
//     } catch (error) {
//         console.log(error);
//         res.status(500).send('Internal Server Error');
//     }
// }


const submitOrderReturn = async (req, res) => {
    try {
        const { orderNumber, returnReason, returnOptions } = req.body;
        console.log('orderNumber=', orderNumber);
        console.log('returnReason=', returnReason);
        console.log('returnOptions=', returnOptions);
        const userId = req.body.userID;

        const returnData = new ReturnData({
            userId,
            orderNumber,
            returnReason,
            returnOptions
        });

        // Save the return data to the database
        await returnData.save();

        const updatedOrder = await Order.findOneAndUpdate(
            { _id: orderNumber },
            { $set: { status: 'returned' } },
            { new: true }
        )


        if (!updatedOrder) {
            return res.status(404).send('Order not found');
        }

        // Redirect to viewUserOrders with query parameters
        res.redirect(`/viewUserOrders`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

const loadOrderDetailPage = async (req, res) => {
    try {
        const orderId = req.query.orderId;
        console.log('orderindex=', orderId);


        //const order = await Order.findOne().skip(orderIndex).limit(1);
        const order = await Order.findById(orderId).populate('items.product');

        if (!order) {
            return res.status(404).send('Order not found');
        }


        console.log('Order Details:', order);
        console.log('Order Items:', order.items);

        return res.render('orderDetailPage', { order });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}

const loadAdminOrderDetailPage = async (req, res) => {
    try {
        const orderId = req.query.orderId;

        console.log('admin orderindex=', orderId);


        //const order = await Order.findOne().skip(orderIndex).limit(1);
        const order = await Order.findById(orderId).populate('items.product').populate('customer');

        if (!order) {
            return res.status(404).send('Order not found');
        }

        userId = order.customer._id;


        console.log('admin Order Details:', order);
        console.log('admin Order Items:', order.items);

        return res.render('adminOrderDetailPage', { order, userId });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}


const clearCouponDiscountPrice = async () => {
    try {
        console.log('pop');
        // Find cart items with couponDiscountPrice
        const cartItems = await Cart.find({ couponDiscountPrice: { $ne: null } });

        // Check if there are any cart items with couponDiscountPrice
        if (cartItems.length > 0) {
            // Update couponDiscountPrice to null for all matching cart items
            await Cart.updateMany({ couponDiscountPrice: { $ne: null } }, { $unset: { couponDiscountPrice: 1 } });

            console.log('Products with couponDiscountPrice removed from the cart.');
        } else {
            console.log('No products found with couponDiscountPrice in the cart.');
        }
    } catch (error) {
        console.error('Error removing products with couponDiscountPrice from the cart:', error);
    }
};


module.exports = {
    placeOrder,
    loadOrderPlaced, loadProceedToCheckout, updateBillingInfo, removeOrder,
    cancelOrder, completeOrder,
    loadReturnOrders, submitOrderReturn,
    loadOrderDetailPage, loadAdminOrderDetailPage,
    clearCouponDiscountPrice
}
