const User = require('../models/userModel');
const Order = require('../models/orderModel');


const loadSalesReport = async (req, res) => {
    try {
        const { page = 1, limit = 4, search } = req.query;

        const skip = (page - 1) * limit;

        let query = {};

        if (search) {
            query = {
                $or: [
                    { status: { $regex: search, $options: 'i' } }, // Case-insensitive search for name
                    { paymentMethod: { $regex: search, $options: 'i' } } // Case-insensitive search for description
                ]
            };
        }

        const orders = await Order.find(query)
            .skip(skip)
            .limit(limit)
            .populate('customer')
            .populate({ path: 'items.product', model: 'Product' });

        //const orders = await Order.find({}).populate('customer').populate({ path: 'items.product', model: 'Product' });
        const orderCount = await Order.find({}).count();
        const totalPages = Math.ceil(orderCount / limit);

        return res.render('salesReport', { orders, orderCount, currentPage: parseInt(page), totalPages, limit: parseInt(limit), search });
        // res.render('salesReport');
    } catch (error) {
        console.log(error);
        res.status(500).send('invalid error')
    }
}
module.exports = { loadSalesReport }