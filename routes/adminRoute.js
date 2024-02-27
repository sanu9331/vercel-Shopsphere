const express = require('express');
const admin_route = express();

const session = require("express-session");
const config = require('../config/config');
admin_route.use(session({
    secret: config.sessionSecret, resave: false,
    saveUninitialized: true,
}));


const bodyParser = require('body-parser');
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({ extended: true }));

admin_route.set('view engine', 'ejs');
admin_route.set('views', './views/admin');

const adminAuth = require("../middleware/adminauth");

const adminController = require("../controllers/adminController");
const categoryController = require("../controllers/categoryController");
const customerController = require("../controllers/customerController");
const productController = require("../controllers/productController");
const bannerController = require("../controllers/bannerController");
const couponController = require("../controllers/couponController");
const orderController = require("../controllers/orderController");
const salesReportController = require("../controllers/salesReportController");

const path = require("path");
const multer = require("multer");
const { isAdminLoggedIn, userBlocked } = require('../middleware/auth');

// Define storage for product images
const productImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../public/images/productImages"));
    },
    filename: function (req, file, cb) {
        const name = Date.now() + "-" + file.originalname;
        cb(null, name);
    },
});

//define storage for cateory images
const categoryImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../public/images/categoryImages"));
    },
    filename: function (req, file, cb) {
        const name = Date.now() + "-" + file.originalname;
        cb(null, name);
    },
});



// Set up multer instances with the corresponding storage
const uploadProductImage = multer({
    storage: productImageStorage, limits: {
        fieldSize: 1024 * 1024 * 10, // 10 MB (adjust the value as needed)
    }
})
const uploadCategoryImage = multer({ storage: categoryImageStorage })

admin_route.get('/', adminAuth.isLogout, adminController.loadLogin);
admin_route.get('/login', adminAuth.isLogout, adminController.loadLogin); //changes sanu

//admin_route.get('/verify', adminController.verifyMail);//changes sanu

admin_route.post('/', adminAuth.isLogout, adminController.verifyLogin);

admin_route.get("/home", adminAuth.isLogin, adminController.loadDashboard);

admin_route.get('/logout', adminAuth.isLogin, adminController.logout);

//changes sanu
admin_route.get('/register', adminAuth.isLogout, adminController.loadRegister);

admin_route.post('/register', adminController.insertUser);

//USER VERIFICATION THROUGH EMAIL TO COMPLETE
admin_route.get('/verify', adminAuth.isLogout, adminController.loadVerify);
admin_route.post('/verify', adminController.verifyOTP);

//ADMIN CUSTOMER ROUTE
admin_route.get("/customers", adminAuth.isLogin, customerController.loadCustomers);
//admin_route.get("/delete - user", adminAuth.isLogin, customerController.deleteUser);
admin_route.get("/customers/delete/:id", adminAuth.isLogin, customerController.deleteUser);
admin_route.post("/block-unblock-user", adminAuth.isLogin, customerController.blockUnblockUser);

//ADMIN CATEGORY ROUTE
admin_route.get("/category", adminAuth.isLogin, categoryController.loadCategory);
admin_route.post("/category/add", uploadCategoryImage.single('image'), categoryController.addNewCategory); //ADMIN ADD CATEGORY ROUTE
admin_route.get("/category/edit/:id", adminAuth.isLogin, categoryController.editCategoryLoad);
admin_route.post("/category/edit/:id", uploadCategoryImage.single('image'), categoryController.editCategory); //ADMIN EDIT CATEGORY ROUTE
admin_route.get("/category/delete/:id", adminAuth.isLogin, categoryController.deleteCategory); //ADMIN DELETE CATEGORY ROUTE




//ADMIN PRODUCT ROUTE
admin_route.get("/products", adminAuth.isLogin, productController.loadProduct);
admin_route.get("/products/view/:id", adminAuth.isLogin, productController.adminSingleProductView);
admin_route.get("/products/add", adminAuth.isLogin, productController.addProductLoad);
admin_route.post("/products/add", uploadProductImage.array('images', 4), productController.addProduct);
admin_route.get("/products/delete/:id", adminAuth.isLogin, productController.deleteProduct);
//admin_route.get('/products / searchProducts', productController.searchProducts);


//ADMIN PRODUCT EDIT ROUTE
admin_route.get("/products/edit/:id", adminAuth.isLogin, productController.editProductLoad);
admin_route.post("/products/edit/:id", uploadProductImage.array('images', 4), productController.editProduct);
admin_route.get('/products/delete-variant', adminAuth.isLogin, productController.deleteProductVarientByAdmin);



//edit product varients
//admin_route.get('/products / delete -variant / ', adminAuth.isLogin, productController.deleteProductVarientByAdmin)

//admin store add banner route
//admin_route.get('/banners', adminAuth.isLogin, bannerController.loadBannerPage)


//order management
admin_route.get('/orders', adminController.GETloadOrder);
admin_route.post('/orders', adminController.loadOrder);
admin_route.post('/removeOrder', adminController.removeOrder);
admin_route.post('/orders/:id', adminController.orderStatus); //order status management



//order history
admin_route.get('/orderHistory', adminController.orderHistorLoad);

//coupons
admin_route.get('/coupons', couponController.loadCoupons);
admin_route.post('/coupons/add', couponController.addCoupon);
admin_route.post('/coupons-apply', couponController.applyCoupon);
admin_route.get('/coupons-delete/:couponId', couponController.couponDelete);

//order detail page
admin_route.get('/adminOrderDetailPage', orderController.loadAdminOrderDetailPage);

//sales report
admin_route.get('/salesReport', salesReportController.loadSalesReport);

//export users excel
admin_route.get('/export-users', adminController.exportUsers);

//export user pdf
admin_route.get('/export-users-pdf', adminController.exportToPDF);

//export orders
admin_route.get('/export-orders', adminController.exportOrders);
//export orders to pdf
admin_route.get('/export-orders-to-pdf', adminController.exportOrdersToPDF);

//custom date orders excel
admin_route.get('/custom-orders-excel', adminController.customOrdersExcel);
admin_route.get('/custom-orders-pdf', adminController.customOrdersToPDF);

//approve return orders
admin_route.post('/approve-returnOrder', adminController.approveReturnOrder);

module.exports = admin_route;