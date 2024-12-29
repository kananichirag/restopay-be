const express = require("express");
const MenuRoutes = express.Router();
const MenuController = require("../controller/MenuController");
const IsManager = require("../middleware/CheckManager");
const upload = require("../utils/AwsHelper")

MenuRoutes.post('/add', IsManager, upload.single("image"), MenuController.AddMenuItem);
MenuRoutes.get('/getallitems/:id', MenuController.GetAllMenuItems);
MenuRoutes.delete('/deleteitem', IsManager, MenuController.DeleteItem);


module.exports = MenuRoutes;