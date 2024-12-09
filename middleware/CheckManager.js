const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/ResponseHandlers');

const IsManager = (req, res, next) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1]; // Assuming Bearer token

        if (!token) {
            return errorResponse(res, "No token provided", 403);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRATE_KEY);

        const { restaurant_id, manager_id } = decoded;

        if (!manager_id) {
            return res.status(401).json({ message: "Manager ID not found in token" });
        }

        if (!restaurant_id) {
            return res.status(401).json({ message: "Restaurant ID not found in token" });
        }
        req.restaurantId = restaurant_id;
        req.managerId = manager_id;
        next();
    } catch (error) {
        console.error(error);
        return errorResponse(res, "Invalid or expired token", 401);
    }
};

module.exports = IsManager;
