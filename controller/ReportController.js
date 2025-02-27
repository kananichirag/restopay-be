const Restaurant = require("../model/RestaurantModel");
const Order = require("../model/OrderModel");
const Staff = require("../model/StaffModel");
const Menu = require("../model/MenuModel");

const GetAllRestaurantReports = async (req, res) => {
    try {
        // Fetch all restaurants
        const restaurants = await Restaurant.find();

        // Initialize report data with the requested structure
        const stats = {
            totalRevenue: 0,
            totalOrders: 0,
            totalStaff: 0,
            totalMenuItems: 0,
            restaurantBreakdown: []
        };

        // Loop through each restaurant to calculate stats
        for (const restaurant of restaurants) {
            // Calculate total revenue and orders for this restaurant
            const orders = await Order.aggregate([
                {
                    $match: {
                        restaurantId: restaurant._id.toString()
                    }
                },
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

            // Get staff count
            const staffCount = await Staff.countDocuments({
                restaurant_id: restaurant._id
            });

            const restaurantStats = orders[0] || { revenue: 0, orders: 0 };

            // Add restaurant breakdown in simplified format
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

        // Calculate total menu items across all restaurants
        const totalMenuItems = await Menu.aggregate([
            {
                $group: {
                    _id: null,
                    totalItems: {
                        $sum: { $size: "$items" }
                    }
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
        // Fetch all completed orders
        const completedOrders = await Order.find({ order_status: "Done" }).sort({ createdAt: -1 });

        // Get unique restaurant IDs from the orders
        const restaurantIds = [...new Set(completedOrders.map(order => order.restaurantId))];

        // Fetch restaurant details for the IDs
        const restaurants = await Restaurant.find({ _id: { $in: restaurantIds } });

        // Create a mapping of restaurantId -> restaurantName
        const restaurantMap = restaurants.reduce((acc, restaurant) => {
            acc[restaurant._id] = restaurant.name; // Assuming `name` is the field storing the restaurant's name
            return acc;
        }, {});

        // Group orders by restaurant name and count total orders
        const groupedOrders = Object.values(restaurantMap).reduce((acc, restaurantName) => {
            acc[restaurantName] = { totalOrders: 0, orders: [] };
            return acc;
        }, {});

        completedOrders.forEach(order => {
            const restaurantName = restaurantMap[order.restaurantId] || "Unknown"; // Fallback for missing restaurants
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


module.exports = {
    GetAllRestaurantReports,
    getAllCompletedOrders
};