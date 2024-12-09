const express = require("express");
const CashierRoute = express.Router();
const CashierController = require("../controller/CashierController");

CashierRoute.post("/signup/:token", CashierController.CashierSignUp);
CashierRoute.post("/login", CashierController.CashierLogin);

module.exports = CashierRoute;