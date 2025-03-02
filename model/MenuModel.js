const mongoose = require("mongoose");

const menuItemSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    quantity: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        trim: true,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    imageUrl: {
        type: String,
        trim: true,
    },
}, { timestamps: true });



const menuSchema = mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        required: true,
    },
    items: [menuItemSchema],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});


const Menu = mongoose.model("Menu", menuSchema);
module.exports = Menu;