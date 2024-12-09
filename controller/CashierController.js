const Cashier = require("../model/CashierModel");
const Joi = require("joi");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Manager = require("../model/ManagerModel");
const { successResponse, errorResponse } = require("../utils/ResponseHandlers");

const CashierSignupSchema = Joi.object({
    email: Joi.string().required(),
    name: Joi.string().required(),
    password: Joi.string().min(6).required(),
});

const CashierLoginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

const CashierSignUp = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return errorResponse(res, "Token is required", 400);
        }

        const FindManager = await Manager.findOne({ cashier_verification_token: token.trim() });

        if (!FindManager) {
            return errorResponse(res, "Invalid or expired token", 400);
        }

        const { error, value } = CashierSignupSchema.validate(req.body, {
            abortEarly: false,
        });

        if (error) {
            return res.status(400).json({
                message: "Validation error",
                errors: error.details.map((err) => err.message),
            });
        }
        FindManager.cashier_verification_token = "";
        await FindManager.save();
        const { password, name, email } = value;
        const hashPassword = await bcryptjs.hash(password, 10);

        const newcashier = new Cashier({
            name,
            email,
            password: hashPassword,
            manager_id: FindManager._id,
            restaurant_id: FindManager.restaurant_id
        });
        await newcashier.save();

        return successResponse(res, "Cashier SignUp successfully ", newcashier);
    } catch (error) {
        console.error(error);
        return errorResponse(res, "An unexpected error occurred", 500, error.message);
    }
}


const CashierLogin = async (req, res) => {
    try {

        const { error, value } = CashierLoginSchema.validate(req.body, {
            abortEarly: false,
        });

        if (error) {
            return res.status(400).json({
                message: "Validation error",
                errors: error.details.map((err) => err.message),
            });
        }

        const { email, password } = value;
        const FindCashier = await Cashier.findOne({ email });

        if (!FindCashier) {
            return errorResponse(res, "Cashier not foud", 400);
        }

        const isValidPassword = await bcryptjs.compare(password, FindCashier.password);
        if (!isValidPassword) {
            return errorResponse(res, "Invalid Password", 400);
        }

        const Cashier_token = jwt.sign(
            { cashier_id: FindCashier._id, cashier_email: FindCashier.email, restaurant_id: FindCashier.restaurant_id },
            process.env.JWT_SECRATE_KEY,
            { expiresIn: "24h" }
        );

        return successResponse(res, "Login Successfully", {
            cashier: {
                id: FindCashier._id,
                email: FindCashier.email,
                restaurant_id: FindCashier.restaurant_id,
                name: FindCashier.name
            },
            Cashier_token
        })
    } catch (error) {
        console.error(error);
        return errorResponse(res, "An unexpected error occurred", 500, error.message);
    }
}

module.exports = {
    CashierSignUp,
    CashierLogin
}