const joi = require("joi");
const Admin = require("../model/AdminModel");
const bcryptjs = require("bcryptjs");
const { successResponse, errorResponse } = require("../utils/ResponseHandlers");
const jwt = require("jsonwebtoken");
const Chef = require("../model/ChefModel");
const Manager = require("../model/ManagerModel");
const { generateVerificationToken } = require("../utils/Helpers");
const nodemailer = require("nodemailer");

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
      const validationErrors = error.details.reduce((acc, err) => {
        acc[err.context.key] = err.message;
        return acc;
      }, {});
      return res.status(201).json({
        success: false,
        message: "Validation error",
        errors: validationErrors,
      });
    }

    const { name, email, password, mobileno } = value;

    const existingUser = await Admin.findOne({ email });
    if (existingUser) {
      return errorResponse(res, "Email already exists", 201);
    }
    const hashPassword = await bcryptjs.hash(password, 10);

    const newAdmin = new Admin({
      name,
      email,
      password: hashPassword,
      mobileno,
    });
    await newAdmin.save();
    return successResponse(res, "Signup Successfully", newAdmin);
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
      return errorResponse(res, "User not found", 201);
    }

    const isValidPassword = await bcryptjs.compare(password, user.password);

    if (!isValidPassword) {
      return errorResponse(res, "Invalid Password", 201);
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


const ForgotPassword = async (req, res) => {
  try {

    const { email } = req.body;
    if (!email) {
      return errorResponse(res, "Email is required", 201);
    }

    const manager = await Manager.findOne({ manager_email: email });
    const chef = await Chef.findOne({ chef_email: email });
    const admin = await Admin.findOne({ email });

    if (!manager && !chef && !admin) {
      return errorResponse(res, "User not found", 201);
    }

    const token = generateVerificationToken();
    if (manager) {
      manager.forgot_password_token = token;
      await manager.save();
    } else if (chef) {
      chef.forgot_password_token = token;
      await chef.save();
    } else {
      admin.forgot_password_token = token;
      await admin.save();
    }


    const htmlContent = `
            <p>Hello,</p>
            <p>You have been request to reset your password. Please click the link below to reset your password</p>
            <a href="${process.env.FERONT_URL}/forgot-password?token=${token}">Reset Password</a>
            <p>If you did not request this, please ignore this email.</p>
        `;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "kananichirag444@gmail.com",
        pass: "hmvr oqvx kpsu qohf",
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Forgot Password",
      html: htmlContent,
    });

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.log(error);
  }
}


const ResetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return errorResponse(res, "Token and Password is required", 201);
    }

    const manager = await Manager.findOne({ forgot_password_token: token });
    const chef = await Chef.findOne({ forgot_password_token: token });
    const admin = await Admin.findOne({ forgot_password_token: token });

    if (!manager && !chef && !admin) {
      return errorResponse(res, "Invalid token", 201);
    }

    const hashPassword = await bcryptjs.hash(password, 10);

    if (manager) {
      manager.password = hashPassword;
      manager.forgot_password_token = null;
      await manager.save();
    } else if (chef) {
      chef.password = hashPassword;
      chef.forgot_password_token = null;
      await chef.save();
    } else {
      admin.password = hashPassword;
      admin.forgot_password_token = null;
      await admin.save();
    }

    return successResponse(res, "Password reset successfully", 200);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  SignUpAPI,
  LoginAPI,
  ForgotPassword,
  ResetPassword
};
