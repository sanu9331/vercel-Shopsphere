const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer')
const userOTPVeryModel = require("../models/userVerifyOTPModel");
const Order = require('../models/orderModel');
const randomstring = require("randomstring");
const config = require("../config/config");



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

//for send mail
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
            subject: 'Email OTP Verification',
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

//for reset password send mail
const sendResetPasswordMail = async (name, email, token) => {

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
            subject: 'for reset Password',
            html: '<p>hii ' + name + ',please click here to <a href="http://127.0.0.1:3000/forget-password?token=' + token + '"> Reset </a> your password</p>'
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

//for changing user password, sanu
const changePasswordMail = async (name, email, token) => {

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
            subject: 'for changing user Password',
            html: '<p>hii ' + name + ',please click here to <a href="http://127.0.0.1:3000/reset-password?token=' + token + '"> Reset </a> your password</p>'
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
    const otpCode = generateOTP();
    const otpExpiration = new Date(Date.now() + 600000); // OTP expires in 10 minutes

    await userOTPVeryModel.updateOne(
        { email },
        { otpCode, otpExpiration },
        { upsert: true }
    );

    sendEmail(email, otpCode);
};


const loadRegister = async (req, res) => {
    try {
        return res.render('registration')
    } catch (error) {
        console.log(error.message);
    }
}


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
            is_admin: 0,
            is_verified: 0
        });

        const userData = await user.save();

        if (userData) {
            generateAndSendOTP(userData.email);
            // Redirect to the OTP verification page with _id and email as URL parameters

            return res.redirect(`/verify?_id=${userData._id}&email=${userData.email}`);

            // sendVerifyMail(req.body.name, req.body.email, userData._id);
            //res.render('registration', { message: "your registration has been successfull.please verify your mail" });
        } else {
            return res.render('registration', { message: "your registration has been failed." });
        }

    } catch (error) {
        console.log("Error inserting user:", error.message);
    }
}

const loadVerify = async (req, res) => {
    try {
        const email = req.query.email;

        // Check if the user is already verified
        const userData = await User.findOne({ email: email, is_verified: true });

        if (userData) {
            // User is already verified, redirect to a different page
            return res.redirect('/');

        }

        // User is not yet verified, render the verifyOTP page
        return res.render("verifyOTP");
    } catch (error) {
        console.log(error.message);
        // Handle the error
        return res.render("verifyOTP", { error: "An error occurred." });
    }
};


const verifyMail = async (req, res) => {

    try {
        const updateInfo = await User.updateOne({ _id: req.query.id }, { $set: { is_verified: 1 } });

        console.log(updateInfo);
        return res.render('email-verified');

    } catch (error) {
        console.log(error.message);
    }
}

//login user methods started
const loginLoad = async (req, res) => {

    try {
        return res.render('login')
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

//             const passwordMatch = await bcrypt.compare(password, userData.password);
//             if (passwordMatch) {
//                 if (userData.is_verified === 0 || userData.is_admin === 1 || userData.status === false) {
//                     return res.render('login', { message: "please verify your mail" })

//                 } else {

//                     req.session.user_id = userData._id;
//                     return res.redirect('/home')
//                 }
//             } else {
//                 return res.render("login", { error: "An error occurred." })
//             }


//         } else {
//             return res.render('login', { message: "Email & password is incorrect" })
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
                if (userData.is_verified === 0) {
                    return res.render('login', { message: "please verify your mail" })

                } else if (userData.is_admin === 1) {
                    return res.render('login', { message: "admin restricted" })
                } else if (userData.status === false) {
                    return res.render('login', { message: "this User is blocked" })
                } else {
                    req.session.user_id = userData._id;
                    req.session.user = {
                        isUserAuthenticated: true,
                        user_Id: userData._id,
                        username: userData.name,
                        useremail: userData.email //sanu
                    };
                    console.log(req.session);
                    return res.redirect('/home')
                }


            } else {
                return res.render("login", { message: "wrong password" })
            }


        } else {
            return res.render('login', { message: "Email incorrect" })
        }

    } catch (error) {
        console.log(error.message);
    }
}

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
            return res.render("verifyOTP", {
                error: "Invalid OTP or user already verified",
            });
        }

        if (userData && OTPData && OTPData.otpCode === otp) {
            await User.updateOne({ _id: id }, { $set: { is_verified: 1 } });
            await userOTPVeryModel.deleteOne({ _id: OTPData._id }); // Assuming _id is the unique identifier for the OTPData
            req.session.user = {
                isUserAuthenticated: true,
                userId: userData._id,
                username: userData.name,



            }
            return res.redirect('/login');
        } else {
            return res.render("verifyOTP", {
                error: "Invalid OTP",
            });
        }
    } catch (error) {
        console.error("Error verifying OTP:", error.message);
        return res.render("verifyOTP", {
            error: "An error occurred during OTP verification. Please try again.",
        });
    }
};


// const resendOTP = async (req, res) => {
//     try {
//         // Implement logic to generate and send a new OTP to the user's email
//         const newOTP = generateOTP();// Implement this function to generate a new OTP
//         console.log(newOTP);
//         const userEmail = req.session.email; // Adjust this based on your session implementation
//         console.log(userEmail);
//         // Log the new OTP for testing purposes
//         console.log(`New OTP for ${userEmail}: ${newOTP}`);

//         // Respond with a success message or any relevant information
//         res.json({ message: 'OTP resent successfully' });
//     } catch (error) {
//         console.error("Error resending OTP:", error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };
const resendOTP = async (req, res) => {
    try {
        console.log(req.session);
        // Check if user is logged in and email is available in the session
        if (req.session.useremail) {
            const newOTP = generateOTP(); // Implement this function to generate a new OTP
            const userEmail = req.session.useremail;

            // Log the new OTP for testing purposes
            console.log(`New OTP for ${userEmail}: ${newOTP}`);

            // Respond with a success message or any relevant information
            res.json({ message: 'OTP resent successfully' });
        } else {
            console.error("User not authenticated or email not found in session");
            res.status(401).json({ error: 'User not authenticated or email not found in session' });
        }
    } catch (error) {
        console.error("Error resending OTP:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



const loadHome = async (req, res) => {

    try {
        return res.render('home')
    } catch (error) {
        console.log(error.message);
    }
}


const userLogout = async (req, res) => {

    try {
        req.session.destroy();
        return res.redirect('/')
    } catch (error) {
        console.log(error.message);
    }
}

//user profile
const userProfile = async (req, res) => {

    try {
        // const orderId = req.body.order_id;
        // console.log('orderId:', orderId);
        const userId = req.session.user_id;
        const userData = await User.findById({ _id: userId });


        const orders = await Order.find({ 'customer': userId }).populate('customer').populate({ path: 'items.product', model: 'Product' });

        if (userData) {
            return res.render('userProfile', { userData, orders });

        } else {
            return res.status(404).send('User not found');
        }


    } catch (error) {
        console.log(error.message);
    }
}




//user profile edit and update
const editLoad = async (req, res) => {

    try {
        const id = req.query.id;
        const userData = await User.findById({ _id: id });
        if (userData) {
            res.render("userProfile-edit", { userData });
        } else {
            res.redirect('/home');
        }
    } catch (error) {
        console.log(error.message);
    }
}

//for checking email is validd
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// const updateProfile = async (req, res) => {

//     try {
//         const { address, newAddress } = req.body;
//         console.log('new address= ', newAddress);

//         // if (address === '' && newAddress === '') {
//         //     return res.send('address cant be null');
//         // }

//         let updatedAddress = [];

//         if (address && address.length > 0) {
//             // Add existing addresses to the updatedAddress array
//             // updatedAddress = [...address];
//             updatedAddress = address.filter(existingAddress => existingAddress !== null && existingAddress !== '');
//         }

//         if (newAddress && newAddress.length > 0) {
//             // Add new addresses to the updatedAddress array
//             updatedAddress = updatedAddress.concat(newAddress);
//         }

//         updatedAddress = updatedAddress.map(addr => addr.trim());

//         const userData = await User.findById({ _id: req.body.userData_id });
//         if (req.body.name === "") {
//             req.flash('error', 'Name cannot be null. Please provide a value.');
//             return res.render('userProfile-edit', { userData });
//         }
//         if (!isValidEmail(req.body.email)) {
//             req.flash('error', 'Invalid email address.');
//             return res.render('userProfile-edit', { userData });
//         }
//         if (req.body.mobile === String) {
//             req.flash('error', 'mobile should be number.');
//             return res.render('userProfile-edit', { userData });
//         } else if (req.body.mobile === '') {
//             req.flash('error', 'mobile cannot be null.Please provide a value');
//             return res.render('userProfile-edit', { userData });
//         } else if (req.body.mobile.length < 10 || req.body.mobile.length > 10) {
//             req.flash('error', 'mobile should be a 10 digit number');
//             return res.render('userProfile-edit', { userData });
//         }

//         if (req.body.country === '') {
//             req.flash('error', 'country cannot be null.Please provide a value');
//             return res.render('userProfile-edit', { userData });
//         } else if (req.body.city === '') {
//             req.flash('error', 'city cannot be null.Please provide a value');
//             return res.render('userProfile-edit', { userData });
//         } else if (req.body.zipCode === '') {
//             req.flash('error', 'zipcode cannot be null.Please provide a value');
//             return res.render('userProfile-edit', { userData });
//         }


//         if (req.file) {
//             const userData = await User.findByIdAndUpdate({ _id: req.body.userData_id }, { $set: { name: req.body.name.trim(), email: req.body.email.trim(), mobile: req.body.mobile.trim(), gender: req.body.gender.trim(), address: updatedAddress, image: req.file.filename, country: req.body.country.trim(), city: req.body.city.trim(), zipCode: req.body.zipCode.trim() } });
//         } else {
//             const userData = await User.findByIdAndUpdate({ _id: req.body.userData_id }, { $set: { name: req.body.name.trim(), email: req.body.email.trim(), mobile: req.body.mobile.trim(), gender: req.body.gender.trim(), address: updatedAddress, country: req.body.country.trim(), city: req.body.city.trim(), zipCode: req.body.zipCode.trim() } });
//         }
//         res.redirect('/userProfile')

//     } catch (error) {
//         console.log(error.message);
//     }
// }
const updateProfile = async (req, res) => {

    try {
        // const { address, newAddress } = req.body;
        // console.log('new address= ', newAddress);



        // let updatedAddress = [];

        // if (address && address.length > 0) {

        //     updatedAddress = address.filter(existingAddress => existingAddress !== null && existingAddress !== '');
        // }

        // if (newAddress && newAddress.length > 0) {

        //     updatedAddress = updatedAddress.concat(newAddress);
        // }

        // updatedAddress = updatedAddress.map(addr => addr.trim());
        // const { name, email, mobile, gender, country, city, zipCode } = req.body;

        // const trimmedName = name.trim();
        // const trimmedEmail = email.trim();
        // const trimmedMobile = mobile.trim();
        // const trimmedCountry = country.trim();
        // const trimmedCity = city.trim();
        // const trimmedZipCode = zipCode.trim();


        const userData = await User.findById({ _id: req.body.userData_id });
        if (req.body.name === "") {
            req.flash('error', 'Name cannot be null. Please provide a value.');
            return res.render('userProfile-edit', { userData });
        }
        if (!isValidEmail(req.body.email)) {
            req.flash('error', 'Invalid email address.');
            return res.render('userProfile-edit', { userData });
        }
        if (req.body.mobile === String) {
            req.flash('error', 'mobile should be number.');
            return res.render('userProfile-edit', { userData });
        } else if (req.body.mobile === '') {
            req.flash('error', 'mobile cannot be null.Please provide a value');
            return res.render('userProfile-edit', { userData });
        } else if (req.body.mobile.length < 10 || req.body.mobile.length > 10) {
            req.flash('error', 'mobile should be a 10 digit number');
            return res.render('userProfile-edit', { userData });
        }

        if (req.body.country === '') {
            req.flash('error', 'country cannot be null.Please provide a value');
            return res.render('userProfile-edit', { userData });
        } else if (req.body.city === '') {
            req.flash('error', 'city cannot be null.Please provide a value');
            return res.render('userProfile-edit', { userData });
        } else if (req.body.zipCode === '') {
            req.flash('error', 'zipcode cannot be null.Please provide a value');
            return res.render('userProfile-edit', { userData });
        }


        if (req.file) {
            const userData = await User.findByIdAndUpdate({ _id: req.body.userData_id }, { $set: { name: req.body.name.trim(), email: req.body.email.trim(), mobile: req.body.mobile.trim(), gender: req.body.gender.trim(), image: req.file.filename, } });
        } else {
            const userData = await User.findByIdAndUpdate({ _id: req.body.userData_id }, { $set: { name: req.body.name.trim(), email: req.body.email.trim(), mobile: req.body.mobile.trim(), gender: req.body.gender.trim(), } });
        }
        res.redirect('/userProfile')

    } catch (error) {
        console.log(error.message);
    }
}


// Add new address to user
const addAddress = async (req, res) => {
    try {
        const userId = req.session.user._id; // Assuming you have user authentication middleware
        const { street, city, state, zipCode, streetaddress, postalcode, country
        } = req.body;

        console.log(req.body);
        // Create a new address object
        const newAddress = {
            street,
            city,
            state,
            zipCode,
            isDefault: false // Set to true if this is the user's default address
        };

        // Push the new address into the user's addresses array
        await User.findByIdAndUpdate(userId, { $push: { addresses: streetaddress } });

        res.redirect('/userProfile'); // Redirect to the user profile page
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};





//****  forgot password  *****/
const forgetLoad = async (req, res) => {

    try {
        res.render('forget')
    } catch (error) {
        console.log(error.message);
    }
}

const forgetVerify = async (req, res) => {

    try {
        const email = req.body.email;
        const userData = await User.findOne({ email: email });

        if (userData) {
            if (userData.is_verified === 0) {
                res.render('forget', { message: "please verify your mail" });
            } else {
                const randomString = randomstring.generate();
                const updatedData = await User.updateOne({ email: email }, { $set: { token: randomString } });
                sendResetPasswordMail(userData.name, userData.email, randomString);
                res.render('forget', { message: "please check your mail to reset your password" });
            }
        } else {
            res.render('forget', { message: "User emil is incorrect" });
        }

    } catch (error) {
        console.log(error.message);
    }
}

const forgetPasswordLoad = async (req, res) => {

    try {
        const token = req.query.token;
        const tokenData = await User.findOne({ token: token });
        if (tokenData) {
            res.render("forget-password", { user_id: tokenData._id });
        } else {
            res.status(401).send("Invalid token");
        }
    } catch (error) {
        console.log(error.message);
    }
}

const resetPassword = async (req, res) => {

    try {
        const password = req.body.password;
        const user_id = req.body.user_id.trim();
        console.log('password=', password);
        console.log('user_id=', user_id);


        const secure_password = await securePassword(password);

        const updatedData = await User.findByIdAndUpdate({ _id: user_id }, { $set: { password: secure_password, token: '' } });
        res.redirect('/');
    } catch (error) {
        console.log(error.message);
    }
}

//****  change user password  ****

const resetVerify = async (req, res) => {

    try {
        const email = req.body.email;
        const userData = await User.findOne({ email: email });
        console.log('sanu');
        if (userData) {
            if (userData.is_verified === 0) {
                res.render('forget', { message: "please verify your mail" });
            } else {
                const randomString = randomstring.generate();
                const updatedData = await User.updateOne({ email: email }, { $set: { token: randomString } });
                changePasswordMail(userData.name, userData.email, randomString);
                //res.send("<p style='color: green;' > Please check your email to reset your password.</p > ");
                res.send('<p style="color: green; font-size: 20px; font-weight: bold;">email send successfully</p>' +
                    '<p style="color: green; font-size: 16px;">Check your email for instructions on resetting your password.</p>');
            }
        } else {
            res.send({ message: "User emil is incorrect" });
        }

    } catch (error) {
        console.log(error.message);
    }
}

const resetPasswordLoad = async (req, res) => {

    try {
        const token = req.query.token;


        const tokenData = await User.findOne({ token: token });
        if (tokenData) {
            res.render("resetPassword", { user_id: tokenData._id });
        } else {
            res.status(401).send("Invalid token");
        }
    } catch (error) {
        console.log(error.message);
    }
}

const resetUserPassword = async (req, res) => {

    try {
        const password = req.body.password;
        const confirmPassword = req.body.c_password;
        const user_id = req.body.user_id.trim();
        const resetData = await User.findOne({ user_id })

        console.log('password=', password);
        console.log('user_id=', user_id);
        console.log('confirm password=', confirmPassword);

        if (password != confirmPassword) {
            return res.render('resetPassword', { user_id, message: 'confirm password and password doesnt match' });
        }
        const secure_password = await securePassword(password);
        console.log('password=', password);
        console.log('secure password=', secure_password);
        const updatedData = await User.findByIdAndUpdate({ _id: user_id }, { $set: { password: secure_password, token: '' } });

        res.redirect('/');
    } catch (error) {
        console.log(error.message);
    }
}

// ****** view products modal box *******
const loadViewProductsModal = async (req, res) => {
    try {
        const orderId = req.params.order_id;
        console.log('orderId=', orderId);
        const order = await Order.findById(orderId).populate('items.product');
        return res.render('userProfile', { order })
    } catch (error) {
        console.log(error);
    }
}

// const loadViewUserOrders = async (req, res) => {
//     try {
//         const userId = req.session.user_id;
//         const userData = await User.findById({ _id: userId });


//         const orders = await Order.find({ 'customer': userId }).populate('customer').populate({ path: 'items.product', model: 'Product' });

//         if (userData) {
//             return res.render('viewUserOrders', { userData, orders });

//         } else {
//             return res.status(404).send('User not found');
//         }

//     } catch (error) {
//         console.log(error);
//     }
// }

// const loadViewUserOrders = async (req, res) => {
//     try {
//         const userId = req.session.user_id;
//         const userData = await User.findById({ _id: userId });

//         const { page = 1, limit = 20 } = req.query;
//         const skip = (page - 1) * limit;

//         const ordersCount = await Order.countDocuments({ 'customer': userId });
//         const totalPages = Math.ceil(ordersCount / limit);

//         const orders = await Order.find({ 'customer': userId })
//             .populate('customer')
//             .populate({ path: 'items.product', model: 'Product' })
//             .sort({ orderDate: -1 }) // Sorting by orderDate in descending order
//             .skip(skip)
//             .limit(limit);

//         if (userData) {
//             return res.render('viewUserOrders', {
//                 userData,
//                 orders,
//                 currentPage: parseInt(page),
//                 totalPages,
//                 limit: parseInt(limit),
//             });
//         } else {
//             return res.status(404).send('User not found');
//         }

//     } catch (error) {
//         console.log(error);
//         return res.status(500).send('Internal Server Error');
//     }
// };

const loadViewUserOrders = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const userData = await User.findById({ _id: userId });

        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;


        const ordersCount = await Order.countDocuments({ 'customer': userId });
        const totalPages = Math.ceil(ordersCount / limit);

        const orders = await Order.find({ 'customer': userId })
            .populate('customer')
            .populate({ path: 'items.product', model: 'Product' })
            .sort({ orderDate: -1 }) // Sorting by orderDate in descending order
            .skip(skip)
            .limit(limit);

        if (userData) {
            return res.render('viewUserOrders', {
                userData,
                orders,
                currentPage: parseInt(page),
                totalPages,
                limit: parseInt(limit)
            });
        } else {
            return res.status(404).send('User not found');
        }

    } catch (error) {
        console.log(error);
        return res.status(500).send('Internal Server Error');
    }
};

const loadViewUserOrdersId = async (req, res) => {
    try {
        const orderId = req.params.id;
        //const orderDetails = await Order.findById(orderId);
        const orderDetails = await Order.findById(orderId).populate('items.product');
        console.log('order details=', orderDetails);
        if (!orderDetails) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Render the view with orderDetails
        res.render('viewUserOrders', { orderDetails });
    } catch (error) {
        console.log(error);
    }
}

const loadManageAddress = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const userData = await User.findById({ _id: userId });

        if (userData) {
            return res.render('manageAddress', { userData });

        } else {
            return res.status(404).send('User not found');
        }

    } catch (error) {
        console.log(error);
        return res.status(500).send('Internal Server Error');
    }
}

const loadAddressEdit = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const userData = await User.findById({ _id: userId });

        if (userData) {
            return res.render('addressEdit', { userData });

        } else {
            return res.status(404).send('User not found');
        }


    } catch (error) {
        console.log(error);
        return res.status(500).send('Internal Server Error');
    }
}

const updateAddress = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const { newAddress, addressIndex } = req.body;
        console.log('new address =', newAddress, 'address index =', addressIndex);

        // Find the user by ID and update the address
        const user = await User.findByIdAndUpdate(userId, { $set: { [`address.${addressIndex}`]: newAddress } }, { new: true });

        // Respond with the updated user
        return res.redirect('/manageAddress');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

// const addNewAddress = async (req, res) => {
//     try {
//         const { newAddress } = req.body;
//         console.log('new address==', newAddress);
//         userId = req.session.user_id;

//         const user = await User.findById(userId);

//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         user.address.push(newAddress);
//         await user.save();

//         return res.redirect('/manageAddress');

//     } catch (error) {
//         console.error(error.message);
//         return res.status(500).json({ error: 'Internal Server Error' });
//     }
// };
const addNewAddress = async (req, res) => {
    try {
        const { streetaddress, city, state, postalcode, country } = req.body; // Destructure address data from request body
        const userId = req.session.user_id; // Assuming you have session middleware to extract user ID
        console.log('addnewaddress=', req.body);
        const user = await User.findById(userId); // Find the user by ID

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (!streetaddress.trim() || !city.trim() || !state.trim() || !postalcode.trim() || !country.trim()) {
            req.flash('error', 'All address fields are required');
            return res.redirect('/addNewAddress');
        }


        const newAddress = {
            streetaddress: streetaddress.trim(),
            city: city.trim(),
            state: state.trim(),
            postalcode: postalcode.trim(),
            country: country.trim()
        };

        // Push the new address into the user's addresses array
        user.address.push(newAddress);

        // Save the updated user document
        await user.save();

        // Redirect to the manageAddress page
        return res.redirect('/manageAddress');

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};


const deleteAddress = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const { addressIndex } = req.body;

        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove the address at the specified index
        user.address.splice(addressIndex, 1);

        // Save the updated user
        await user.save();

        // Redirect back to the manageAddress page or send a response as needed
        return res.redirect('/manageAddress');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

const loadAddNewAddress = async (req, res) => {
    try {

        const userId = req.session.user_id;
        const userData = await User.findById({ _id: userId });

        if (userData) {
            return res.render('addNewAddress', { userData });

        } else {
            return res.status(404).send('User not found');
        }

    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}


module.exports = {
    loadRegister,
    insertUser,
    verifyMail,
    loginLoad,
    verifyOTP,
    verifyLogin,
    loadHome,
    loadVerify,
    userLogout,
    userProfile, editLoad, updateProfile, addAddress,
    resendOTP,
    forgetLoad, forgetVerify, forgetPasswordLoad, resetPassword,
    resetVerify, resetPasswordLoad, resetUserPassword,
    loadViewProductsModal,
    loadViewUserOrders, loadViewUserOrdersId,
    loadManageAddress, loadAddressEdit, updateAddress, addNewAddress, deleteAddress, loadAddNewAddress
}