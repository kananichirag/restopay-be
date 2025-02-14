const express = require("express");
const InventoryRoute = express.Router();
const InventoryController = require("../controller/InventoryController");
const IsManager = require("../middleware/CheckManager")

InventoryRoute.post('/add', IsManager, InventoryController.AddInventory);
InventoryRoute.delete('/delete/:id', IsManager, InventoryController.DeleteInventory);
InventoryRoute.get('/getallinventorys', IsManager, InventoryController.GetAllInventorys);


module.exports = InventoryRoute;    