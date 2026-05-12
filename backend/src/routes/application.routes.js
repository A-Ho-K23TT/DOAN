import express from "express";
import { getMyApplicationsHandler, submitApplicationHandler } from "../controllers/application.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/", verifyToken, requireRole("sv"), upload.any(), submitApplicationHandler);
router.get("/my", verifyToken, requireRole("sv"), getMyApplicationsHandler);

export default router;