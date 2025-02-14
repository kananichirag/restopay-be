const mongoose = require("mongoose");

const inventorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    quantity: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    total_amount: {
        type: Number,
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
    }
})

const Inventory = mongoose.model("Inventory", inventorySchema);
module.exports = Inventory;