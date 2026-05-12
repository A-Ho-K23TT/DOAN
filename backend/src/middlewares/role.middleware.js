export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Chưa xác thực" });
    }

    if (!allowedRoles.includes(req.user.vaitro)) {
      return res.status(403).json({ success: false, message: "Bạn không có quyền thực hiện thao tác này" });
    }

    next();
  };
};