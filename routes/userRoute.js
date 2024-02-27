const express = require('express');
const user_route = express();
const session = require("express-session");

const config = require("../config/config");

user_route.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
}));

const bodyParser = require('body-parser');
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({ extended: true }));

user_route.set('view engine', 'ejs');
user_route.set('views', './views/users');

const auth = require("../middleware/auth");


// //multer        enctype="multipart/form-data" in form tag
// const path = require('path')
// const multer = require('multer');

// conststorage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, path.join(__dirname, '../public/userImages'));
//     },
//     filename: function () {
//         constname = Date.now() + '-' + file.originalname;
//         cb(null, name);
//     } //upload.single('image') in post /register
// })
// const upload = multer({ storage: storage })
const path = require("path");
const multer = require("multer");

const userImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../public/images/userImages"));
    },
    filename: function (req, file, cb) {
        const name = Date.now() + "-" + file.originalname;
        cb(null, name);
    },
});

const uploadUserImage = multer({ storage: userImageStorage })

const userController = require("../controllers/userController");
const homeController = require("../controllers/homePageController");
const cartController = require("../controllers/cartController");
const orderController = require("../controllers/orderController");
const productController = require("../controllers/productController");
const categoryController = require("../controllers/categoryController");
const paymentController = require("../controllers/paymentController");
const walletController = require("../controllers/walletController");

//user profile
user_route.get('/userProfile', auth.isLogin, userController.userProfile);
user_route.get('/userProfile-edit', auth.isLogin, userController.editLoad);
user_route.post('/userProfile-edit', uploadUserImage.single('image'), userController.updateProfile);

user_route.get('/manageAddress', userController.loadManageAddress);
user_route.get('/addressEdit', userController.loadAddressEdit);
user_route.post("/update-address", userController.updateAddress);
user_route.post('/add-address', userController.addNewAddress);
user_route.post('/delete-address', userController.deleteAddress);

user_route.post('/addAddress', userController.addAddress);
user_route.get('/addNewAddress', userController.loadAddNewAddress);
//end

user_route.get('/register', auth.isLogout, userController.loadRegister);

user_route.post('/register', userController.insertUser);

//USER VERIFICATION THROUGH EMAIL TO COMPLETE
user_route.get('/verify', auth.isLogout, userController.loadVerify);
user_route.post('/verify', userController.verifyOTP);
//user_route.post('/resendOTP', userController.resendOTP);


//user_route.get('/verify', userController.verifyMail);

user_route.get('/', auth.isLogout, userController.loginLoad);
user_route.get('/login', auth.isLogout, userController.loginLoad);

user_route.post('/login', auth.isLogout, userController.verifyLogin);

user_route.get('/home', auth.userBlocked, auth.isLogin, homeController.loadHome);

user_route.get('/logout', auth.isLogin, userController.userLogout);


//forgot password
user_route.get('/forget', auth.isLogout, userController.forgetLoad);
user_route.post('/forget', auth.isLogout, userController.forgetVerify);
user_route.get('/forget-password', auth.isLogout, userController.forgetPasswordLoad);
user_route.post('/forget-password', auth.isLogout, userController.resetPassword);

//reset user password
user_route.post('/reset', auth.userBlocked, auth.isLogin, userController.resetVerify);
user_route.get('/reset-password', auth.userBlocked, auth.isLogin, userController.resetPasswordLoad);
user_route.post('/reset-password', auth.userBlocked, auth.isLogin, userController.resetUserPassword);
user_route.get('/loadViewProductsModal:orderId', auth.userBlocked, auth.isLogin, userController.loadViewProductsModal);

//user single product detail route
user_route.get('/home/product/details/:id', auth.userBlocked, auth.isLogin, homeController.productDetail);


//product lists page route 
user_route.get('/home/products/:cat_name', auth.userBlocked, auth.isLogin, homeController.loadProductListsByCategory);


//cart management
user_route.get("/cart", auth.userBlocked, auth.isLogin, cartController.loadCart);
user_route.post('/buy-now', auth.userBlocked, auth.isLogin, cartController.buyNow);
user_route.post('/add-to-cart', auth.userBlocked, auth.isLogin, cartController.addToCart);
user_route.post('/remove-from-cart', auth.userBlocked, auth.isLogin, cartController.removeFromCart);
user_route.post('/update-quantity', auth.userBlocked, auth.isLogin, cartController.updateQuantity);
user_route.get('/cartCount', cartController.cartCount);

//proceed to checkout
user_route.get('/checkout', auth.userBlocked, auth.isLogin, orderController.loadProceedToCheckout);
user_route.post('/update-Billing-Info', auth.userBlocked, auth.isLogin, orderController.updateBillingInfo);

//order placed
user_route.get('/orderPlaced', auth.userBlocked, auth.isLogin, orderController.loadOrderPlaced); //order successfully placed page
user_route.post('/place-order', auth.userBlocked, auth.isLogin, orderController.placeOrder);
user_route.post('/removeOrder', auth.userBlocked, auth.isLogin, orderController.removeOrder);

//order cancel
user_route.get('/cancel/:id', auth.userBlocked, auth.isLogin, orderController.cancelOrder);
user_route.post('/complete/:id', auth.userBlocked, auth.isLogin, orderController.completeOrder);

//view all products
user_route.get('/viewAllProducts', auth.userBlocked, auth.isLogin, productController.viewAllProducts);

//view all categories
user_route.get('/viewAllCategoryes', auth.userBlocked, auth.isLogin, categoryController.loadViewAllCategoryes);

//view user orders
// user_route.all('/viewUserOrders', userController.loadViewUserOrders);
user_route.get('/viewUserOrders', auth.userBlocked, auth.isLogin, userController.loadViewUserOrders);
user_route.get('/viewUserOrders/:id', auth.userBlocked, auth.isLogin, userController.loadViewUserOrdersId);


//cancel orders
user_route.get('/returnOrders/:id', auth.userBlocked, auth.isLogin, orderController.loadReturnOrders);


//payment 
//user_route.post('/createOrder', paymentController.createOrder);
//user_route.post('/verify - payment', paymentController.verifyPayment);

//return order
user_route.post('/submitOrderReturn', auth.userBlocked, auth.isLogin, orderController.submitOrderReturn);

//wallet
user_route.get('/load-wallet', auth.userBlocked, auth.isLogin, walletController.loadWallet);
user_route.post('/wallet-order', auth.userBlocked, auth.isLogin, walletController.walletOrder);
user_route.post('/complete-transaction', auth.userBlocked, auth.isLogin, walletController.completeTransaction);

user_route.post('/capture-payment', auth.userBlocked, auth.isLogin, paymentController.capturePayment);

//order detail page
user_route.get('/orderDetailPage', auth.userBlocked, auth.isLogin, orderController.loadOrderDetailPage);

//clear couponDiscountPrice
user_route.get('/clear-couponDiscountPrice', orderController.clearCouponDiscountPrice);



module.exports = user_route;