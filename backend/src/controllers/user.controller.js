import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import {
  createUserService,
  createUserProfileService,
  deleteUserService,
  getUserByIdService,
  listUsersService,
  updateUserService,
  updateUserProfileService,
  updateUserVisibilityService,
} from "../services/user.service.js";

/**
 * List users handler
 */
export const listUsersHandler = asyncHandler(async (req, res) => {
  const filters = {
    vaitro: req.query.vaitro,
    trangthai: req.query.trangthai,
    search: req.query.search,
  };

  const users = await listUsersService(filters);
  sendSuccess(res, "Lấy danh sách người dùng thành công", users);
});

/**
 * Get user by ID handler
 */
export const getUserHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await getUserByIdService(id);
  sendSuccess(res, "Lấy thông tin người dùng thành công", user);
});

/**
 * Create user handler
 */
export const createUserHandler = asyncHandler(async (req, res) => {
  const user = await createUserService(req.body);
  sendSuccess(res, "Tạo người dùng thành công", user, 201);
});

/**
 * Create user role profile handler (step 2)
 */
export const createUserProfileHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await createUserProfileService(id, req.body);
  sendSuccess(res, "Tạo hồ sơ người dùng thành công", user, 201);
});

/**
 * Update user role profile handler (step 2)
 */
export const updateUserProfileHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await updateUserProfileService(id, req.body);
  sendSuccess(res, "Cập nhật hồ sơ người dùng thành công", user);
});

/**
 * Update user handler
 */
export const updateUserHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await updateUserService(id, req.body);
  sendSuccess(res, "Cập nhật người dùng thành công", user);
});

/**
 * Delete user handler
 */
export const deleteUserHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await deleteUserService(id);
  sendSuccess(res, "Xóa người dùng thành công");
});
