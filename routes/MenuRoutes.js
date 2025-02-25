const express = require("express");
const MenuRoutes = express.Router();
const MenuController = require("../controller/MenuController");
const IsManager = require("../middleware/CheckManager");
const upload = require("../utils/AwsHelper")

MenuRoutes.post('/add', IsManager, upload.single("image"), MenuController.AddMenuItem);
MenuRoutes.get('/getallitems/:id', MenuController.GetAllMenuItems);
MenuRoutes.put('/update/:id', IsManager, MenuController.UpdateItem);
MenuRoutes.delete('/deleteitem', IsManager, MenuController.DeleteItem);
MenuRoutes.post('/createorder/:id', MenuController.CreateOrder);
MenuRoutes.post('/verifypayment', MenuController.VerifyPayment);
MenuRoutes.get('/getallorders/:id', MenuController.GetAllOrders);


module.exports = MenuRoutes;