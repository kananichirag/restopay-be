const express = require("express");
const ReportRoute = express.Router();
const Reportcontroller = require("../controller/ReportController");
const ChcekisAdmin = require("../middleware/CheckAdmin");

ReportRoute.get("/get-report", ChcekisAdmin, Reportcontroller.GetAllRestaurantReports);

module.exports = ReportRoute;