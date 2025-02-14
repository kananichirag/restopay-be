const express = require("express");
const IndexRoutes = express.Router();
const AuthRoutes = require("./AuthRoutes");
const Restaurant = require("./RestaurantRoutes");
const Manager = require("./ManagerRoutes");
const Menu = require("./MenuRoutes");
const Cashier = require('./CashierRoutes');
const Staff = require("./StaffRoutes");
const Chef = require("./ChefRoutes");
const Report = require("./ReportRoutes");
const Inventory = require("./Inventory");

IndexRoutes.use("/auth", AuthRoutes);
IndexRoutes.use("/restaurant", Restaurant);
IndexRoutes.use("/manager", Manager);
IndexRoutes.use("/menu", Menu);
IndexRoutes.use("/cashier", Cashier);
IndexRoutes.use("/staff", Staff);
IndexRoutes.use("/chef", Chef);
IndexRoutes.use("/report", Report);
IndexRoutes.use("/inventory", Inventory);

module.exports = IndexRoutes;
