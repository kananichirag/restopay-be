const joi = require("joi");
const Admin = require("../model/AdminModel");
const bcryptjs = require("bcryptjs");
const { successResponse, errorResponse } = require("../utils/ResponseHandlers");
const jwt = require("jsonwebtoken")

const SignupSchema = joi.object({
  name: joi.string().min(3).required(),
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
  mobileno: joi
    .string()
    .pattern(/^[0-9]{10}$/)
    .required(),
});

const LoginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
});


const SignUpAPI = async (req, res) => {
  try {
    const { error, value } = SignupSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return errorResponse(
        res,
        "Validation error",
        400,
        error.details.map((err) => err.message)
      );
    }

    const { name, email, password, mobileno } = value;

    const existingUser = await Admin.findOne({ email });
    if (existingUser) {
      return errorResponse(res, "Email already exists", 400);
    }
    const hashPassword = await bcryptjs.hash(password, 10);

    const newAdmin = new Admin({
      name,
      email,
      password: hashPassword,
      mobileno,
    });
    await newAdmin.save();
    return successResponse(res, "Validation successful", newAdmin);
  } catch (error) {
    console.log(error);
    return errorResponse(res, "An unexpected error occurred", 500, error.message);
  }
};


const LoginAPI = async (req, res) => {
  try {
    const { error, value } = LoginSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return errorResponse(
        res,
        "Validation Error",
        400,
        error.details.map((err) => err.message),
      );
    }

    const { email, password } = value;

    const user = await Admin.findOne({ email });

    if (!user) {
      return errorResponse(res, "User not found", 401);
    }

    const isValidPassword = await bcryptjs.compare(password, user.password);

    if (!isValidPassword) {
      return errorResponse(res, "Invalid Password", 401);
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRATE_KEY, { expiresIn: "24h" })
    user.isActive = true;
    await user.save();

    return successResponse(res, "Login successful", { token, user });
  } catch (error) {
    console.log(error);
    return errorResponse(res, "An unexpected error occurred", 500, error.message);
  }
};

module.exports = {
  SignUpAPI,
  LoginAPI
};
