const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");
const fs = require('fs'); // for file system operations
const UserModel = require("../models/userModel");

// const loadProduct = async (req, res) => {
//     try {
//         const ProductData = await productModel.find({}).populate('category');
//         if (ProductData) {
//             res.render("products", { ProductData });
//         }
//     } catch (error) {
//         console.error(error.meesage);
//     }
// };
// const loadProduct = async (req, res) => {
//     try {
//         const { sortBy, search, page = 1, limit = 5 } = req.query;
//         const skip = (page - 1) * limit;

//         const ProductData = await productModel
//             .find({})
//             .populate('category')
//             .skip(skip)
//             .limit(limit);

//         const productDataCount = await productModel.countDocuments({});
//         const totalPages = Math.ceil(productDataCount / limit);

//         res.render("products", {
//             ProductData,
//             sortBy,
//             search,
//             currentPage: parseInt(page),
//             totalPages,
//             limit: parseInt(limit),
//         });
//     } catch (error) {
//         console.error(error.message);
//     }
// };
const loadProduct = async (req, res) => {
    try {
        const { sortBy, search, page = 1, limit = 5 } = req.query;
        const skip = (page - 1) * limit;
        let { min, max } = req.query;

        let query = {};

        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } }, // Case-insensitive search for name
                    { brand: { $regex: search, $options: 'i' } } // Case-insensitive search for description
                ]
            };
        }

        min = parseFloat(min);
        max = parseFloat(max);

        if (!isNaN(min)) {
            query.discountPrice = { $gte: min };
        }
        if (!isNaN(max)) {
            query.discountPrice = { ...query.discountPrice, $lte: max };
        }

        const ProductData = await productModel
            .find(query)
            .populate('category')
            .skip(skip)
            .limit(limit);

        const productDataCount = await productModel.countDocuments(query);
        const totalPages = Math.ceil(productDataCount / limit);

        res.render("products", {
            ProductData,
            sortBy,
            search,
            currentPage: parseInt(page),
            totalPages,
            limit: parseInt(limit),
        });
    } catch (error) {
        console.error(error.message);
    }
};



const adminSingleProductView = async (req, res) => {
    try {
        const { id } = req.params
        const ProductData = await productModel.findById(id).populate('category');
        if (ProductData) {
            res.render("productDetailedView", { ProductData });
        }
    } catch (error) {
        console.error(error.meesage);
    }
};

const addProductLoad = async (req, res) => {
    try {
        const category = await categoryModel.find({});
        //console.log(category);

        res.render("addProducts", { category });
    } catch (error) {
        console.error(error.meesage);
    }
};

// const addProduct = async (req, res) => {
//     try {
//         const { price, discount, status, stock, } = req.body;
//         const name = req.body.name.trim().toLowerCase();
//         const description = req.body.description.trim();
//         const brand = req.body.brand.trim().toLowerCase();
//         const color = req.body.color.trim().toLowerCase();

//         if (!name || !price || !brand || !discount || !stock || !description || !color) {
//             req.flash('error', 'All fields must be filled out.');
//             return res.redirect(`/admin/products/edit/${id}`);
//         }

//         const category = req.body.category;
//         const categoryData = await categoryModel.findOne({ category: category });
//         const images = req.files.map(file => file.filename);
//         let ProductData = await productModel.findOne({ name });

//         if (!ProductData) {
//             console.log(images);
//             ProductData = new productModel({
//                 name: name,
//                 variants: [{ color: color, images }],
//                 description: description,
//                 price: parseFloat(price),
//                 category: categoryData.category,
//                 brand: brand,
//                 discount: parseInt(discount),
//                 status: status,
//                 stock: parseInt(stock),

//             });
//         } else {
//             // If the product exists, add a new color variant or update an existing one
//             const existingVariant = ProductData.variants.find(variant => variant.color === color);

//             if (existingVariant) {
//                 // If the color variant already exists, append the images to it
//                 existingVariant.images = existingVariant.images.concat(images);
//             } else {
//                 // If the color variant doesn't exist, create a new one
//                 ProductData.variants.push({ color, images });
//             }
//         }

//         await ProductData.save();
//         res.redirect("/admin/products");

//     } catch (error) {
//         console.error(error);
//     }
// };

const addProduct = async (req, res) => {
    try {
        const { price, discount, status, stock, } = req.body;
        const name = req.body.name.trim().toLowerCase();
        const description = req.body.description.trim();
        const brand = req.body.brand.trim().toLowerCase();
        const color = req.body.color.trim().toLowerCase();

        if (!name || !price || !brand || !discount || !stock || !description || !color) {
            req.flash('error', 'All fields must be filled out.');
            return res.redirect(`/admin/products/edit/${id}`);
        }
        if (price < 0) {
            req.flash('error', 'enter valid price');
            return res.redirect('/admin/products/add');
        } else if (discount < 0) {
            req.flash('error', 'enter valid discount');
            return res.redirect('/admin/products/add');
        } else if (stock < 0) {
            req.flash('error', 'enter valid stock');
            return res.redirect('/admin/products/add');
        }

        const category = req.body.category;
        const categoryData = await categoryModel.findOne({ category: category });
        const images = req.files.map(file => file.filename);
        let ProductData = await productModel.findOne({ name });

        if (!ProductData) {
            console.log(images);
            ProductData = new productModel({
                name: name,
                variants: [{ color: color, images }],
                description: description,
                price: parseFloat(price),
                category: categoryData.category,
                brand: brand,
                discount: parseInt(discount),
                status: status,
                stock: parseInt(stock),
                discountPrice: price * (1 - (discount / 100))

            });
        } else {
            // If the product exists, add a new color variant or update an existing one
            const existingVariant = ProductData.variants.find(variant => variant.color === color);

            if (existingVariant) {
                // If the color variant already exists, append the images to it
                existingVariant.images = existingVariant.images.concat(images);
            } else {
                // If the color variant doesn't exist, create a new one
                ProductData.variants.push({ color, images });
            }
        }

        await ProductData.save();
        res.redirect("/admin/products");

    } catch (error) {
        console.error(error);
    }
};











//ADMIN EDIT-PRODUCT EDIT ROUTE METHOOD
const editProductLoad = async (req, res) => {
    try {
        const id = req.params.id;
        const ProductData = await productModel.findById(id).populate('category');

        if (ProductData) {
            const categories = await categoryModel.find({}); // Fetch all categories
            res.render("editProducts", { ProductData, categories });
        }
    } catch (error) {
        console.error(error.message);
    }
};

// const editProduct = async (req, res) => {
//     try {
//         const { name, description, price, brand, discount, status, color, stock, image, } = req.body;

//         const id = req.params.id;
//         const category = req.body.category;



//         let categoryData;

//         // Check if category is provided before querying the database
//         if (category) {
//             categoryData = await categoryModel.findOne({ category: category });
//             if (!categoryData) {
//                 // Handle the case where the category is not found
//                 return res.status(404).send("Category not found");
//             }
//         }

//         console.log(id);
//         const productData = await productModel.findOne({ _id: id }).populate('category');

//         console.log('Color to Update:', color);
//         console.log('Existing Variants:', productData.variants);

//         // Find the variant with the specified color
//         const variantToUpdate = productData.variants.find(variant => variant.color === color);

//         if (variantToUpdate) {
//             // Update the specified images within the images array for the variant


//         }

//         const productUpdatedData = {
//             name: name,
//             description: description,
//             price: parseFloat(price),
//             brand: brand,
//             discount: parseInt(discount),
//             status: status,
//             stock: parseInt(stock),
//         };


//         // Update the product document
//         const productUpdated = await productModel.findOneAndUpdate(
//             { _id: id },
//             {
//                 $set: {
//                     name: productUpdatedData.name,
//                     description: productUpdatedData.description,
//                     price: productUpdatedData.price,
//                     brand: productUpdatedData.brand,
//                     discount: productUpdatedData.discount,
//                     status: productUpdatedData.status,
//                     stock: productUpdatedData.stock,
//                     'variants': productData.variants, // Update the entire variants array

//                 },
//             },
//             { upsert: true, new: true }
//         );

//         res.redirect("/admin/products");
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Internal Server Error");
//     }
// };



// 
// const editProduct = async (req, res) => {
//     try {
//         const { name, description, price, brand, discount, status, color, stock } = req.body;

//         const id = req.params.id;
//         const category = req.body.category;
//         console.log('img=', req.files);
//         console.log('Request Body:', req.body);

//         const images = req.files.map(file => file.filename);

//         const ProductData = await productModel.findOne({ _id: id }).populate('category');
//         const categories = await categoryModel.find({});

//         if (name === "") {
//             req.flash('error', 'Name cannot be null. Please provide a value.');
//             return res.render('editProducts', { ProductData, categories });
//         } else if (price === '') {
//             req.flash('error', 'Price cannot be null. Please provide a value.');
//             return res.render('editProducts', { ProductData, categories });
//         } else if (brand === '') {
//             req.flash('error', 'Brand cannot be null. Please provide a value.');
//             return res.render('editProducts', { ProductData, categories });
//         } else if (discount === '') {
//             req.flash('error', 'discount cannot be null. Please provide a value.');
//             return res.render('editProducts', { ProductData, categories });
//         } else if (stock === '') {
//             req.flash('error', 'Stock cannot be null. Please provide a value.');
//             return res.render('editProducts', { ProductData, categories });
//         } else if (description === '') {
//             req.flash('error', 'Description cannot be null. Please provide a value.');
//             return res.render('editProducts', { ProductData, categories });
//         } else if (color === '') {
//             req.flash('error', ' cannot be null. Please provide a value.');
//             return res.render('editProducts', { ProductData, categories });
//         } else if (!req.files || req.files.length === 0) {
//             req.flash('error', 'Please upload at least one image.');
//             return res.render('editProducts', { ProductData, categories });
//         }

//         let categoryData;

//         // Check if category is provided before querying the database
//         if (category) {
//             categoryData = await categoryModel.findOne({ category: category });
//             if (!categoryData) {
//                 // Handle the case where the category is not found
//                 return res.status(404).send("Category not found");
//             }
//         }

//         console.log(id);
//         // const productData = await productModel.findOne({ _id: id }).populate('category');

//         console.log('Color to Update:', color);
//         console.log('Existing Variants:', ProductData.variants);

//         const existingImages = Array.isArray(req.body.existingImages) ? req.body.existingImages : [];


//         const variantToUpdate = ProductData.variants.find(variant => variant.color === color);

//         if (variantToUpdate) {
//             // Update the specified images within the images array for the variant
//             variantToUpdate.images = existingImages.concat(images);

//             if (variantToUpdate.images.length === 0) {
//                 // If the variant's images are empty, remove the entire variant
//                 ProductData.variants = ProductData.variants.filter(
//                     (variant) => variant.color !== color
//                 );
//             }
//         } else {
//             // If the variant doesn't exist, create a new one
//             ProductData.variants.push({
//                 color: color,
//                 images: existingImages.concat(images),
//             });
//         }

//         const productUpdatedData = {
//             name: name,
//             description: description,
//             price: parseFloat(price),
//             brand: brand,
//             discount: parseInt(discount),
//             status: status,
//             stock: parseInt(stock),
//         };

//         // Update the product document
//         const productUpdated = await productModel.findOneAndUpdate(
//             { _id: id },
//             {
//                 $set: {
//                     name: productUpdatedData.name,
//                     description: productUpdatedData.description,
//                     price: productUpdatedData.price,
//                     brand: productUpdatedData.brand,
//                     discount: productUpdatedData.discount,
//                     status: productUpdatedData.status,
//                     stock: productUpdatedData.stock,
//                     // 'variants': productData.variants, // Update the entire variants array
//                     'variants': ProductData.variants.map(variant => {
//                         // Check if the variant has existing images
//                         if (variant.color === color && existingImages.length > 0) {
//                             variant.images = existingImages.concat(images);
//                         }
//                         return variant;
//                     }),
//                 },
//             },
//             { upsert: true, new: true }
//         );

//         res.redirect("/admin/products");
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Internal Server Error");
//     }
// };
const editProduct = async (req, res) => {
    try {
        const { price, discount, status, stock } = req.body;
        const id = req.params.id;
        const category = req.body.category;
        const name = req.body.name.trim().toLowerCase();
        const description = req.body.description.trim();
        const brand = req.body.brand.trim().toLowerCase();
        const color = req.body.color.trim().toLowerCase();
        console.log('color==', color);
        // Get new images
        const newImages = req.files.map(file => file.filename);

        // Get existing images from the form
        const existingImages = req.body.existingImages ? req.body.existingImages.split(',') : [];
        console.log('EI==', req.body.existingImages);


        // Fetch product data
        const productData = await productModel.findOne({ _id: id }).populate('category');

        // Validate input fields
        if (!name || !price || !brand || !discount || !stock || !description || !color) {
            req.flash('error', 'All fields must be filled out.');
            return res.redirect(`/admin/products/edit/${id}`);
        } else if (price <= 0) {
            req.flash('error', 'enter a valid price.');
            return res.redirect(`/admin/products/edit/${id}`);
        } else if (discount <= 0) {
            req.flash('error', 'enter a valid discount.');
            return res.redirect(`/admin/products/edit/${id}`);
        } else if (stock <= 0) {
            req.flash('error', 'enter a valid stock.');
            return res.redirect(`/admin/products/edit/${id}`);
        }




        // Check if there are at least one existing or new image
        if (existingImages.length === 0 && newImages.length === 0) {
            req.flash('error', 'Please upload at least one image.');
            return res.redirect(`/ admin / products / edit / ${id}`);
        }

        // Find the variant index based on color
        const variantIndex = productData.variants.findIndex(variant => variant.color === color);

        // Update or create the variant
        if (variantIndex !== -1) {
            // Variant found, update the images
            productData.variants[variantIndex].images = existingImages.concat(newImages);
        } else {
            // If the variant doesn't exist, create a new one
            productData.variants.push({
                color: color,
                images: existingImages.concat(newImages),
            });
        }

        // Update the product document
        const productUpdated = await productModel.findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    name: name,
                    description: description,
                    price: parseFloat(price),
                    brand: brand,
                    discount: parseInt(discount),
                    status: status,
                    stock: parseInt(stock),
                    'variants': productData.variants,
                },
            },
            { upsert: true, new: true }
        );

        res.redirect("/admin/products");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};







const deleteProduct = async (req, res) => {

    try {

        const id = req.params.id;
        const deleteProduct = await productModel.deleteOne({ _id: id });
        res.redirect('/admin/products')


    } catch (error) {
        console.log(error.message);
    }
}


const deleteProductVarientByAdmin = async (req, res) => {

    try {
        const { id, color } = req.query;
        console.log('id,color ==', req.query);
        const result = await productModel.updateOne(
            { _id: id },
            { $pull: { variants: { color: color } } }
        );
        if (result) {
            res.redirect(`/admin/products/edit/${id}`)
        }
    } catch (error) {
        console.error(`Error deleting variant: ${error.message}`);
    }
}


const viewAllProducts = async (req, res) => {
    try {
        const { sortBy, search, page = 1, limit = 8, min, max } = req.query;
        let query = {};


        if (search) {
            query = { $or: [{ name: { $regex: search, $options: 'i' } }] };
        }

        if (min && max) {
            query.discountPrice = { $gte: parseInt(min), $lte: parseInt(max) };
        } else if (min) {
            query.discountPrice = { $gte: parseInt(min) };
        } else if (max) {
            query.discountPrice = { $lte: parseInt(max) };
        }

        const skip = (page - 1) * limit;

        const productDataCount = await productModel.countDocuments(query);
        const totalPages = Math.ceil(productDataCount / limit);

        const productData = await productModel
            .find(query)
            .sort(sortBy === 'highest' ? { price: -1 } : sortBy === 'lowest' ? { price: 1 } : {})
            .skip(skip)
            .limit(limit);

        res.render("viewAllProducts", {
            productData,
            sortBy,
            search,
            currentPage: parseInt(page),
            totalPages,
            limit: parseInt(limit),
        });
    } catch (error) {
        console.log(error);
    }
};

// const searchProducts = async (req, res) => {
//     try {
//         const searchQuery = req.query.search;
//         if (searchQuery) {
//             query = { $or: [{ name: { $regex: search, $options: 'i' } }] };
//         }
//         //res.redirect('/products ? searchQuery = searchQuery');
//     } catch (error) {
//         console.log(error);
//         res.status(500).send('invalis server error');
//     }
// }

module.exports = {
    loadProduct,
    adminSingleProductView,
    addProductLoad,
    addProduct,
    editProductLoad,
    editProduct,
    deleteProduct, deleteProductVarientByAdmin,
    viewAllProducts,

}