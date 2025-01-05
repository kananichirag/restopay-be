const mongoose = require("mongoose");

const qrSchema = mongoose.Schema({
    table_no: {
        type: Number,
        required: true,
        unique: true
    },
    qrcode: {
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
    }
})

const QrCode = mongoose.model("QrCode", qrSchema);
module.exports = QrCode;