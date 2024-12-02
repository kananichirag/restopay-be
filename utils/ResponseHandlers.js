const successResponse = (res, message, data = null) => {
  return res.status(200).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (res, message, statusCode, errorDetails) => {
  return res.status(statusCode).json({
    success: false,
    message: message,
    errors: errorDetails,
  });
};


module.exports = { successResponse, errorResponse };
