const mongoose = require("mongoose");

const managerschema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    manager_email: {
        type: String,
        required: true,
        unique: true,
    },
    mobileno: {
        type: String,
    },
    password: {
        type: String,
        required: true
    },
    restaurant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true
    }
});

const Manager = mongoose.model("Manager", managerschema);
module.exports = Manager;
