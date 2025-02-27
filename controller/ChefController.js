const ChefModal = require("../model/ChefModel");
const OrderModel = require("../model/OrderModel");
const Manager = require("../model/ManagerModel");
const { errorResponse } = require("../utils/ResponseHandlers");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SignUpChef = async (req, res) => {
    try {
        const { token } = req.params;
        if (!token) {
            return errorResponse(res, "Token is Missing", 201);
        }

        const findManager = await Manager.findOne({ chef_verification_token: token });
        if (!findManager) {
            return errorResponse(res, "Invalid or expired token", 201);
        }
        const { password, email, name } = req.body;
        if (!password || !email || !name) {
            return errorResponse(res, "All fields are required", 201);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newchef = new ChefModal({
            chef_name: name,
            chef_email: email,
            restaurant_id: findManager.restaurant_id,
            manager_id: findManager._id,
            password: hashedPassword
        })

        await newchef.save();
        findManager.chef_verification_token = "";
        await findManager.save();

        return res.status(200).json({
            success: true,
            message: "Chef successfully Signup",
            newchef
        })
    } catch (error) {
        console.error(error);
        return errorResponse(res, "An unexpected error occurred", 500, error.message);
    }
}


const ChefLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return errorResponse(res, "All fields are required", 201);
        }

        const findChef = await ChefModal.findOne({ chef_email: email });
        if (!findChef) {
            return errorResponse(res, "Chef not found", 201);
        }

        const isMatch = await bcrypt.compare(password, findChef.password);
        if (!isMatch) {
            return errorResponse(res, "Invalid  password", 201);
        }

        const Chef_token = jwt.sign(
            { chef_id: findChef._id, chef_email: findChef.manager_email, restaurant_id: findChef.restaurant_id },
            process.env.JWT_SECRATE_KEY,
            { expiresIn: "24h" }
        );

        return res.status(200).json({
            success: true,
            message: "Chef login successfull",
            chef: {
                chef_name: findChef.chef_name,
                chef_email: findChef.chef_email,
                restaurant_id: findChef.restaurant_id
            },
            Chef_token
        })
    } catch (error) {
        console.error(error);
        return errorResponse(res, "An unexpected error occurred", 500, error.message);
    }
}


const GetAllChef = async (req, res) => {
    try {
        const findChef = await ChefModal.find({ restaurant_id: req.restaurantId, manager_id: req.managerId });
        if (!findChef) {
            return errorResponse(res, "Chefs not found", 201);
        }

        if (findChef.length === 0) {
            return errorResponse(res, "No Chef Found", 201);
        }
        res.status(200).json({
            success: true,
            chefs: findChef
        })
    } catch (error) {
        console.log(error)
    }
}


const ChnageStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        if (!orderId || !status) {
            return errorResponse(res, "All fields are required", 201);
        }

        const FindOrder = await OrderModel.findOne({ _id: orderId });
        if (!FindOrder) {
            return errorResponse(res, "Order not found", 201);
        }

        FindOrder.order_status = status;
        await FindOrder.save();

        return res.status(200).json({
            success: true,
            message: "Order status changed successfully "
        })
    } catch (error) {
        console.error(error);
        return errorResponse(res, "An unexpected error occurred", 500, error.message);
    }
}

module.exports = {
    SignUpChef,
    ChefLogin,
    GetAllChef,
    ChnageStatus
}