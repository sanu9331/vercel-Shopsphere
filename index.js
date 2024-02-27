// const mongoose = require("mongoose");
// mongoose.connect("mongodb://127.0.0.1:27017/user_management_system");

// const express = require("express");
// const app = express();

// //changes sanu
// const session = require("express-session");
// const nocache = require("nocache");
// app.use(nocache());
// app.use(
//     session({
//         secret: "session key",
//         resave: false,
//         saveUninitialized: true,
//         cookie: { maxAge: 6000000 }
//     })
// );

// // Serve static files from the 'public' directory
// const path = require('path');
// app.use('/images', express.static(path.join(__dirname, 'public/images')));

// //for user routes
// const userRoute = require('./routes/userRoute');
// app.use('/', userRoute);

// //for admin routes
// const adminRoute = require('./routes/adminRoute');
// app.use('/admin', adminRoute);




// app.listen(3000, function () {
//     console.log('server is running on port 3000');
// })



const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/user_management_system");

const express = require("express");
const app = express();

require('dotenv').config();

const port = process.env.PORT || 3000;
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const nocache = require("nocache");
//app.use(express.json());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

// Admin session configuration
const adminSession = session({
    secret: "admin-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 6000000 }
});

const userStore = new MongoDBStore({
    uri: "mongodb://127.0.0.1:27017/user_sessions", // Replace with your MongoDB URI
    collection: "user_sessions",
});

// User session configuration
const userSession = session({
    secret: "user-secret",
    resave: false,
    saveUninitialized: true,
    store: userStore,
    cookie: { maxAge: 6000000 }
});

app.use(nocache());

const flash = require('express-flash')
app.use(flash());

// Serve static files from the 'public' directory
const path = require('path');
app.use('/images', express.static(path.join(__dirname, 'public/images')));

//for user routes
const userRoute = require('./routes/userRoute');
app.use('/', userSession, userRoute);

//for admin routes
const adminRoute = require('./routes/adminRoute');
app.use('/admin', adminSession, adminRoute);

app.listen(port, function () {
    console.log(`Server is running on port ${port}`);
});
