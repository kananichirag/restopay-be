const mongoose = require("mongoose");

const chefschema = mongoose.Schema({
    chef_name: {
        type: String,
        required: true,
        unique: true
    },
    chef_email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    restaurant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true
    },
    manager_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Manager",
        required: true
    },
    forgot_password_token: {
        type: String
    }
});

const Chef = mongoose.model("Chef", chefschema);
module.exports = Chef;
