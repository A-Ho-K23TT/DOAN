import express from "express";
import {
  createScholarshipHandler,
  deleteScholarshipHandler,
  getScholarshipHandler,
  listScholarshipsHandler,
  updateScholarshipHandler,
} from "../controllers/scholarship.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { getScholarshipFilesHandler } from "../controllers/file.controller.js";

const router = express.Router();

router.get("/", listScholarshipsHandler);
router.get("/:id", getScholarshipHandler);
router.get("/:id/files", getScholarshipFilesHandler);
router.post("/", verifyToken, requireRole("ad"), createScholarshipHandler);
router.put("/:id", verifyToken, requireRole("ad"), updateScholarshipHandler);
router.delete("/:id", verifyToken, requireRole("ad"), deleteScholarshipHandler);

export default router;