const userModel = require("../models/userModel");


//ADMIN CUSTOMER PAGE LOAD

// const loadCustomers = async (req, res) => {
//     try {
//         const customerData = await userModel.find({ is_admin: 0, });
//         if (customerData) {
//             res.render("customers", { customers: customerData });
//         } else {
//             console.log("no data found");
//         }
//     } catch (error) {
//         console.log(error.message);
//     }
// };
const loadCustomers = async (req, res) => {
    try {
        const { page = 1, search, limit = 5 } = req.query;
        const skip = (page - 1) * limit;

        let query = {};

        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } }, // Case-insensitive search for name

                ]
            };
        }

        const customerData = await userModel
            .find({ ...query, is_admin: 0 })
            .skip(skip)
            .limit(limit);

        const totalCustomers = await userModel.countDocuments({ is_admin: 0 });
        const totalPages = Math.ceil(totalCustomers / limit);

        res.render("customers", {
            customers: customerData, search,
            currentPage: parseInt(page),
            totalPages,
            limit: parseInt(limit),
        });
    } catch (error) {
        console.error(error.message);
    }
};


//DELETE USRES
const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        const updatedUser = await userModel.findByIdAndUpdate({ _id: id }, { $set: { isDelete: true } });
        console.log(updatedUser);
        const deleteuser = await userModel.deleteOne({ _id: id });
        if (deleteuser) {
            res.redirect('/admin/customers');
        }
    } catch (error) {
        console.log(error.message);
    }
};

//BLOCK USERS
const blockUnblockUser = async (req, res) => {
    try {
        const id = req.body.id;
        const userData = await userModel.findOne({ _id: id });

        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const updatedStatus = !userData.status; // Toggle the status

        const updatedUser = await userModel.updateOne(
            { _id: id },
            { $set: { status: updatedStatus } }
        );

        if (updatedUser) {
            // res.redirect("/admin / customers");
            return res.json({ success: true, message: "User status updated successfully" });
        } else {
            return res.status(500).json({ success: false, message: "Failed to update user status" });
        }

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = {
    loadCustomers,
    deleteUser,
    blockUnblockUser
}