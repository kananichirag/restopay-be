const Staff = require("../model/StaffModel");
const { errorResponse } = require("../utils/ResponseHandlers");

const AddStaffMember = async (req, res) => {
    try {
        const { name, role, contect, shift } = req.body;
        if (!name || !role || !contect || !shift) {
            return errorResponse(res, "All Fields are required", 201);
        }

        if (!req.file) {
            return errorResponse(res, "Image file is required", 201);
        }

        const imageUrl = req.file.location;

        const staffmember = new Staff({
            name,
            role,
            contect,
            shift,
            profile: imageUrl,
            restaurant_id: req.restaurantId,
            manager_id: req.managerId
        })

        await staffmember.save();

        res.status(200).json({
            success: true,
            message: "Staff Member Added",
            staffmember
        })
    } catch (error) {
        console.log(error)
    }
}

const GetAllStaffMember = async (req, res) => {
    try {
        const findMember = await Staff.find({ restaurant_id: req.restaurantId, manager_id: req.managerId });
        if (!findMember) {
            return errorResponse(res, "Staff Member not found", 201);
        }

        if (findMember.length === 0) {
            return errorResponse(res, "No Member Found", 201);
        }
        res.status(200).json({
            success: true,
            members: findMember
        })
    } catch (error) {
        console.log(error)
    }
}

const DeleteMember = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return errorResponse(res, "Member ID not Found", 201);
        }

        const Findmembder = await Staff.findOne({ _id: id });
        if (!Findmembder) {
            return errorResponse(res, "Member is not Found", 201);
        }

        await Staff.deleteOne({ _id: id });
        res.status(200).json({
            success: true,
            message: "Member deleted"
        })
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    AddStaffMember,
    GetAllStaffMember,
    DeleteMember
}