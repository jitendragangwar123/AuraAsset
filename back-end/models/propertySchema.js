const mongoose = require("mongoose");
const propertySchemas = new mongoose.Schema({
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
});

module.exports = mongoose.model("PropertyData", propertySchemas);