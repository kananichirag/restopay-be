const express = require("express");
const ManagerRoute = express.Router();
const ManagerController = require("../controller/ManagerController");
const IsManager = require("../middleware/CheckManager")

ManagerRoute.post('/signup/:token', ManagerController.ManagerSignUp);
ManagerRoute.post('/login', ManagerController.ManagerLogin);
ManagerRoute.post('/addcashier', IsManager, ManagerController.AddCashier);

module.exports = ManagerRoute;