const express = require("express");
const MenuRoutes = express.Router();
const MenuController = require("../controller/MenuController");
const { IsManager } = require("../middleware/CheckManager");
const ChcekisAdmin = require("../middleware/CheckAdmin");
const upload = require("../utils/AwsHelper")

MenuRoutes.post('/add', ChcekisAdmin, upload.single("image"), MenuController.AddMenuItem);
MenuRoutes.get('/getallitems/:id', MenuController.GetAllMenuItems);
MenuRoutes.get('/getmenu/:id', MenuController.GetAllMenu);
MenuRoutes.put('/update/:id', ChcekisAdmin, MenuController.UpdateItem);
MenuRoutes.delete('/deleteitem', ChcekisAdmin, MenuController.DeleteItem);
MenuRoutes.post('/createorder/:id', MenuController.CreateOrder);
MenuRoutes.post('/verifypayment', MenuController.VerifyPayment);
MenuRoutes.get('/getallorders/:id', MenuController.GetAllOrders);


module.exports = MenuRoutes;