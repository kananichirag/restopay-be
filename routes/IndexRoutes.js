const express = require("express");
const IndexRoutes = express.Router();
const AuthRoutes = require("./AuthRoutes");
const Restaurant = require("./RestaurantRoutes")

IndexRoutes.use("/auth", AuthRoutes);
IndexRoutes.use("/restaurant", Restaurant);

module.exports = IndexRoutes;
