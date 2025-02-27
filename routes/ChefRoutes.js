const express = require("express");
const ChefRoute = express.Router();
const ChefController = require("../controller/ChefController");
const IsManager = require("../middleware/CheckManager");

ChefRoute.post("/chef-signup/:token", ChefController.SignUpChef);
ChefRoute.get("/getallchef", IsManager, ChefController.GetAllChef);
ChefRoute.post("/chef-login", ChefController.ChefLogin);
ChefRoute.post("/update-status", ChefController.ChnageStatus);

module.exports = ChefRoute;