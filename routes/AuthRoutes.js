const express = require("express");
const AuthRoutes = express.Router();
const AuthController = require("../controller/AuthController");

AuthRoutes.post("/signup", AuthController.SignUpAPI);
AuthRoutes.post("/login", AuthController.LoginAPI);

module.exports = AuthRoutes;
