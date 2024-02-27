const bannerModel = require("../models/bannerModel");
const { findById } = require("../models/userModel");

const loadBannerPage = async (req, res) => {

    const banner = await bannerModel.find({});
    try {

        res.render('banner', { banner })

    } catch (error) {
        console.error(error);
    }
}
module.exports = {
    loadBannerPage
}