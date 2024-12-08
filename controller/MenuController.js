const Joi = require("joi");
const Menu = require("../model/MenuModel");
const { successResponse, errorResponse } = require("../utils/ResponseHandlers");

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
                400,
                error.details.map((err) => err.message)
            );
        }

        const { name, price, category, quantity, description, isAvailable, imageUrl } = value;
        const restaurantId = req.restaurantId;

        try {

            let menu = await Menu.findOne({ restaurantId });

            if (!menu) {
                menu = new Menu({
                    restaurantId,
                    items: [],
                });
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


module.exports = {
    AddMenuItem
}