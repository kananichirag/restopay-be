const express = require("express");
const ReportRoute = express.Router();
const Reportcontroller = require("../controller/ReportController");
const ChcekisAdmin = require("../middleware/CheckAdmin");

ReportRoute.get("/get-report/:id", ChcekisAdmin, Reportcontroller.GetAllRestaurantReports);
ReportRoute.get("/get-orders/:id", Reportcontroller.getAllCompletedOrders);
ReportRoute.get("/get-members/:id", Reportcontroller.GetAllMembers);

module.exports = ReportRoute;