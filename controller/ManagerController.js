const Restaurant = require("../model/RestaurantModel");
const Manager = require("../model/ManagerModel")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
const { successResponse, errorResponse } = require("../utils/ResponseHandlers");
const joi = require("joi");
const Cashier = require("../model/CashierModel");
const { generateVerificationToken } = require("../utils/Helpers");
const nodemailer = require("nodemailer");
const QRCode = require('qrcode');
const QrModal = require("../model/QrModel");
const dotenv = require("dotenv");
dotenv.config();

const ManagerSignUpSchema = joi.object({
    password: joi.string().min(6).required(),
    mobileno: joi.string().pattern(/^[0-9]{10}$/).required()
})

const ManagerLoginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
})

const CashierSignupSchema = joi.object({
    email: joi.string().email().required(),
});

const ManagerSignUp = async (req, res) => {
    try {
        const { token } = req.params;

        const restaurant = await Restaurant.findOne({ manager_email_verification_token: token.trim() });

        if (!restaurant) {
            return errorResponse(res, "Invalid or expired token", 201);
        }

        const existingManager = await Manager.findOne({ email: restaurant.manager_email });
        if (existingManager) {
            return errorResponse(res, "Manager already signed up", 201);
        }

        const { password, mobileno } = req.body;
        const { error, value } = ManagerSignUpSchema.validate(req.body, {
            abortEarly: false,
        });

        if (error) {
            const validationErrors = {};
            error.details.forEach(err => {
                validationErrors[err.context.key] = err.message;
            });
            return errorResponse(res, "Validation error", 201, validationErrors);
        }

        const hashedPassword = await bcrypt.hash(value.password, 10);

        const newManager = new Manager({
            name: restaurant.manager_name,
            manager_email: restaurant.manager_email,
            password: hashedPassword,
            restaurant_id: restaurant._id,
            mobileno: value.mobileno
        });

        await newManager.save();

        restaurant.manager_email_verification_token = "";
        await restaurant.save();

        return successResponse(res, "Manager signed up successfully", newManager);
    } catch (error) {
        console.error(error);
        return errorResponse(res, "An unexpected error occurred", 500, error.message);
    }
};

const ManagerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const { error, value } = ManagerLoginSchema.validate(req.body, {
            abortEarly: false,
        });

        if (error) {
            return errorResponse(
                res,
                "Validation error",
                400,
                error.details.map((err) => err.message)
            );
        }


        const manager = await Manager.findOne({ manager_email: email });
        if (!manager) {
            return errorResponse(res, "Manager not found with this email ", 201);
        }

        const isMatch = await bcrypt.compare(password, manager.password);
        if (!isMatch) {
            return errorResponse(res, "Invalid  password", 201);
        }

        const Manager_token = jwt.sign(
            { manager_id: manager._id, manager_email: manager.manager_email, restaurant_id: manager.restaurant_id },
            process.env.JWT_SECRATE_KEY,
            { expiresIn: "24h" }
        );

        return successResponse(res, "Login successful", {
            manager: {
                id: manager._id,
                name: manager.name,
                email: manager.manager_email,
                restaurant_id: manager.restaurant_id
            },
            Manager_token,
        });
    } catch (error) {
        console.error("Login error:", error);
        return errorResponse(res, "An unexpected error occurred", 500, error.message);
    }
};

const GetManagerDetails = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) {
            return errorResponse(res, "Token is Missing", 201);
        }

        const restaurant = await Restaurant.findOne({ manager_email_verification_token: token });
        if (!restaurant) {
            return errorResponse(res, "Invalid or expired token", 201);
        }

        return successResponse(res, "Manager details retrieved successfully", {
            name: restaurant.manager_name,
            email: restaurant.manager_email,
        });
    } catch (error) {
        console.error(error);
        return errorResponse(res, "An unexpected error occurred", 500, error.message);
    }
};



const AddCashier = async (req, res) => {
    try {
        const { error, value } = CashierSignupSchema.validate(req.body, {
            abortEarly: false,
        });

        if (error) {
            return res.status(400).json({
                message: "Validation error",
                errors: error.details.map((err) => err.message),
            });
        }

        const { email } = value;

        const existingCashier = await Cashier.findOne({ email });
        if (existingCashier) {
            return res.status(201).json({ message: "Cashier already exists" });
        }

        const verificationToken = generateVerificationToken();

        const manager = await Manager.findOne({ _id: req.managerId });

        if (!manager) {
            return errorResponse(res, "Manager Not Found", 201);
        }

        manager.cashier_verification_token = verificationToken;
        await manager.save();

        const htmlContent = `
        <p>Hello ${value.name},</p>
        <p>Click the link below to verify your email and complete your registration:</p>
        <p>Your Verification Token is:${verificationToken}</p>
        <a href="http:localhost:3030/v1/auth/verify-email?token=${verificationToken}">Verify Email</a>
        <p>If you did not request this, please ignore this email.</p>
    `;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: "kananichirag444@gmail.com",
                pass: "mhuy gdar vgaz vczj",
            },
        });


        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: value.email,
            subject: 'Cashier Email Verification',
            html: htmlContent,
        });

        if (info) {
            return successResponse(res, "Cashier added successfully and email sent!");
        }
    } catch (error) {
        console.error(error);
        return errorResponse(res, "An unexpected error occurred", 500, error.message);
    }
}


const GenrateQrCode = async (req, res) => {
    try {
        const { restaurantId, tableNumber } = req.body;

        if (!restaurantId || !tableNumber) {
            return res.status(201).send({ message: 'Restaurant ID and Table Number are required.' });
        }

        const ExistingTable = await QrModal.findOne({ table_no: tableNumber });
        if (ExistingTable) {
            return res.status(201).send({ message: 'QrCode with this table number is already exists.' });
        }

        const redirectUrl = `${process.env.FERONT_URL}/menu/${restaurantId}/${tableNumber}`;
        const qrCode = await QRCode.toDataURL(redirectUrl);

        const newQrCode = new QrModal({
            table_no: tableNumber,
            qrcode: qrCode,
            restaurant_id: restaurantId,
            manager_id: req.managerId
        });

        await newQrCode.save();

        return res.status(200).json({
            success: true,
            message: "QR Code generated successfully",
            newQrCode,
        });
    } catch (error) {
        console.error("GenrateQrCode error:", error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred",
            error: error.message,
        });
    }
};


const GetAllQrCodes = async (req, res) => {
    try {

        const restaurantId = req.params.id;

        if (!restaurantId) {
            return res.status(201).send({ message: 'Restaurant ID is required.' });
        }

        const AllQr = await QrModal.find({ restaurant_id: restaurantId });
        if (!AllQr || AllQr.length === 0) {
            return res.status(201).send({ message: 'No Qr Code found.' });
        }
        return res.status(200).json({
            success: true,
            message: "All Qr Codes",
            AllQr
        });
    } catch (error) {
        console.error("GetAllQrCodes error:", error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred",
            error: error.message,
        });
    }
}

const DeleteQrCode = async (req, res) => {
    try {
        const { id, restaurantId } = req.body;

        if (!id || !restaurantId) {
            return res.status(201).json({
                success: false,
                message: "QR Code ID and Restaurant ID are required.",
            });
        }

        const findQr = await QrModal.findOne({ _id: id, restaurant_id: restaurantId });

        if (!findQr) {
            return res.status(201).json({
                success: false,
                message: "QR Code not found.",
            });
        }

        await QrModal.deleteOne({ _id: id, restaurant_id: restaurantId });

        return res.status(200).json({
            success: true,
            message: "QR Code deleted successfully.",
        });
    } catch (error) {
        console.error("DeleteQrCode error:", error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred",
            error: error.message,
        });
    }
};

const AddChef = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(201).json({
                success: false,
                message: "Email is required"
            })
        }

        const manager = await Manager.findOne({ _id: req.managerId });
        if (!manager) {
            return res.status(201).json({
                success: false,
                message: "Manager not found",
            });
        }

        const verificationToken = generateVerificationToken();

        manager.chef_email = email;
        manager.chef_verification_token = verificationToken;

        await manager.save();

        const htmlContent2 = `
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resto-Pay Chef Invitation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; line-height: 1.6;">
    <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        <div style="background-color: #4CAF50; padding: 20px; text-align: center; color: white; border-top-left-radius: 5px; border-top-right-radius: 5px;">
            <h1 style="margin: 0;">Resto-Pay</h1>
            <h3 style="margin: 5px 0 0;">Chef Invitation</h3>
        </div>
        <div style="padding: 20px 30px; color: #333333;">
            <p>Hello,</p>
            <p>You've been invited to join Resto-Pay as a chef! We're excited to have you bring your culinary expertise to our platform.</p>
            <p>Please click the button below to verify your email and complete your chef registration:</p>
            <p style="text-align: center;">
                <a href="${process.env.FERONT_URL}/chef-signup?token=${verificationToken}" 
                   style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; text-align: center; margin: 20px 0;">
                   Verify Email
                </a>
            </p>
        </div>
        <div style="text-align: center; padding: 20px; font-size: 12px; color: #666666; border-top: 1px solid #eee;">
            <p>If you did not request this invitation, please ignore this email.</p>
            <p>© 2025 Resto-Pay. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

        // const htmlContent = `
        //     < p > Hello,</ >
        // <p>You have been invited to join as a chef. Please click the link below to verify your email and complete your registration:</p>
        // <a href="${process.env.FERONT_URL}/chef-signup?token=${verificationToken}">Verify Email</a>
        // <p>If you did not request this, please ignore this email.</p>
        // `;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "kananichirag444@gmail.com",
                pass: "hmvr oqvx kpsu qohf",
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Chef Email Verification",
            html: htmlContent2,
        });
        return res.status(200).json({
            success: true,
            message: "Chef added successfully and email sent!",
        });

    } catch (error) {
        console.error("AddChef error:", error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred",
            error: error.message,
        });
    }
}



module.exports = {
    ManagerSignUp,
    ManagerLogin,
    AddCashier,
    GenrateQrCode,
    GetAllQrCodes,
    DeleteQrCode,
    GetManagerDetails,
    AddChef
}