const express = require("express");
const StaffRoute = express.Router();
const StaffController = require("../controller/StaffController");
const { IsManager } = require("../middleware/CheckManager");
const upload = require("../utils/AwsHelper")

StaffRoute.post("/add-member", IsManager, upload.single("profile"), StaffController.AddStaffMember);
StaffRoute.get("/get-members", IsManager, StaffController.GetAllStaffMember);
StaffRoute.delete("/delete-members/:id", IsManager, StaffController.DeleteMember);

module.exports = StaffRoute;