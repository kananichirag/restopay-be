const Restaurant = require("../model/RestaurantModel");
const Order = require("../model/OrderModel");
const Staff = require("../model/StaffModel");
const Menu = require("../model/MenuModel");
const Chef = require("../model/ChefModel");
const Manager = require("../model/ManagerModel");

const GetAllRestaurantReports = async (req, res) => {
    try {

        if (!req.user._id) {
            return res.status(400).json({ success: false, message: "Admin ID is required" });
        }

        const restaurants = await Restaurant.find({ admin_id: req.user._id });

        if (!restaurants.length) {
            return res.status(201).json({ success: false, message: "No restaurants found for this admin" });
        }

        const stats = {
            totalRevenue: 0,
            totalOrders: 0,
            totalStaff: 0,
            totalMenuItems: 0,
            restaurantBreakdown: []
        };

        for (const restaurant of restaurants) {
            const orders = await Order.aggregate([
                { $match: { restaurantId: restaurant._id.toString() } },
                {
                    $addFields: {
                        numericAmount: {
                            $convert: {
                                input: {
                                    $replaceAll: {
                                        input: "$total_amount",
                                        find: ",",
                                        replacement: ""
                                    }
                                },
                                to: "double",
                                onError: 0,
                                onNull: 0
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        revenue: { $sum: "$numericAmount" },
                        orders: { $sum: 1 }
                    }
                }
            ]);

            const staffCount = await Staff.countDocuments({ restaurant_id: restaurant._id });

            const restaurantStats = orders[0] || { revenue: 0, orders: 0 };

            stats.restaurantBreakdown.push({
                name: restaurant.name,
                revenue: restaurantStats.revenue,
                orders: restaurantStats.orders,
                staff: staffCount
            });

            // Update overall totals
            stats.totalRevenue += restaurantStats.revenue;
            stats.totalOrders += restaurantStats.orders;
            stats.totalStaff += staffCount;
        }

        const totalMenuItems = await Menu.aggregate([
            { $match: { restaurant_id: { $in: restaurants.map(r => r._id) } } },
            {
                $group: {
                    _id: null,
                    totalItems: { $sum: { $size: "$items" } }
                }
            }
        ]);

        stats.totalMenuItems = totalMenuItems[0]?.totalItems || 0;

        return res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error("Error generating report:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};




const getAllCompletedOrders = async (req, res) => {
    try {
        const { id } = req.params; // Get adminId from request parameters

        // Find restaurants that belong to the given adminId
        const restaurants = await Restaurant.find({ admin_id: id });

        // Extract restaurant IDs
        const restaurantIds = restaurants.map(restaurant => restaurant._id);

        // Find completed orders only for restaurants owned by the given admin
        const completedOrders = await Order.find({
            order_status: "Done",
            restaurantId: { $in: restaurantIds }
        }).sort({ createdAt: -1 });

        // Create a map of restaurantId to restaurant name
        const restaurantMap = restaurants.reduce((acc, restaurant) => {
            acc[restaurant._id.toString()] = restaurant.name;
            return acc;
        }, {});

        // Group orders by restaurant name
        const groupedOrders = {};
        completedOrders.forEach(order => {
            const restaurantName = restaurantMap[order.restaurantId.toString()] || "Unknown";
            if (!groupedOrders[restaurantName]) {
                groupedOrders[restaurantName] = { totalOrders: 0, orders: [] };
            }
            groupedOrders[restaurantName].orders.push(order);
            groupedOrders[restaurantName].totalOrders++;
        });

        res.status(200).json({ success: true, orders: groupedOrders });
    } catch (error) {
        console.error("Error fetching completed orders:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


const GetAllMembers = async (req, res) => {
    try {
        const { id } = req.params;

        const restaurants = await Restaurant.find({ admin_id: id });

        if (!restaurants.length) {
            return res.status(404).json({ success: false, message: "No restaurants found for this admin." });
        }

        const restaurantIds = restaurants.map((r) => r._id);

        const managers = await Manager.find({ restaurant_id: { $in: restaurantIds } })
            .populate("restaurant_id", "name"); // Populate restaurant name

        const chefs = await Chef.find({ restaurant_id: { $in: restaurantIds } })
            .populate("restaurant_id", "name")
            .populate("manager_id", "name");

        const members = [
            ...managers.map((manager) => ({
                _id: manager._id,
                name: manager.name,
                email: manager.manager_email,
                role: "Manager",
                restaurant: manager.restaurant_id.name,
            })),
            ...chefs.map((chef) => ({
                _id: chef._id,
                name: chef.chef_name,
                email: chef.chef_email,
                role: "Chef",
                restaurant: chef.restaurant_id.name,
                manager: chef.manager_id.name,
            })),
        ];

        res.status(200).json({ success: true, members });
    } catch (error) {
        console.error("Error fetching members:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports = {
    GetAllRestaurantReports,
    getAllCompletedOrders,
    GetAllMembers
};