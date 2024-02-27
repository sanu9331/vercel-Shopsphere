const Coupon = require("../models/couponModel");
const { cartCount } = require("./cartController");
const Cart = require('../models/cartModel');


const loadCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find();
        return res.render('coupons', { coupons });
    } catch (error) {
        console.log(error);
    }
}

const addCoupon = async (req, res) => {

    try {

        const { couponCode, discountPercentage, expiryDate, minOrderAmount, status } = req.body;
        console.log('coupon details', req.body);
        const couponEndDate = new Date(expiryDate);
        const currentDate = new Date();


        if (couponEndDate < currentDate) {
            console.log("error date");
            req.flash('error', 'Please select a valid date');
            return res.redirect('/admin/coupons');
        } else if (discountPercentage <= 0 || discountPercentage > 100) {
            req.flash('error', 'enter valid percentage');
            return res.redirect('/admin/coupons');
        } else {
            const existingCoupon = await Coupon.findOne({ code: couponCode });

            if (existingCoupon) {
                req.flash('error', 'Coupon with the same code already exists');
                return res.redirect('/admin/coupons');
            }

            const coupon = new Coupon({
                code: couponCode,
                discountPercentage: parseInt(discountPercentage),
                expiry: expiryDate,
                minOrderAmount: parseInt(minOrderAmount),
                isActive: status,
            });

            await coupon.save();

            req.flash('success', 'coupon created');
            res.redirect('/admin/coupons');
        }
    } catch (error) {
        console.error(error);
    }
}

const applyCoupon = async (req, res) => {
    try {
        const cartIds = req.body.cartIds; // Array of cartIds
        console.log('cart ids=', cartIds);
        const userId = req.session.user_id;
        console.log('user=', userId);
        const couponCode = req.body.couponCode;
        const totalPrice = req.body.totalRs;
        console.log('totalprice=', totalPrice);
        const coupon = await Coupon.findOne({ code: couponCode });
        console.log('coupon=', coupon);

        if (!coupon) {
            throw new Error('Invalid coupon code!');
        }

        if (coupon && coupon.isActive) {
            // Check if the user has already used the coupon
            const userUsedCoupon = coupon.usedUsers.some(user => user.user_id.equals(userId));

            if (userUsedCoupon) {
                req.flash('error', 'Coupon has already been used by this user.');
                return res.redirect('/checkout');
            }

            if (totalPrice >= coupon.minOrderAmount && !userUsedCoupon) {
                // Calculate the discount amount based on the discount percentage
                const discountAmount = (coupon.discountPercentage / 100) * totalPrice;
                console.log('discountAmount', discountAmount);
                // Calculate the new total amount after applying the discount
                const discountedTotalAmount = totalPrice - discountAmount;
                console.log('discountedTotalAmount', discountedTotalAmount);

                // Save the coupon usage in the database
                await Coupon.updateOne({ code: couponCode }, { $push: { usedUsers: { user_id: userId } } });
                const updatedCartItems = await Cart.updateOne({ _id: { $in: cartIds } }, { couponDiscountPrice: discountedTotalAmount });
                if (!updatedCartItems) {
                    console.log('Cart item not found');
                }

                // Redirect to checkout page with applied coupon details
                const redirectURL = `/checkout?discount=${discountedTotalAmount}&couponApplied=true`;
                return res.redirect(redirectURL);
            } else {
                res.status(400).json({ success: false, message: 'Order total is below the minimum required for the coupon' });
            }
        } else {
            // Coupon is not valid or inactive
            res.status(400).json({ success: false, message: 'Invalid or inactive coupon code' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const couponDelete = async (req, res) => {
    try {
        const couponId = req.params.couponId;
        console.log('coupon id=', couponId);

        const coupon = await Coupon.findById(couponId);

        // if (!coupon) {
        //     return res.status(404).send({ error: 'Coupon not found' });
        // }

        // Delete the coupon
        await Coupon.deleteOne({ _id: couponId });
        return res.redirect('/admin/coupons');
    } catch (error) {
        console.log(error);
        res.status(500).send('invalid server error');

    }
}

module.exports = {
    loadCoupons, addCoupon, applyCoupon, couponDelete
}