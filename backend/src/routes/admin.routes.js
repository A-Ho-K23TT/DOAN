import express from "express";
import {
  approveApplicationHandler,
  createClassHandler,
  createFacultyHandler,
  createMajorHandler,
  deleteClassHandler,
  deleteFacultyHandler,
  deleteMajorHandler,
  getAcademicStructureHandler,
  getApplicationDetailHandler,
  getApplicationsByScholarshipHandler,
  saveReviewHandler,
  selectScholarshipHandler,
  updateApplicationStatusHandler,
  updateClassHandler,
  updateFacultyHandler,
  updateMajorHandler,
} from "../controllers/admin.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/applications/:hocbongId", verifyToken, requireRole("ad"), getApplicationsByScholarshipHandler);
router.get("/applications/detail/:id", verifyToken, requireRole("ad"), getApplicationDetailHandler);
router.post("/review", verifyToken, requireRole("ad"), saveReviewHandler);
router.post("/approve", verifyToken, requireRole("ad"), approveApplicationHandler);
router.post("/application-status", verifyToken, requireRole("ad"), updateApplicationStatusHandler);
router.post("/select", verifyToken, requireRole("ad"), selectScholarshipHandler);

router.get("/academics", verifyToken, requireRole("ad"), getAcademicStructureHandler);

router.post("/academics/khoa", verifyToken, requireRole("ad"), createFacultyHandler);
router.put("/academics/khoa/:id", verifyToken, requireRole("ad"), updateFacultyHandler);
router.delete("/academics/khoa/:id", verifyToken, requireRole("ad"), deleteFacultyHandler);

router.post("/academics/nganh", verifyToken, requireRole("ad"), createMajorHandler);
router.put("/academics/nganh/:id", verifyToken, requireRole("ad"), updateMajorHandler);
router.delete("/academics/nganh/:id", verifyToken, requireRole("ad"), deleteMajorHandler);

router.post("/academics/lop", verifyToken, requireRole("ad"), createClassHandler);
router.put("/academics/lop/:id", verifyToken, requireRole("ad"), updateClassHandler);
router.delete("/academics/lop/:id", verifyToken, requireRole("ad"), deleteClassHandler);

export default router;