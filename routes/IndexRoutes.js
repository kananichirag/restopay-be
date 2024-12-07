const express = require("express");
const IndexRoutes = express.Router();
const AuthRoutes = require("./AuthRoutes");
const Restaurant = require("./RestaurantRoutes");
const Manager = require("./ManagerRoutes")

IndexRoutes.use("/auth", AuthRoutes);
IndexRoutes.use("/restaurant", Restaurant);
IndexRoutes.use("/manager", Manager);

module.exports = IndexRoutes;
