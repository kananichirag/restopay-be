const express = require("express");
const InventoryRoute = express.Router();
const InventoryController = require("../controller/InventoryController");
const { IsManager } = require("../middleware/CheckManager");
const { IsChefs } = require("../middleware/CheckManager");

InventoryRoute.post('/add', IsManager, InventoryController.AddInventory);
InventoryRoute.delete('/delete/:id', IsManager, InventoryController.DeleteInventory);
InventoryRoute.get('/getallinventorys', IsChefs, InventoryController.GetAllInventorys);
InventoryRoute.put('/update/:id', IsChefs, InventoryController.UpdateInventory);


module.exports = InventoryRoute;    