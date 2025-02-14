const Inventory = require("../model/InventoryModel");

const AddInventory = async (req, res) => {
    try {
        const { name, sender, quantity, total_amount } = req.body;

        if (!name || !sender || !quantity || !total_amount) {
            return res.status(201).json({ message: "Please provide all the fields" });
        }

        const parsedQuantity = parseFloat(quantity);
        const parsedTotalAmount = parseFloat(total_amount);

        if (isNaN(parsedQuantity) || isNaN(parsedTotalAmount)) {
            return res.status(201).json({ message: "Quantity and total amount must be numbers." });
        }

        let inventory = await Inventory.findOne({ name, restaurant_id: req.restaurantId });

        if (inventory) {
            inventory.quantity = (parseFloat(inventory.quantity) || 0) + parsedQuantity;
            inventory.total_amount += parsedTotalAmount;
            await inventory.save();

            return res.status(200).json({ message: "Inventory Updated Successfully" });
        } else {
            inventory = new Inventory({
                name,
                sender,
                total_amount: parsedTotalAmount,
                quantity: parsedQuantity,
                restaurant_id: req.restaurantId,
                manager_id: req.managerId
            });
            const data = await inventory.save();

            return res.status(200).json({ success: true, message: "Inventory Added Successfully", inventory: data });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


const DeleteInventory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(201).json({ message: "Please provide the inventory ID" });
        }

        const inventory = await Inventory.findByIdAndDelete(id);
        if (!inventory) {
            return res.status(201).json({ message: "Inventory Not Found" });
        }

        return res.status(200).json({ success: true, message: "Inventory Deleted Successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


const GetAllInventorys = async (req, res) => {
    try {

        if (!req.restaurantId || !req.managerId) {
            return res.status(201).json({ message: "Invalid Request" });
        }

        const inventorys = await Inventory.find({ restaurant_id: req.restaurantId, manager_id: req.managerId });
        if (!inventorys || inventorys.length === 0) {
            return res.status(201).json({ message: "Inventory Not Found" });
        }

        res.status(200).json({ success: true, inventorys });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports = { AddInventory, DeleteInventory, GetAllInventorys };
