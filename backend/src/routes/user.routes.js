import express from "express";
import {
  createUserHandler,
  createUserProfileHandler,
  deleteUserHandler,
  getUserHandler,
  listUsersHandler,
  updateUserHandler,
  updateUserProfileHandler,
} from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", verifyToken, requireRole("ad"), listUsersHandler);
router.get("/:id", verifyToken, requireRole("ad"), getUserHandler);
router.post("/", verifyToken, requireRole("ad"), createUserHandler);
router.post("/:id/profile", verifyToken, requireRole("ad"), createUserProfileHandler);
router.post("/profile/:id", verifyToken, requireRole("ad"), createUserProfileHandler);
router.put("/:id", verifyToken, requireRole("ad"), updateUserHandler);
router.put("/:id/profile", verifyToken, requireRole("ad"), updateUserProfileHandler);
router.put("/profile/:id", verifyToken, requireRole("ad"), updateUserProfileHandler);
router.delete("/:id", verifyToken, requireRole("ad"), deleteUserHandler);

export default router;
