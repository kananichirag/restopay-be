const express = require("express")
const RestaurantRoutes = express.Router();
const RestaurantController = require("../controller/RestaurantController");
const CheckisAdmin = require("../middleware/CheckAdmin")

RestaurantRoutes.post('/add-restaurant', CheckisAdmin, RestaurantController.AddRestaurant)

module.exports = RestaurantRoutes;