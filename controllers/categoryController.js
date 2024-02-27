const userModel = require("../models/userModel");
const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");
//ADMIN CATEGORY PAGE LOAD

const loadCategory = async (req, res) => {
    try {
        // const CategoryData = await categoryModel.find({});
        // if (CategoryData) {
        //     return res.render("category", { CategoryData });
        // }


        const page = parseInt(req.query.page) || 1;
        const limit = 4; // Set the number of items per page
        const skip = (page - 1) * limit;
        const search = req.query.search;

        let query = {};

        if (search) {
            query = {
                $or: [
                    { category: { $regex: search, $options: 'i' } },
                    { sub_Category: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const totalCategories = await categoryModel.countDocuments();
        const totalPages = Math.ceil(totalCategories / limit);
        const CategoryData = await categoryModel.find(query).skip(skip).limit(limit);

        res.render('category', { CategoryData, totalPages, currentPage: page, search });
    } catch (error) {
        console.log(error);
    }
};

//ADMIN ADD NEW CATEGORY

// const addNewCategory = async (req, res) => {
//     try {
//         const name = req.body.name.trim().toLowerCase();
//         const description = req.body.description;
//         const subCategory = req.body.SubCategory.trim().toLowerCase();
//         const image = req.file.filename;

//         // Check if the category with the given name already exists
//         const existingCategory = await categoryModel.findOne({ category: name });

//         if (existingCategory) {
//             // If the category exists, create a new instance and update its sub_Category array
//             const updatedCategory = await categoryModel.findByIdAndUpdate(
//                 existingCategory._id,
//                 { $push: { sub_Category: subCategory } },
//                 { new: true }
//             );
//             console.log(updatedCategory);
//         } else {
//             // If the category doesn't exist, create a new category
//             const newCategory = new categoryModel({
//                 category: name,
//                 description: description,
//                 sub_Category: [subCategory], // Initialize the array with the new subcategory
//                 image: image,
//             });

//             const newCategoryData = await newCategory.save();
//             console.log('New Category:', newCategoryData);
//         }

//         res.redirect("/admin/category");
//     } catch (error) {
//         console.log(error.message);
//     }
// };
const addNewCategory = async (req, res) => {
    try {
        const name = req.body.name.trim().toLowerCase();
        const description = req.body.description;
        const subCategory = req.body.SubCategory.trim().toLowerCase();
        const image = req.file.filename;


        const existingCategory = await categoryModel.findOne({ category: name });

        if (existingCategory) {
            // If the category exists, check if the sub-category already exists
            if (!existingCategory.sub_Category.includes(subCategory)) {
                // If not, update the category with the new sub-category
                const updatedCategory = await categoryModel.findByIdAndUpdate(
                    existingCategory._id,
                    { $push: { sub_Category: subCategory } },
                    { new: true }
                );
                console.log(updatedCategory);
            } else {
                console.log('Sub-category already exists in the category.');
            }
        } else {
            // If the category doesn't exist, create a new category
            const newCategory = new categoryModel({
                category: name,
                description: description,
                sub_Category: [subCategory], // Initialize the array with the new subcategory
                image: image,
            });

            const newCategoryData = await newCategory.save();
            console.log('New Category:', newCategoryData);
        }

        res.redirect("/admin/category");
    } catch (error) {
        console.log(error.message);
    }
};


//ADMIN EDIT CATEGORY PAGE LOAD ROUTE
const editCategoryLoad = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const CategoryData = await categoryModel.findOne({ _id: categoryId });
        const categorys = await categoryModel.find({});
        res.render("editCategory", { CategoryData, categorys }); // Pass
    } catch (error) {
        console.log(error.message);
    }
};

//ADMIN EDIT CATEGORY   ROUTE

const editCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const name = req.body.name;
        const subCategory = req.body.sub_Category;
        const description = req.body.description;
        const image = req.file ? req.file.filename : null;

        const updateFields = { category: name, description: description, sub_Category: subCategory };

        if (image) {
            updateFields.image = image;
        }

        const updateResult = await categoryModel.findOneAndUpdate(
            { _id: id },
            updateFields,
            { new: true }
        );

        if (updateResult) {
            res.redirect("/admin/category");
        } else {
            res.status(500).send("Failed to update category");
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

//ADMIN DELETE CATEGORY ROUTE
// const deleteCategory = async (req, res) => {

//     try {

//         const id = req.params.id;
//         const deleteCategory = await categoryModel.deleteOne({ _id: id });
//         if (deleteCategory) {
//             res.redirect('/admin/category');
//         }
//     } catch (error) {
//         console.log(error.message);
//     }
// }
const deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;

        // Find the category by ID to get the category name
        const categoryToDelete = await categoryModel.findById(categoryId);

        if (!categoryToDelete) {
            return res.status(404).send("Category not found");
        }

        const categoryName = categoryToDelete.category;

        // Find products with the given category name and delete them
        const deleteProducts = await productModel.deleteMany({ category: categoryName });

        // After deleting associated products, delete the category
        const deleteCategory = await categoryModel.deleteOne({ _id: categoryId });

        if (deleteCategory && deleteProducts) {
            res.redirect('/admin/category');
        } else {
            res.status(500).send("Failed to delete category and associated products");
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}



const loadViewAllCategoryes = async (req, res) => {
    try {
        const { page = 1, limit = 5 } = req.query;
        const skip = (page - 1) * limit;

        const categoryDataCount = await categoryModel.countDocuments({});
        const totalPages = Math.ceil(categoryDataCount / limit);

        const categoryData = await categoryModel
            .find({})
            .skip(skip)
            .limit(limit);

        return res.render('viewAllCategoryes', {
            categoryData,
            currentPage: parseInt(page),
            totalPages,
            limit: parseInt(limit),
        });
    } catch (error) {
        console.log(error);
        // Handle the error, you might want to send an error page or a JSON response
        res.status(500).send('Internal Server Error');
    }
};



module.exports = {
    loadCategory,
    addNewCategory,
    editCategoryLoad,
    editCategory,
    deleteCategory,
    loadViewAllCategoryes
}