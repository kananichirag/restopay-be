const express = require("express");
const AuthRoutes = express.Router();
const AuthController = require("../controller/AuthController");

AuthRoutes.post("/signup", AuthController.SignUpAPI);
AuthRoutes.post("/login", AuthController.LoginAPI);
AuthRoutes.post("/forgot-password", AuthController.ForgotPassword);
AuthRoutes.post("/reset-password", AuthController.ResetPassword);

module.exports = AuthRoutes;
