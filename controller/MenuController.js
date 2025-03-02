const Joi = require("joi");
const Menu = require("../model/MenuModel");
const Restaurant = require("../model/RestaurantModel");
const Order = require('../model/OrderModel')
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { successResponse, errorResponse } = require("../utils/ResponseHandlers");
const dotenv = require("dotenv");
dotenv.config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
});

const MenuItemSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .required(),
    price: Joi.number()
        .min(0)
        .required(),
    category: Joi.string()
        .min(3)
        .required(),
    quantity: Joi.string()
        .required(),
    description: Joi.string()
        .trim()
        .allow("")
        .max(500),
    isAvailable: Joi.boolean()
        .default(true),
    imageUrl: Joi.string()
        .uri()
        .allow(""),
});

const AddMenuItem = async (req, res) => {
    try {
        const { error, value } = MenuItemSchema.validate(req.body, {
            abortEarly: false,
        });

        if (error) {
            return errorResponse(
                res,
                "Validation error",
                201,
                error.details.map((err) => err.message)
            );
        }

        const { name, price, category, quantity, description, isAvailable } = value;
        const adminId = req.user._id;

        if (!req.file) {
            return errorResponse(res, "Image file is required", 201);
        }

        const imageUrl = req.file.location;

        try {

            let menu = await Menu.findOne({ adminId });

            if (!menu) {
                menu = new Menu({
                    adminId,
                    items: [],
                });
            }

            // Check if an item with the same name already exists
            const isDuplicate = menu.items.some(
                (item) => item.name.toLowerCase() === name.toLowerCase()
            );

            if (isDuplicate) {
                return errorResponse(
                    res,
                    `A menu item with the name "${name}" already exists`,
                    201
                );
            }

            const newItem = {
                name,
                price,
                category,
                quantity,
                description,
                isAvailable,
                imageUrl,
            };

            menu.items.push(newItem);

            await menu.save();

            return successResponse(res, "Menu item added successfully", newItem);
        } catch (error) {
            console.error(error);
            return errorResponse(res, "An unexpected error occurred", 500, error.message);
        }

    } catch (error) {
        console.error("Menu error:", error);
        return errorResponse(res, "An unexpected error occurred", 500, error.message);
    }
}

const GetAllMenu = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return errorResponse(res, "Admin ID is required", 201);
        }

        const Items = await Menu.find({ adminId: id });
        if (Items.length === 0) {
            return errorResponse(res, "No Menu Items Found", 201);
        }
        return successResponse(res, "All Menu Items", Items);
    } catch (error) {
        console.error("GetAllMenuItems error:", error);
        return errorResponse(res, "An unexpected error occurred", 500, error.message);
    }
}


const GetAllMenuItems = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return errorResponse(res, "Restaurant ID is required", 201);
        }

        const restaurant = await Restaurant.findOne({ _id: id });
        if (!restaurant) {
            return errorResponse(res, "Restaurant not found", 201);
        }
        const { admin_id } = restaurant;
        const Items = await Menu.find({ adminId: admin_id });
        if (Items.length === 0) {
            return errorResponse(res, "No Menu Items Found", 201);
        }
        return successResponse(res, "All Menu Items", Items);
    } catch (error) {
        console.error("GetAllMenuItems error:", error);
        return errorResponse(res, "An unexpected error occurred", 500, error.message);
    }
}


const DeleteItem = async (req, res) => {
    try {
        const { adminId, ItemId } = req.body;

        if (!adminId || !ItemId) {
            return errorResponse(res, "AdminId ID and Item ID are required", 201);
        }

        const restaurant = await Menu.findOneAndUpdate(
            { adminId },
            { $pull: { items: { _id: ItemId } } },
            { new: true }
        );
        if (!restaurant) {
            return errorResponse(res, "Admin  not found", 201);
        }
        return successResponse(res, "Item deleted successfully");
    } catch (error) {
        console.error("DeleteItem error:", error);
        return errorResponse(res, "An unexpected error occurred", 500, error.message);
    }
};


const UpdateItem = async (req, res) => {
    try {
        const adminId = req.params.id;
        const { _id, ...updateFields } = req.body;

        if (!adminId || !_id) {
            return errorResponse(res, "Restaurant ID and Item ID are required", 201);
        }
        const menu = await Menu.findOne({ adminId });
        if (!menu) {
            return errorResponse(res, "Menu not found", 201);
        }

        const item = menu.items.id(_id);
        if (!item) {
            return errorResponse(res, "Item not found", 201);
        }

        Object.keys(updateFields).forEach((key) => {
            if (updateFields[key] !== undefined || updateFields[key] !== null || updateFields[key] !== "") {
                item[key] = updateFields[key];
            }
        });

        await menu.save();
        return successResponse(res, "Item updated successfully", item);
    } catch (error) {
        console.error("UpdateItem error:", error);
        return errorResponse(res, "An unexpected error occurred", 500, error.message);
    }
};


const CreateOrder = async (req, res) => {
    try {
        const restaurantId = req.params.id;
        if (!restaurantId) {
            return res.status(201).json({
                success: false,
                message: "restaurantId Not Found",
            });
        }

        const ValidRestarurant = await Restaurant.findOne({ _id: restaurantId });
        if (!ValidRestarurant) {
            return res.status(201).json({
                success: false,
                message: "Restaurant Not Found"
            })
        }

        const { username, mobileno, tableNumber, cart, payment_method } = req.body;

        if (!cart || cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart cannot be empty',
            });
        }

        if (!username || !mobileno || !tableNumber || !payment_method) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields (username, mobileno, tableNumber, payment_method)',
            });
        }

        const totalAmount = cart.reduce((total, item) => {
            if (isNaN(item.price) || isNaN(item.quantity) || item.price <= 0 || item.quantity <= 0) {
                console.error(`Invalid item: ${JSON.stringify(item)}`);
                return total;
            }
            return total + (item.price * item.quantity);
        }, 0);

        if (totalAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Total amount must be greater than zero',
            });
        }

        const lastOrder = await Order.findOne().sort({ orderNumber: -1 });
        const orderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1;

        const razorpayOrder = await razorpay.orders.create({
            amount: totalAmount * 100,
            currency: 'INR',
            receipt: `order_${Date.now()}`,
        });

        const newOrder = new Order({
            restaurantId,
            username,
            mobileno,
            tableNumber,
            mobileno,
            payment_method,
            orderNumber: orderNumber,
            order_items: cart,
            total_amount: totalAmount,
            razorpayOrderId: razorpayOrder.id,
            payment_status: 'Pending',
        })

        const savedOrder = await newOrder.save();
        return res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order: savedOrder,
            razorpayOrderId: razorpayOrder.id,
        });
    } catch (error) {
        console.error("CreateOrder error:", error);
        return errorResponse(res, "An unexpected error occurred", 500, error.message);
    }
}


const VerifyPayment = async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest("hex");

        if (generatedSignature === razorpaySignature) {
            const order = await Order.findOneAndUpdate(
                { razorpayOrderId },
                { payment_status: "Completed", razorpayPaymentId },
                { new: true }
            )

            res.status(200).send({
                success: true,
                message: "Payment verified and order placed successfully.",
                order,
            });
        } else {
            res
                .status(201)
                .send({ success: false, message: "Invalid payment signature." });
        }

    } catch (error) {
        console.error("VerifyPayment error:", error);
        return errorResponse(res, "An unexpected error occurred", 500, error.message);
    }
}


const GetAllOrders = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return errorResponse(res, "Restaurant ID is required", 201);
        }

        const FindOrders = await Order.find({ restaurantId: id });
        if (!FindOrders) {
            return errorResponse(res, "Orders not found", 201);
        }
        return res.status(201).json({
            success: true,
            message: 'Order Get Successfully',
            data: FindOrders
        });
    } catch (error) {
        console.error("GetAllOrders error:", error);
        return errorResponse(res, "An unexpected error occurred", 500, error.message);
    }
}


module.exports = {
    AddMenuItem,
    GetAllMenuItems,
    DeleteItem,
    UpdateItem,
    CreateOrder,
    VerifyPayment,
    GetAllOrders,
    GetAllMenu
}