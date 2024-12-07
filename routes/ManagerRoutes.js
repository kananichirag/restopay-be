const express = require("express");
const ManagerRoute = express.Router();
const ManagerController = require("../controller/ManagerController")

ManagerRoute.post('/signup/:token', ManagerController.ManagerSignUp)
ManagerRoute.post('/login', ManagerController.ManagerLogin)

module.exports = ManagerRoute;