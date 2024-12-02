const mongoose = require("mongoose");

const adminschema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: true,
    required: true,
  },
  mobileno: {
    type: String,
    required: true,
  },
});

const Admin = mongoose.model("Admin", adminschema);
module.exports = Admin;
