const express = require("express");
const ManagerRoute = express.Router();
const ManagerController = require("../controller/ManagerController");
const IsManager = require("../middleware/CheckManager")

ManagerRoute.post('/signup/:token', ManagerController.ManagerSignUp);
ManagerRoute.post('/login', ManagerController.ManagerLogin);
ManagerRoute.post('/addcashier', IsManager, ManagerController.AddCashier);
ManagerRoute.post('/qrcode', IsManager, ManagerController.GenrateQrCode);
ManagerRoute.get('/getallqr/:id', IsManager, ManagerController.GetAllQrCodes);
ManagerRoute.get('/manager-details', ManagerController.GetManagerDetails);
ManagerRoute.delete('/deleteqr', IsManager, ManagerController.DeleteQrCode);

module.exports = ManagerRoute;