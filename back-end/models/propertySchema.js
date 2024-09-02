const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
    title: { type: String, required: true },
    desc: { type: String, required: true },
    total_price: { type: String, required: true },
    images: { type: [String], required: true },
    location: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
    },
    token_name: { type: String, required: true },
    no_of_tokens: { type: String, required: true },
    apy: { type: String, required: true },
    property_type: { type: String, required: true },
    status: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model("PropertyData", propertySchema);
