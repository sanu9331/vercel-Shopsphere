const productModel = require("../models/productModel");
const bannerModel = require("../models/bannerModel");
const categoryModel = require("../models/categoryModel");

const loadHome = async (req, res) => {
    try {
        const category = await categoryModel.find({}).limit(4);
        const currentDate = new Date();
        console.log(currentDate);
        const ProductData = await productModel.find({}).limit(4);
        const banner = await bannerModel.find({ endDate: { $gt: currentDate } });
        res.render("home", { category, banner, ProductData });
    } catch (error) {
        console.log(error.message);
    }
};

// const loadProductListsByCategory = async (req, res) => {
//     try {

//         const { cat_name } = req.params;
//         const ProductData = await productModel.find({ category: cat_name });
//         const ProductCount = await productModel.find({ category: cat_name }).countDocuments();
//         const category = await categoryModel.find({ category: cat_name });
//         const result = await productModel.aggregate([
//             {
//                 $match: {
//                     category: cat_name,
//                 },
//             },
//             {
//                 $group: {
//                     _id: "$brand",
//                 },
//             },
//         ]);

//         const brands = result.map((entry) => entry._id);
//         const brandCount = await productModel.aggregate([{ $match: { category: cat_name, }, }, {
//             $group: {
//                 _id: "$brand",
//                 count: { $sum: 1 }, // Count the number of products for each brand
//             },
//         },]);


//         res.render("productLists", { ProductData, ProductCount, category, brands, brandCount });

//     } catch (error) {
//         console.error(error);
//     }
// }
const loadProductListsByCategory = async (req, res) => {
    try {
        const { cat_name } = req.params;
        let { page = 1, limit = 3, min, max } = req.query;
        const skip = (page - 1) * limit;

        // Convert min and max to numbers
        min = parseFloat(min);
        max = parseFloat(max);

        // Construct the query object
        const query = { category: cat_name };

        // Add price range conditions if min and max are provided
        if (!isNaN(min)) {
            query.discountPrice = { $gte: min };
        }
        if (!isNaN(max)) {
            query.discountPrice = { ...query.discountPrice, $lte: max };
        }
        console.log('query=', query);
        // Fetch products based on the constructed query
        const ProductData = await productModel.find(query)
            .skip(skip)
            .limit(limit);
        const ProductCount = await productModel.countDocuments(query);
        const category = await categoryModel.find({ category: cat_name });

        const result = await productModel.aggregate([
            {
                $match: {
                    category: cat_name,
                },
            },
            {
                $group: {
                    _id: "$brand",
                },
            },
        ]);

        const brands = result.map((entry) => entry._id);
        const brandCount = await productModel.aggregate([
            {
                $match: {
                    category: cat_name,
                },
            },
            {
                $group: {
                    _id: "$brand",
                    count: { $sum: 1 },
                },
            },
        ]);

        const totalPages = Math.ceil(ProductCount / limit);

        res.render("productLists", {
            ProductData,
            ProductCount,
            category,
            brands,
            brandCount,
            currentPage: parseInt(page),
            totalPages,
            limit: parseInt(limit),
            cat_name
        });
    } catch (error) {
        console.error(error);
    }
};





// const loadProductListsByCategory = async (req, res) => {
//     try {

//         const { cat_name } = req.params;
//         const { sortBy, search } = req.query;
//         console.log('sortby=', sortBy);
//         console.log('search=', search);

//         let query = { category: cat_name };
//         console.log('query=', query);

//         if (search) {
//             // Customize the query based on your model fields
//             query = {
//                 category: cat_name,
//                 name: { $regex: search, $options: 'i' },
//             };
//         }

//         const ProductData = await productModel.find(query);
//         console.log('ProductData', ProductData);

//         if (sortBy === 'highest') {
//             ProductData.sort((a, b) => b.price - a.price);
//         } else if (sortBy === 'lowest') {
//             ProductData.sort((a, b) => a.price - b.price);
//         }

//         const ProductCount = ProductData.length;
//         const category = await categoryModel.find({ category: cat_name });
//         const result = await productModel.aggregate([
//             {
//                 $match: {
//                     category: query,
//                 },
//             },
//             {
//                 $group: {
//                     _id: "$brand",
//                 },
//             },
//         ]);

//         const brands = result.map((entry) => entry._id);
//         const brandCount = await productModel.aggregate([{ $match: { category: cat_name, }, }, {
//             $group: {
//                 _id: "$brand",
//                 count: { $sum: 1 }, // Count the number of products for each brand
//             },
//         },]);


//         res.render("productLists", { ProductData, ProductCount, category, brands, brandCount, sortBy, search });

//     } catch (error) {
//         console.error(error);
//     }
// }










const productDetail = async (req, res) => {
    try {
        const id = req.params.id;
        const color = req.params.color;
        const ProductData = await productModel.findById({ _id: id });
        res.render("productDetail", { ProductData });
    } catch (error) {
        console.log(error.message);
    }
};






module.exports = {
    loadHome,
    loadProductListsByCategory,
    productDetail,

}