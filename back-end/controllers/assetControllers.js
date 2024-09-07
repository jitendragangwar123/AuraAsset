const cloudinary = require("../utils/cloudinary");
const PropertyData = require("../models/propertySchema");
const TransactionsData = require("../models/transactions")


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
            status: "available"
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
            properties = await PropertyData.find({ title: new RegExp(title, "i") });
        } else {
            properties = await PropertyData.find();
        }
        res.status(200).json(properties);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch properties" });
    }
};

exports.getPropertiesByUserAddress = async (req, res) => {
    const { userAddress } = req.query;
    try {
        const properties = await PropertyData.find({
            "userData.userAddress": userAddress,
        });

        const userProperties = properties.map((property) => {
            const userData = property.userData.find(
                (user) => user.userAddress === userAddress
            );
            return {
                ...property.toObject(),
                userData,
            };
        });

        if (userProperties.length === 0) {
            return res
                .status(404)
                .json({ message: "No properties found for this user." });
        }
        res.status(200).json(properties);
    } catch (error) {
        console.error("Error fetching properties:", error);
        res.status(500).json({ message: "Server error." });
    }
};


exports.updateHoldingTokens = async (req, res) => {
    const propertyId = req.params.id;
    const { userAddress, earnedYield, value, holdingTokens } = req.body
    try {
        const property = await PropertyData.findById(propertyId);
        if (!property) {
            console.error("Property not found");
            return res.status(404).json({ message: "Property not found." });
        }
        let userFound = false;
        property.userData = property.userData.map((user) => {
            if (user.userAddress === userAddress) {
                console.log(`Existing user found: ${userAddress}`);
                user.value += value;
                user.holdingTokens += holdingTokens;
                userFound = true;
                user.earnedYield += earnedYield;
            }
            return user;
        });


        if (!userFound) {
            console.log(`New user, adding to property: ${userAddress}`);
            property.userData.push({
                userAddress,
                value,
                holdingTokens,
                earnedYield: 0,
            });
        }
        await property.save();
        console.log("Property updated successfully");
        res
            .status(200)
            .json({ message: "User data added or updated successfully.", property });
    } catch (error) {
        console.error("Error updating property:", error);
        res.status(500).json({ message: "Server error." });
    }
};

exports.updateEarnedYields = async (req, res) => {
    const propertyId = req.params.id;
    const { userAddress, value, earnedYield } = req.body;
    try {
        const property = await PropertyData.findById(propertyId);


        if (!property) {
            console.error("Property not found");
            return res.status(404).json({ message: "Property not found." });
        }
        let userFound = false;
        property.userData = property.userData.map((user) => {
            if (user.userAddress === userAddress) {
                console.log(`Existing user found: ${userAddress}`);
                console.log("dab address: ", user.userAddress)
                user.value += value;
                user.earnedYield += earnedYield;
                userFound = true;
            }
            return user;
        });
        await property.save();
        console.log("Property updated successfully");
        res
            .status(200)
            .json({ message: "User data added or updated successfully.", property });
    } catch (error) {
        console.error("Error updating property:", error);
        res.status(500).json({ message: "Server error." });
    }
};

exports.storeTransactionsData = async (req, res) => {
    try {
        const { txnHash, investorAddress, tokenAmount, cryptoAmount, action, url } = req.body;
        const newTransaction = new TransactionsData({
            txnHash,
            investorAddress,
            tokenAmount,
            cryptoAmount,
            action,
            url,
        });
        const savedTransaction = await newTransaction.save();
        res.json(savedTransaction);
    } catch (error) {
        console.error("Error saving transaction:", error);
        res.status(500).json({ error: "Failed to save transaction" });
    }
};

exports.getTransactionsData = async (req, res) => {
    try {
        const transactionData = await TransactionsData.find();
        res.status(200).json(transactionData);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch properties" });
    }
};