const express = require("express");
const IndexRoutes = express.Router();
const AuthRoutes = require("./AuthRoutes");

IndexRoutes.use("/auth", AuthRoutes);

module.exports = IndexRoutes;
