const mongoose = require("mongoose");

const staffSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    contect: {
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
    shift: {
        type: String,
        required: true
    },
    profile: {
        type: String,
        required: true
    }
})

const Staff = mongoose.model("staff", staffSchema);
module.exports = Staff;