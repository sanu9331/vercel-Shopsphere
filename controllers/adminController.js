const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');
const userOTPVeryModel = require("../models/userVerifyOTPModel");
const Order = require("../models/orderModel");
const Wallet = require("../models/walletModel");
const excelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const Product = require("../models/productModel");
const ReturnData = require('../models/ReturnOrder');

const loadLogin = async (req, res) => {

    try {
        return res.render('login');
    } catch (error) {
        console.log(error.message);
    }
}

// const verifyLogin = async (req, res) => {

//     try {
//         const email = req.body.email;
//         const password = req.body.password;

//         const userData = await User.findOne({ email: email });
//         if (userData) {
//             const passwordMatch = bcrypt.compare(password, userData.password);

//             if (passwordMatch) {

//                 if (userData.is_admin === 0) {
//                     res.render('login', { message: "email and password is incorrect!" });
//                 } else {
//                     req.session.user_id = userData._id;
//                     res.redirect("/admin/home");
//                 }

//             } else {
//                 res.render('login', { message: "email and password is incorrect!" });
//             }

//         } else {
//             res.render('login', { message: "email and password is incorrect!" });
//         }


//     } catch (error) {
//         console.log(error.message);
//     }
// }
const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({ email: email });
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);

            if (passwordMatch) {

                if (userData.is_admin === 1 && userData.is_verified === 1) {
                    req.session.admin_id = userData._id;
                    return res.redirect("/admin/home");
                } else {
                    return res.render('login', { message: "You do not have permission to access the home page." });
                }

            } else {
                return res.render('login', { message: "Email and password are incorrect!" });
            }

        } else {
            return res.render('login', { message: "Email and password are incorrect!" });
        }

    } catch (error) {
        console.log(error.message);
    }
}


// const loadDashboard = async (req, res) => {

//     try {
//         const totalOrders = await Order.countDocuments({});
//         const totalUsers = await User.countDocuments({});
//         const userData = await User.findById({ _id: req.session.admin_id })
//         return res.render("Home", { admin: userData, totalOrders, totalUsers });
//     } catch (error) {
//         console.log(error.message);
//     }
// }
const loadDashboard = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments({});
        const totalUsers = await User.countDocuments({});
        const userData = await User.findById(req.session.admin_id);

        const currentDate = new Date();

        // Fetch daily sales data
        //const dailySalesData = await fetchSalesData(currentDate, currentDate);
        const dailyStartDate = new Date(currentDate);
        dailyStartDate.setHours(0, 0, 0, 0);
        const dailyEndDate = new Date(currentDate);
        dailyEndDate.setHours(23, 59, 59, 999);
        const dailySalesData = await fetchSalesData(dailyStartDate, dailyEndDate);

        // Fetch weekly sales data
        const weeklyStartDate = new Date(currentDate);
        weeklyStartDate.setDate(currentDate.getDate() - 7);
        const weeklySalesData = await fetchSalesData(weeklyStartDate, currentDate);

        // Fetch yearly sales data
        const yearlyStartDate = new Date(currentDate);
        yearlyStartDate.setFullYear(currentDate.getFullYear() - 1);
        const yearlySalesData = await fetchSalesData(yearlyStartDate, currentDate);

        console.log('daily sales=', dailySalesData);
        console.log('weekly sales=', weeklySalesData);
        console.log('yearly sales=', yearlySalesData);

        return res.render("Home", {
            admin: userData,
            totalOrders,
            totalUsers,
            dailySalesData,
            weeklySalesData,
            yearlySalesData
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const fetchSalesData = async (startDate, endDate) => {
    const salesData = await Order.find({
        orderDate: { $gte: startDate, $lte: endDate },
        status: { $in: ['delivered', 'Returned'] } // Adjust status as needed
    }).populate('items.product', 'name'); // Assuming you want to populate product details

    const totalSales = salesData.reduce((total, order) => total + order.totalAmount, 0);
    const numberOfTransactions = salesData.length;

    return { totalSales, numberOfTransactions, salesData };
};





const logout = async (req, res) => {

    try {

        req.session.destroy();
        return res.redirect("/admin");

    } catch (error) {
        console.log(error.message);
    }
}

//changes sanu
const loadRegister = async (req, res) => {
    try {
        return res.render('registration')
    } catch (error) {
        console.log(error.message);
    }
}
const securePassword = async (password) => {

    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}

const generateOTP = () => {
    // Generate a random 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendEmail = async (email, otpCode) => {

    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: "sanusk9331@gmail.com",
                pass: 'bvzm hnic xpnx ymxd'
            }
        });


        const mailOptions = {
            from: 'sanusk9331@gmail.com',
            to: email,
            subject: 'for OTP verification',
            html: `Your OTP code is: ${otpCode}`
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('email have been send:-', info.response);
            }
        })

    } catch (error) {
        console.log(error.message);
    }
}

const generateAndSendOTP = async (email) => {
    try {
        const otpCode = generateOTP();
        const otpExpiration = new Date(Date.now() + 600000); // OTP expires in 10 minutes

        await userOTPVeryModel.updateOne(
            { email },
            { otpCode, otpExpiration },
            { upsert: true }
        );

        sendEmail(email, otpCode);
    } catch (error) {
        console.log(error.message);
    }
};

const insertUser = async (req, res) => {
    try {
        const { name, email, mno, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.render('registration', { message: "Password and Confirm Password do not match" });
        }
        else if (mno.length > 10 || mno.length < 10) {
            return res.render('registration', { message: "mobile number should be a 10 digit number" });
        } else if (password.length < 4 || password.length > 20) {
            return res.render('registration', { message: "password length should be between 4 and 20 letters" });
        } else if (password.length == '') {
            return res.render('registration', { message: "password should not be null" });
        } else if (name.length > 10) {
            return res.render('registration', { message: "name should be less than 10 letters" });
        }


        const spassword = await securePassword(req.body.password);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mno,
            // image: req.file.filename,
            password: spassword,
            is_admin: 1,
            is_verified: 0
        });

        const userData = await user.save();


        if (userData) {
            generateAndSendOTP(userData.email);
            // Redirect to the OTP verification page with _id and email as URL parameters
            return res.redirect(`/admin/verify?_id=${userData._id}&email=${userData.email}`);
            //sendVerifyMail(req.body.name, req.body.email, userData._id);
            // res.render('registration', { message: "your registration has been successfull.please verify your mail" });
        } else {
            return res.render('registration', { message: "your registration has been failed." });
        }

    } catch (error) {
        console.log(error.message);
    }
}

const loadVerify = async (req, res) => {
    try {
        const email = req.query.email;

        // Check if the user is already verified
        const userData = await User.findOne({ email: email, is_verified: true });

        if (userData) {
            // User is already verified, redirect to a different page
            return res.redirect('/admin');
        }


        // User is not yet verified, render the verifyOTP page
        return res.render("AverifyOTP");

    } catch (error) {
        console.log(error.message);
        // Handle the error
        return res.render("AverifyOTP", { error: "An error occurred." });
    }
};


//VERIFY OTP
const verifyOTP = async (req, res) => {
    try {
        const id = req.query._id;
        const email = req.query.email;
        const otp = req.body.otp;

        const userData = await User.findOne({ _id: id, email: email });
        const OTPData = await userOTPVeryModel.findOne({
            email: email,
            otpCode: otp,
        });


        if (!userData || !otp) {
            console.log("Invalid OTP or user already verified");
            return res.render("AverifyOTP", {
                error: "Invalid OTP or user already verified",
            });
        }

        if (userData && OTPData && OTPData.otpCode === otp) {
            await User.updateOne({ _id: id }, { $set: { is_verified: 1 } });
            await userOTPVeryModel.deleteOne({ _id: OTPData._id }); // Assuming _id is the unique identifier for the OTPData
            req.session.admin = {

                isUserAuthenticated: true,
                userId: userData._id,
                username: userData.name,

            }

            return res.redirect('/admin');
        } else {
            return res.render("AverifyOTP", {
                error: "Invalid OTP",
            });
        }
    } catch (error) {
        console.error("Error verifying OTP:", error.message);
        return res.render("AverifyOTP", {
            error: "An error occurred during OTP verification. Please try again.",
        });
    }
};



const verifyMail = async (req, res) => {

    try {
        const updateInfo = await User.updateOne({ _id: req.query.id }, { $set: { is_verified: 1 } });

        console.log(updateInfo);
        console.log('hi sanu');
        res.render('admin-email-verified');


    } catch (error) {
        console.log(error.message);
    }
}


//***** order management *****
// const GETloadOrder = async (req, res) => {
//     try {
//         const userID = req.query.userID;
//         console.log('GEtloadOrder :=', userID);

//         // // Check if userID is defined
//         if (!userID) {
//             return res.status(400).send('User ID is required');
//         }
//         console.log('sanu GETloadOrder');
//         // const orders = await Order.find({ customer: userID }).populate('items.product');
//         const orders = await Order.find({ 'customer': userID }).populate('customer').populate({ path: 'items.product', model: 'Product' }).sort({ orderDate: - 1 });
//         const userData = await User.findById(userID);

//         //console.log('Fetched orders:', orders);
//         //console.log('Fetched userData:', userData);

//         //res.render('orders', { orders, userData });
//         res.render('orders', {
//             orders, userData,
//             orderNumber: req.body.orderNumber,
//             returnReason: req.body.returnReason,
//             returnOptions: req.body.returnOptions,
//         });
//     } catch (error) {
//         console.log(error);
//     }
// }
const GETloadOrder = async (req, res) => {
    try {
        const { search } = req.query;
        const userID = req.query.userID;
        console.log('GEtloadOrder :=', userID);

        let query = {};

        if (search) {
            query = {
                $or: [{
                    status: { $regex: search, $options: 'i' },
                    paymentMethod: { $regex: search, $options: 'i' }
                }]
            };
        }

        if (!userID) {
            return res.status(400).send('User ID is required');
        }

        // Fetch return data for the current user
        const returnData = await ReturnData.find({ userId: userID });

        // console.log('return data=', returnData);
        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const skip = (page - 1) * limit;

        const totalOrders = await Order.countDocuments({ 'customer': userID, ...query });

        const orders = await Order.find({ 'customer': userID, ...query })
            .populate('customer')
            .populate({ path: 'items.product', model: 'Product' })
            .sort({ orderDate: -1 })
            .skip(skip)
            .limit(limit);

        const userData = await User.findById(userID);
        const totalPages = Math.ceil(totalOrders / limit);

        res.render('orders', {
            orders,
            userData,
            returnData,
            totalPages: totalPages,
            currentPage: page, userID: userID
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
    }
}




const loadOrder = async (req, res) => {
    try {

        // const orderNumber = req.body.orderNumber;
        // const returnReason = req.body.returnReason;
        // const returnOptions = req.body.returnOptions
        const { orderNumber, returnReason, returnOptions } = req.session.orderReturnData || {};
        console.log('orderNumber= Lo', orderNumber);
        console.log('returnReason=lo', returnReason);
        console.log('returnOptions=lo', returnOptions);

        const userID = req.body.userID;
        if (returnReason && returnOptions && orderNumber && userID) {
            return res.redirect('/viewUserOrders');
        }
        console.log('loadOrder userID 1:', userID);

        if (!userID) {
            return res.status(400).send('User ID is required');
        }
        console.log('sanu loadOrder');
        const orders = await Order.find({ 'customer': userID }).populate('customer').populate({ path: 'items.product', model: 'Product' });
        console.log('orders SANU=', orders);
        const userData = await User.findById(userID);


        res.render('orders', {
            orders, userData,
            orderNumber,
            returnReason,
            returnOptions
        });

    } catch (error) {
        console.log(error.message);
    }
}



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
        } else {
            // Product with the given product_id not found in the cart
            console.log('order not found .');
            res.sendStatus(404); // Not Found
        }
    } catch (error) {
        console.error('Error:', error);
        res.sendStatus(500); // Internal Server Error
    }
};

const orderStatus = async (req, res) => {

    try {

        console.log('sanu orderStatus');
        const orderId = req.params.id;
        const newStatus = req.body.status;
        const userId = req.body.userID;

        console.log('orderId:', orderId);
        console.log('newStatus:', newStatus);
        // console.log('userId:', userId);

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).send('Order not found');
        }

        order.status = newStatus;


        await order.save();

        // res.redirect('/admin / orders');
        res.redirect(`/admin/orders?userID=${userId}`);

    } catch (error) {
        console.log(error.message);
    }
}








// const orderHistorLoad = async (req, res) => {
//     try {
//         // const orders = await Order.find({}).populate({ path: 'items.product', model: 'Product' });
//         const orders = await Order.find({}).populate('customer').populate({ path: 'items.product', model: 'Product' });
//         const orderCount = await Order.find({}).count()
//         return res.render('orderHistory', { orders, orderCount });
//     } catch (error) {
//         console.log(error);
//     }
// }

const orderHistorLoad = async (req, res) => {
    try {
        const { page = 1, limit = 4, search } = req.query;

        const skip = (page - 1) * limit;

        let query = {};

        if (search) {
            query = {
                $or: [
                    { 'customer.name': { $regex: search, $options: 'i' } }, // Assuming customer name is a field within the customer object
                    { status: { $regex: search, $options: 'i' } },
                    { paymentMethod: { $regex: search, $options: 'i' } },
                    // You may need to adjust this depending on how you want to search for the total amount
                    // Add other fields as needed

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

        return res.render('orderHistory', { orders, orderCount, currentPage: parseInt(page), totalPages, limit: parseInt(limit), search });
    } catch (error) {
        console.log(error);
    }
}

//export users excel
const exportUsers = async (req, res) => {
    try {
        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet("My Users");

        worksheet.columns = [
            // { header: "s no.", key: "id" },
            { header: "Name", key: "name" },
            { header: "Email ID", key: "email" },
            { header: "Mobile", key: "mobile" },
            { header: "Is Admin", key: "is_admin" },
            { header: "Is verified", key: "is_verified" },
        ];
        let counter = 1;
        const userData = await User.find({ is_admin: 0 });
        userData.forEach((user) => {
            user.s_no = counter;
            worksheet.addRow(user);
            counter++;
        });

        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true }
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=users.xlsx"
        );

        return workbook.xlsx.write(res).then(() => {
            res.status(200);
        });

    } catch (error) {
        console.log(error);
        res.status(500).send('invalid server error');
    }
}

//export users PDF
const exportToPDF = async (req, res) => {
    try {
        const users = await User.find(); // Fetch data from MongoDB

        // Create a new PDF document
        const pdfDoc = new PDFDocument();
        const filename = 'users_report.pdf';

        // Set response headers
        res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
        res.setHeader('Content-type', 'application/pdf');

        // Pipe the PDF document to the response stream
        pdfDoc.pipe(res);

        // Add content to the PDF document
        pdfDoc.fontSize(16).text('User Report', { align: 'center' });
        pdfDoc.moveDown();

        // Loop through the users data and add to the PDF document
        users.forEach(user => {
            pdfDoc.text(`Name: ${user.name}`);
            pdfDoc.text(`Email: ${user.email}`);
            pdfDoc.text(`Mobile: ${user.mobile}`);
            pdfDoc.moveDown();
        });

        // Finalize the PDF document
        pdfDoc.end();

    } catch (error) {
        console.error('Error exporting to PDF:', error);
        res.status(500).send('Internal Server Error');
    }
};


//export ORDER excel
const exportOrders = async (req, res) => {
    try {
        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet("My Users");

        worksheet.columns = [
            { header: "OrderDate", key: "orderDate", width: 20, style: { numFmt: "yyyy-mm-dd hh:mm:ss" } },
            { header: "Status", key: "status" },
            { header: "PaymentMethod", key: "paymentMethod" },
            { header: "OrderAddress", key: "orderAddress" },
            { header: "TotalAmount", key: "totalAmount" },
        ];
        let counter = 1;
        const orderData = await Order.find({});
        orderData.forEach((user) => {
            user.s_no = counter;
            worksheet.addRow(user);
            counter++;
        });

        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true }
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=users.xlsx"
        );

        return workbook.xlsx.write(res).then(() => {
            res.status(200);
        });

    } catch (error) {
        console.log(error);
        res.status(500).send('invalid server error');
    }
}

//export order PDF
const exportOrdersToPDF = async (req, res) => {
    try {
        const orders = await Order.find({});

        // Create a new PDF document
        const pdfDoc = new PDFDocument();
        const filename = 'order_report.pdf';

        // Set response headers
        res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
        res.setHeader('Content-type', 'application/pdf');

        // Pipe the PDF document to the response stream
        pdfDoc.pipe(res);

        // Add content to the PDF document
        pdfDoc.fontSize(16).text('User Report', { align: 'center' });
        pdfDoc.moveDown();

        // Loop through the users data and add to the PDF document
        orders.forEach(order => {
            pdfDoc.text(`OrderDate: ${order.orderDate}`);
            pdfDoc.text(`Status: ${order.status}`);
            pdfDoc.text(`PaymentMethod: ${order.paymentMethod}`);
            pdfDoc.text(`OrderAddress: ${order.orderAddress}`);
            pdfDoc.text(`TotalAmount: ${order.totalAmount}`);
            pdfDoc.moveDown();
        });

        // Finalize the PDF document
        pdfDoc.end();

    } catch (error) {
        console.error('Error exporting to PDF:', error);
        res.status(500).send('Internal Server Error');
    }
};



// const customOrdersExcel = async (req, res) => {
//     try {
//         // Parse date strings using Moment.js
//         const startDate = req.query.startDate;
//         const endDate = req.query.endDate;
//         console.log('startdate=', startDate);
//         console.log('enddate=', endDate);

//         // Check if startDate or endDate is invalid
//         if (!startDate || !endDate) {
//             return res.status(400).send('Invalid date format');
//         }

//         // Query orders using startDate and endDate
//         const orderData = await Order.find({
//             orderDate: {
//                 $gte: startDate,
//                 $lte: endDate
//             }
//         });

//         // Create Excel workbook and worksheet
//         const workbook = new excelJS.Workbook();
//         const worksheet = workbook.addWorksheet("My Users");

//         // Define worksheet columns
//         worksheet.columns = [
//             { header: "OrderDate", key: "orderDate", width: 20, style: { numFmt: "yyyy-mm-dd hh:mm:ss" } },
//             { header: "Status", key: "status" },
//             { header: "PaymentMethod", key: "paymentMethod" },
//             { header: "OrderAddress", key: "orderAddress" },
//             { header: "TotalAmount", key: "totalAmount" },
//         ];

//         let counter = 1;

//         // Add order data to the worksheet
//         orderData.forEach((user) => {
//             user.s_no = counter;
//             worksheet.addRow(user);
//             counter++;
//         });

//         // Set font style for the header row
//         worksheet.getRow(1).eachCell((cell) => {
//             cell.font = { bold: true }
//         });

//         // Set response headers for Excel file
//         res.setHeader(
//             "Content-Type",
//             "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//         );

//         res.setHeader(
//             "Content-Disposition",
//             "attachment; filename=users.xlsx"
//         );

//         // Write workbook to response and send it
//         return workbook.xlsx.write(res).then(() => {
//             res.status(200).end();
//         });

//     } catch (error) {
//         console.log(error);
//         res.status(500).send('Invalid server error');
//     }
// };

//custom order excel
const customOrdersExcel = async (req, res) => {
    try {
        const startDate = new Date(req.query.startDate + 'T00:00:00.000Z'); // Ensure start of the day
        const endDate = new Date(req.query.endDate + 'T23:59:59.999Z'); // Ensure end of the day


        console.log('start date=', startDate);
        console.log('end date=', endDate);

        if (!startDate || !endDate) {
            return res.status(400).send('Invalid date format');
        }

        const orderData = await Order.find({
            orderDate: {
                $gte: startDate,
                $lte: endDate
            }
        }).populate('customer').populate('items.product');


        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet("My Orders");

        worksheet.columns = [
            { header: "OrderDate", key: "orderDate", width: 20, style: { numFmt: "yyyy-mm-dd hh:mm:ss" } },
            { header: "CustomerName", key: "customerName" },
            { header: "Status", key: "status" },
            { header: "PaymentMethod", key: "paymentMethod" },
            { header: "OrderAddress", key: "orderAddress" },
            { header: "ProductName", key: "productName" },
            { header: "Quantity", key: "quantity" },
            { header: "Price", key: "price" },
            { header: "TotalAmount", key: "totalAmount" },
        ];

        let counter = 1;

        for (const order of orderData) {
            for (const item of order.items) {
                worksheet.addRow({
                    orderDate: order.orderDate,
                    customerName: order.customer.name,
                    status: order.status,
                    paymentMethod: order.paymentMethod,
                    orderAddress: order.orderAddress,
                    totalAmount: order.totalAmount,
                    productName: item.product.name,
                    quantity: item.quantity,
                    price: item.price,
                    s_no: counter++
                });
            }
        }

        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=orders.xlsx"
        );

        return workbook.xlsx.write(res).then(() => {
            res.status(200).end();
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Invalid server error');
    }
};

//custom order pdf
const customOrdersToPDF = async (req, res) => {
    try {
        const startDate = new Date(req.query.startDate + 'T00:00:00.000Z'); // Ensure start of the day
        const endDate = new Date(req.query.endDate + 'T23:59:59.999Z'); // Ensure end of the day


        if (!startDate || !endDate) {
            return res.status(400).send('Invalid date format');
        }

        const orders = await Order.find({
            orderDate: {
                $gte: startDate,
                $lte: endDate
            }
        }).populate('customer').populate('items.product');

        const pdfDoc = new PDFDocument();
        const filename = 'order_report.pdf';

        res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
        res.setHeader('Content-type', 'application/pdf');

        pdfDoc.pipe(res);

        pdfDoc.fontSize(16).text('Order Report', { align: 'center' });
        pdfDoc.moveDown();

        orders.forEach(order => {
            pdfDoc.text(`Order Date: ${order.orderDate}`);
            pdfDoc.text(`Customer Name: ${order.customer.name}`);
            pdfDoc.text(`Status: ${order.status}`);
            pdfDoc.text(`Payment Method: ${order.paymentMethod}`);
            pdfDoc.text(`Order Address: ${order.orderAddress}`);
            pdfDoc.text(`Total Amount: ${order.totalAmount}`);

            order.items.forEach(item => {
                pdfDoc.text(`Product: ${item.product.name}`);
                pdfDoc.text(`Quantity: ${item.quantity}`);
                pdfDoc.text(`Price: ${item.price}`);
                pdfDoc.moveDown();
            });

            pdfDoc.moveDown();
        });

        pdfDoc.end();
    } catch (error) {
        console.error('Error exporting to PDF:', error);
        res.status(500).send('Internal Server Error');
    }
};


const approveReturnOrder = async (req, res) => {
    try {
        const orderNumber = req.body.orderNumber;
        const returnReason = req.body.returnReason;
        const returnOptions = req.body.returnOptions;
        const userID = req.body.userID;

        console.log('order number=', orderNumber);
        console.log('return reason=', returnReason);
        console.log('return options=', returnOptions);
        console.log('userId=', userID);

        // Find the order by order number
        const order = await Order.findById(orderNumber);

        if (!order) {
            return res.status(404).send('Order not found');
        }

        if (req.body.action === 'approve') {
            // Update the order status to 'returnApproved'
            order.status = 'returnApproved';
            await order.save();

            // Delete the ReturnData entry
            await ReturnData.findOneAndDelete({ orderNumber });


            // Credit the user's wallet with the order price
            const user = await User.findById(userID);
            if (!user) {
                return res.status(404).send('User not found');
            }

            // Create a new wallet transaction
            const walletTransaction = new Wallet({
                paymentType: 'credit',
                amount: order.totalAmount,
                date: new Date(),
                description: `Refund for order ${orderNumber}`
            });
            await walletTransaction.save();

            // Redirect to the admin orders page with the user ID as a query parameter
            res.redirect(`/admin/orders?userID=${userID}`);
        } else if (req.body.action === 'reject') {
            // Handle rejection logic here
            order.status = 'returnRejected';
            await order.save();
            await ReturnData.findOneAndDelete({ orderNumber });
            // Redirect to a different URL for rejection
            res.redirect(`/admin/orders?userID=${userID}`);
        }

    } catch (error) {
        console.log(error);
        res.status(500).send('invalid server error');
    }
}



module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    logout,
    loadRegister,
    insertUser,
    verifyMail,
    verifyOTP,
    loadVerify, sendEmail,
    GETloadOrder, loadOrder, removeOrder, orderStatus,
    orderHistorLoad,
    exportUsers, exportToPDF, exportOrders, exportOrdersToPDF, customOrdersExcel, customOrdersToPDF,
    approveReturnOrder

}