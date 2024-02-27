
const Product = require("../models/productModel");
const Cart = require('../models/cartModel');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const Order = require('../models/orderModel');



const loadCart = async (req, res) => {

    try {
        //const { store_id } = req.params;
        // const cartItems = await Cart.find({ store_id });
        totalCartItems = await Cart.countDocuments({});
        const cartItems = await Cart.find({})


        let realTotalPrice = 0;

        cartItems.forEach(item => {
            realTotalPrice += item.discountedPrice * item.quantity;
        });
        console.log('realtotalprice:', realTotalPrice);

        res.render('cart', { cartItems, totalCartItems, realTotalPrice });
    } catch (error) {
        console.log(error.message);
    }
}


const buyNow = async (req, res) => {

    try {

        const { product_id, Price, discountedPrice, quantity, imageURL } = req.body;
        console.log('request body:', req.body);


        // Fetch the product from the database to get vendor_id and store_id
        const product = await Product.findById(product_id);
        //console.log('Fetched Product:', product);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        const existingCartItem = await Cart.findOne({ product_id });

        if (existingCartItem) {

            // existingCartItem.quantity++;
            // await existingCartItem.save();
        } else {
            const cart_obj = new Cart({
                product_id: req.body.product_id,
                name: req.body.name,
                price: req.body.Price,
                quantity: quantity,
                imageURL: imageURL,
                discountedPrice: discountedPrice
            });
            await cart_obj.save();
            console.log('cart_obj=', cart_obj);
        }


        //return res.status(200).json({ success: true, message: 'Item added to cart successfully.' });
        return res.redirect('/cart');
        //return res.render('cart', { price });
    } catch (error) {
        console.log(error.message);
    }
}

const addToCart = async (req, res) => {
    try {
        const { product_id, price, quantity, imageURL } = req.body;
        // const id = req.params.id;
        // const ProductData = await Product.findById({ _id: id });
        console.log('request body:', req.body);


        // Fetch the product from the database to get vendor_id and store_id
        const product = await Product.findById(product_id);
        //console.log('Fetched Product:', product);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        const existingCartItem = await Cart.findOne({ product_id });

        if (existingCartItem) {

            // existingCartItem.quantity++;
            // await existingCartItem.save();
        } else {
            const cart_obj = new Cart({
                product_id: req.body.product_id,
                name: req.body.name,
                price: req.body.price,
                quantity: quantity,
                imageURL: imageURL,
            });
            await cart_obj.save();
            console.log('cart_obj=', cart_obj);
        }
        req.flash('success', 'added to cart successfully');
        return res.redirect('/home/product/details/' + product_id);
        // res.render("productDetail", { ProductData });
    } catch (error) {
        console.log(error);
    }
}

// const removeFromCart = async (req, res) => {
//     try {
//         const { product_id } = req.body;

//         console.log('Received product_id:', product_id);

//         // Validate if product_id is a valid ObjectId
//         if (!mongoose.isValidObjectId(product_id)) {
//             // return res.status(400).json({ success: false, message: 'Invalid product_id.' });
//             console.log('Invalid product_id.');
//         }

//         const result = await Cart.deleteOne({ product_id });

//         if (result.deletedCount === 1) {
//             // Product successfully removed from cart
//             return res.status(200).json({ success: true, message: 'Product removed from cart.' });



//         } else {
//             // Product with the given product_id not found in the cart
//             return res.status(404).json({ success: false, message: 'Product not found in the cart.' });
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         return res.status(500).json({ success: false, message: 'Internal server error.' });
//     }
// };

// const removeFromCart = async (req, res) => {
//     try {
//         const { product_id } = req.body;

//         console.log('Received product_id:', product_id);

//         // Validate if product_id is a valid ObjectId
//         if (!mongoose.isValidObjectId(product_id)) {
//             console.log('Invalid product_id.');
//             res.sendStatus(400); // Bad Request
//             return;
//         }

//         const result = await Cart.deleteOne({ product_id });

//         if (result.deletedCount === 1) {
//             // Product successfully removed from cart
//             console.log('Product removed from cart.');

//         } else {
//             // Product with the given product_id not found in the cart
//             console.log('Product not found in the cart.');
//             res.sendStatus(404); // Not Found
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         res.sendStatus(500); // Internal Server Error
//     }
// };
const removeFromCart = async (req, res) => {
    try {
        const { product_id } = req.body;

        console.log('Received product_id:', product_id);

        // Validate if product_id is a valid ObjectId
        if (!mongoose.isValidObjectId(product_id)) {
            console.log('Invalid product_id.');
            res.sendStatus(400); // Bad Request
            return;
        }

        const result = await Cart.deleteOne({ product_id });

        if (result.deletedCount === 1) {
            // Product successfully removed from cart
            console.log('product removed');
            //return res.render('cart', { cartItems, message: "Product successfully removed" });


        } else {
            // Product with the given product_id not found in the cart
            console.log('Product not found in the cart.');

        }
        return res.redirect("/cart");
    } catch (error) {
        console.error('Error:', error);
        res.sendStatus(500); // Internal Server Error
    }
};



// Add a route to handle quantity updates
const updateQuantity = async (req, res) => {
    try {
        const { product_id, quantity } = req.query;

        // Validate if product_id is a valid ObjectId and quantity is a positive integer
        if (!mongoose.isValidObjectId(product_id) || !Number.isInteger(parseInt(quantity)) || quantity <= 0) {
            console.log('Invalid product_id or quantity.');
            res.sendStatus(400); // Bad Request
            return;
        }
        const product = await Product.findById(product_id);
        const stock = product.stock;
        if (product) {
            console.log(`Stock of product ${product_id}: ${stock}`);
        } else {
            console.log(`Product with ID ${product_id} not found`);
        }

        if (quantity > stock) {
            return res.render("cart", { message: `only ${stock} stocks left` });
        }

        // Update the quantity in your data store (e.g., database)
        // Example using Mongoose:
        await Cart.updateOne({ product_id }, { quantity });

        console.log('Quantity updated successfully.');
        res.sendStatus(200);

    } catch (error) {
        console.error('Error:', error);
        res.sendStatus(500); // Internal Server Error
    }
};


// ************ proceed to checkoutpagemanagement **************

// const loadProceedToCheckout = async (req, res) => {

//     try {
//         //const user = await User.findById(req.user.id);
//         const user = await User.findById({ _id: req.session.user_id });

//         const cartItems = await Cart.find({});
//         // const productData = await Product.find({});
//         res.render('proceedToCheckout', { cartItems, user });
//     } catch (error) {
//         console.log(error.message);
//     }
// }

// const updateBillingInfo = async (req, res) => {
//     try {
//         // Get user ID from the session or wherever it's stored

//         //const userId = req.session.userId;
//         const userId = await User.findById({ _id: req.session.user_id });
//         // Find the user in the database
//         const user = await User.findById(userId);

//         console.log('User ID from session:', userId);

//         // Check if the user is not found
//         if (!user) {
//             return res.status(404).json({ success: false, message: 'User not found' });
//         }

//         // Update user details
//         user.name = req.body.name;
//         user.email = req.body.email;
//         user.mobile = req.body.phone;
//         user.address = req.body.address;
//         user.country = req.body.country;
//         user.city = req.body.city;
//         user.zipCode = req.body.zipCode;


//         // Save the updated user
//         const userData = await user.save();
//         console.log('User details updated successfully');
//         res.json({ success: true, message: 'User details updated successfully' });
//     } catch (error) {
//         console.error('Error updating user details:', error);
//         res.status(500).json({ success: false, message: 'Internal Server Error' });
//     }
// };




//*************** ORDER PLACED SUCCESSFULLY ********************

// const loadOrderPlaced = async (req, res) => {
//     try {
//         const userData = await User.findById({ _id: req.session.user_id });
//         res.render('orderPlaced', { userData });
//     } catch (error) {
//         console.log(error.message);
//     }

// }
// const loadOrderPlaced = async (req, res) => {
//     try {
//         const orders = await Order.find().populate('items.product');
//         const userData = await User.findById({ _id: req.session.user_id });
//         res.render('orderPlaced', { userData, orders });
//     } catch (error) {
//         console.log(error.message);
//     }

// }

const cartCount = async (req, res) => {
    try {
        const cartCount = await Cart.find({}).countDocuments();
        res.json({ count: cartCount });
    } catch (error) {

    }

};





module.exports = {
    loadCart, buyNow, addToCart, removeFromCart, updateQuantity, cartCount
}