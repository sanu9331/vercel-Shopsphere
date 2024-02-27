const Wallet = require("../models/walletModel");
const Razorpay = require('razorpay');

const loadWallet = async (req, res) => {
    try {
        const walletData = await Wallet.find().sort({ date: -1 });
        const result = await Wallet.aggregate([
            {
                $group: {
                    _id: null,
                    totalPrice: { $sum: "$amount" }
                }
            }
        ]);

        const totalWalletPrice = result.length > 0 ? result[0].totalPrice : 0;
        console.log('tp=', totalWalletPrice);
        return res.render('wallet', { walletData, totalWalletPrice });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}




// const razorpay = new Razorpay({
//     key_id: 'rzp_test_2iKg9k1NXeJb8P',
//     key_secret: 'Uv4qKlGbPrc5cvE33Q5nWKWx',
// });
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_ID_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY
});


const walletOrder = async (req, res) => {
    console.log('Request body:', req.body);
    const amount = req.body.amount * 100;
    const currency = 'INR';

    console.log('amount=', amount);

    const options = {
        amount,
        currency,
        receipt: 'order_rcptid_' + Date.now(),
        payment_capture: 1,
    };
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    console.log('razorpay payment id=', razorpay_payment_id);
    try {
        const response = await razorpay.orders.create(options);
        console.log('response=', response);
        //res.json(response);
        res.json({
            key_id: process.env.RAZORPAY_ID_KEY,
            ...response,
        });

        // if (razorpay_payment_id) {
        //     const walletTransaction = new Wallet({
        //         paymentType: 'Razorpay',
        //         amount: response.amount / 100,
        //         date: new Date(),
        //         description: 'Added money to wallet',
        //     });

        //     await walletTransaction.save();
        // }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create Razorpay order.' });
    }
};

const completeTransaction = async (req, res) => {
    const { razorpay_payment_id, amount } = req.body;
    console.log('complete transaction=', req.body);
    // Check if Razorpay payment ID is present
    if (razorpay_payment_id) {
        // Additional logic to verify payment success using Razorpay APIs if needed

        // Save data to the database only if payment is successful
        const walletTransaction = new Wallet({
            paymentType: 'Razorpay',
            amount: amount / 100, // Assuming the amount is in paisa
            date: new Date(),
            description: 'Added money to wallet',
        });

        try {
            await walletTransaction.save();
            res.status(200).json({ message: 'Transaction completed successfully.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to save transaction to the database.' });
        }
    } else {
        res.status(400).json({ error: 'Invalid Razorpay payment ID.' });
    }
};


module.exports = {
    loadWallet, walletOrder, completeTransaction
}