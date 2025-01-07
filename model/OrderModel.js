const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        restaurantId: {
            type: String,
            required: true
        },
        orderNumber: {
            type: Number,
            required: true,
            unique: true,
        },
        username: {
            type: String,
            required: true,
        },
        mobileno: {
            type: String,
            required: true,
        },
        tableNumber: {
            type: String,
            required: true,
        },
        payment_method: {
            type: String,
            required: true
        },
        order_status: {
            type: String,
            default: 'pending'
        },
        total_amount: {
            type: String,
            required: true
        },
        razorpayOrderId: {
            type: String,
        },
        payment_status: {
            type: String,
            default: 'pending'
        },
        order_items: [
            {
                name: { type: String, required: true },
                price: { type: Number, required: true },
                category: { type: String, required: true },
                quantity: { type: Number, required: true },
                description: { type: String, required: true },
                isAvailable: { type: Boolean, required: true },
                imageUrl: { type: String, required: true },
                _id: { type: String, required: true },
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model('Order', orderSchema);

orderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
        const lastOrder = await Order.findOne().sort({ orderNumber: -1 });
        this.orderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1;
    }
    next();
});

module.exports = Order;
