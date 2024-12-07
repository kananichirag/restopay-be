const joi = require("joi");
const Restaurant = require("../model/RestaurantModel");
const { successResponse, errorResponse } = require("../utils/ResponseHandlers");
const nodemailer = require("nodemailer")
const { generateVerificationToken } = require("../utils/Helpers")

const RestaurantSchema = joi.object({
    name: joi.string().required(),
    location: joi.string().required(),
    manager_name: joi.string().required(),
    manager_email: joi.string().email().required(),
});

const AddRestaurant = async (req, res) => {
    try {
        const { error, value } = RestaurantSchema.validate(req.body, {
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

        const newRestaurant = new Restaurant({
            name: value.name,
            location: value.location,
            manager_name: value.manager_name,
            manager_email: value.manager_email,
            admin_id: req.user._id,
        })
        await newRestaurant.save();

        const verificationToken = generateVerificationToken();
        newRestaurant.manager_email_verification_token = verificationToken;
        const saved = await newRestaurant.save();

        const htmlContent = `
       <p>Hello ${value.manager},</p>
       <p>Click the link below to verify your email and complete your restaurant registration:</p>
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
            to: value.manager_email,
            subject: 'Restaurant Email Verification',
            html: htmlContent,
        });

        if (info) {
            return successResponse(res, "Restaurant added successfully and email sent!", newRestaurant);
        }

    } catch (error) {
        console.log(error);
        if (error.code === 11000) {
            const duplicateFields = Object.keys(error.keyValue).map(field => {
                return `${field} '${error.keyValue[field]}' is already in use.`;
            });

            return errorResponse(
                res,
                "Duplicate key error",
                400,
                duplicateFields,
            );
        }
        return errorResponse(res, "An unexpected error occurred", 500, error.message);
    }

}

module.exports = {
    AddRestaurant
}