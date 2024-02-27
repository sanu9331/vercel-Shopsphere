// const isLogin = async (req, res, next) => {

//     try {
//         if (req.session.user_id) {

//         } else {
//             res.redirect('/')
//         }
//         next();
//     } catch (error) {
//         console.log(error.message);
//     }
// }

// const isLogout = async (req, res, next) => {

//     try {
//         if (req.session.user_id) {
//             res.redirect('/home')
//         }
//         next();
//     } catch (error) {
//         console.log(error.message);
//     }
// }

// module.exports = {
//     isLogin, isLogout
// }



//started
const User = require("../models/userModel");

const isLogin = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            // User is logged in, proceed to the next middleware or route handler
            next();
        } else {
            // User is not logged in, redirect to the login page
            res.redirect('/login');
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
};

const isLogout = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            // User is logged in, redirect to the home page
            res.redirect('/home');
        } else {
            // User is not logged in, proceed to the next middleware or route handler
            next();
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
};

const userBlocked = async (req, res, next) => {
    try {

        const userId = req.session.user_id;

        if (userId) {

            const user = await User.findById(userId);


            if (user.status === false) {

                return res.status(403).send('User blocked. Contact support for assistance.');
            }
        }


        next();
    } catch (error) {
        console.error('User block middleware error:', error);
        return res.status(500).send('Internal Server Error');
    }
};



module.exports = {
    isLogin,
    isLogout,
    userBlocked
};
