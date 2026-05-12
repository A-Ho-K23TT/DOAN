export const sendSuccess = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

export const sendError = (res, message, statusCode = 500, details = null) => {
  return res.status(statusCode).json({ success: false, message, details });
};