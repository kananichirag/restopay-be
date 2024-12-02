const joi = require("joi");
const Restaurant = require("../model/RestaurantModel");
const { successResponse, errorResponse } = require("../utils/ResponseHandlers");

const RestaurantSchema = joi.object({
    name: joi.string().required(),
    location: joi.string().required(),
    manager: joi.string().required(),
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
            manager: value.manager,
            manager_email: value.manager_email,
            admin_id: req.user._id,
        })
        await newRestaurant.save();
        return successResponse(res, "Restaurant added successfully", newRestaurant)
    } catch (error) {
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