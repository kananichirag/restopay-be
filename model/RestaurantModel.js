const mongoose = require("mongoose");

const restaurantschema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    location: {
        type: String,
        required: true,
    },
    manager: {
        type: String,
        required: true,
    },
    manager_email: {
        type: String,
        required: true,
        unique: true
    },
    admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        required: true
    }
});

const Restaurant = mongoose.model("Restaurant", restaurantschema);
module.exports = Restaurant;
