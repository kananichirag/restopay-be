const express = require("express");
const MenuRoutes = express.Router();
const MenuController = require("../controller/MenuController");
const  IsManager  = require("../middleware/CheckManager")

MenuRoutes.post('/add', IsManager, MenuController.AddMenuItem)


module.exports = MenuRoutes;