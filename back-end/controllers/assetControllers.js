const cloudinary = require("../utils/cloudinary");
const PropertyData = require("../models/propertySchema");


exports.welcomeMsg = async (req, res) => {
    res.status(200).json({ message: "Welcome to Aura Asset!" });
};


exports.listProperty = async (req, res) => {
    try {
        const { title, desc, total_price, location, token_name, no_of_tokens, apy, property_type } = req.body;

        const uploadPromises = req.files.map((file) => {
            return cloudinary.uploader.upload(file.path, {
                upload_preset: "auraAsset",
            });
        });

        const uploadedResponses = await Promise.all(uploadPromises);
        const imageUrls = uploadedResponses.map(response => response.secure_url);

        const newProperty = new PropertyData({
            title,
            desc,
            total_price,
            images: imageUrls,
            location: JSON.parse(location),
            token_name,
            no_of_tokens,
            apy, 
            property_type, 
        });

        await newProperty.save();
        res.status(200).json({ message: "Property listed successfully" });
    } catch (error) {
        console.error("Error listing property:", error);
        res.status(500).json({ message: "Error listing property" });
    }
};


exports.getPropertyDatails = async (req, res) => {
    try {
        const properties = await PropertyData.find();
        res.status(200).json(properties);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch properties" });
    }
};


exports.getPropertyDatailsByTitle = async (req, res) => {
    const { title } = req.query;
    try {
        let properties;
        if (title) {
            properties = await Property.find({ title: new RegExp(title, "i") });
        } else {
            properties = await Property.find();
        }
        res.status(200).json(properties);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch properties" });
    }
};
