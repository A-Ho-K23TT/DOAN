import express from "express";
import { getFormHandler, saveFormHandler } from "../controllers/form.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/:hocbongId", getFormHandler);
router.post("/:hocbongId", verifyToken, requireRole("ad"), saveFormHandler);

export default router;