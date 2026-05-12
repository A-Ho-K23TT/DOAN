import express from "express";
import {
	deleteScholarshipFileHandler,
	downloadScholarshipFileHandler,
	uploadScholarshipFileHandler,
} from "../controllers/file.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.post("/upload", verifyToken, requireRole("ad"), upload.array("files", 10), uploadScholarshipFileHandler);
router.get("/:id/download", verifyToken, requireRole("ad"), downloadScholarshipFileHandler);
router.delete("/:id", verifyToken, requireRole("ad"), deleteScholarshipFileHandler);

export default router;