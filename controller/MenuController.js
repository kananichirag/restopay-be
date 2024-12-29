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
                201,
                error.details.map((err) => err.message)
            );
        }

        const { name, price, category, quantity, description, isAvailable } = value;
        const restaurantId = req.restaurantId;

        if (!req.file) {
            return errorResponse(res, "Image file is required", 201);
        }

        const imageUrl = req.file.location;

        try {

            let menu = await Menu.findOne({ restaurantId });

            if (!menu) {
                menu = new Menu({
                    restaurantId,
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


const GetAllMenuItems = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return errorResponse(res, "Restaurant ID is required", 201);
        }
        const Items = await Menu.find({ restaurantId: id });
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
        const { restaurantId, ItemId } = req.body;

        if (!restaurantId || !ItemId) {
            return errorResponse(res, "Restaurant ID and Item ID are required", 201);
        }

        const restaurant = await Menu.findOneAndUpdate(
            { restaurantId },
            { $pull: { items: { _id: ItemId } } },
            { new: true }
        );
        if (!restaurant) {
            return errorResponse(res, "Restaurant not found", 201);
        }
        return successResponse(res, "Item deleted successfully");
    } catch (error) {
        console.error("DeleteItem error:", error);
        return errorResponse(res, "An unexpected error occurred", 500, error.message);
    }
};


module.exports = {
    AddMenuItem,
    GetAllMenuItems,
    DeleteItem
}