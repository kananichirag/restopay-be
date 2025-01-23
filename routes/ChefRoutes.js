const express = require("express");
const ChefRoute = express.Router();
const ChefController = require("../controller/ChefController");

ChefRoute.post("/chef-signup/:token", ChefController.SignUpChef);
ChefRoute.post("/chef-login", ChefController.ChefLogin);

module.exports = ChefRoute;