const express = require("express")
const RestaurantRoutes = express.Router();
const RestaurantController = require("../controller/RestaurantController");
const CheckisAdmin = require("../middleware/CheckAdmin")

RestaurantRoutes.post('/add-restaurant', CheckisAdmin, RestaurantController.AddRestaurant);
RestaurantRoutes.get('/getallrestaurant/:id', CheckisAdmin, RestaurantController.GetAllRestaurant);
RestaurantRoutes.delete('/delete-restaurant/:id', CheckisAdmin, RestaurantController.DeleteRestaurant);

module.exports = RestaurantRoutes;