// routes/uploadcare.js
const express = require('express');
const router = express.Router();
const uploadcareController = require('../controllers/uploadcareController');

// POST /api/uploadcare/signature - Lay signature cho signed upload
router.get('/signature', (req, res) => uploadcareController.generateSignature(req, res));

// GET /api/uploadcare/files - Lay danh sach file
router.get('/files', (req, res) => uploadcareController.getFiles(req, res));

// GET /api/uploadcare/files/:fileId - Lay thong tin chi tiet file
router.get('/files/:fileId', (req, res) => uploadcareController.getFileInfo(req, res));

// DELETE /api/uploadcare/files/:fileId - Xoa file
router.delete('/files/:fileId', (req, res) => uploadcareController.deleteFile(req, res));

// POST /api/uploadcare/webhook - Nhan webhook tu Uploadcare
router.post('/webhook', (req, res) => uploadcareController.verifyWebhook(req, res));

module.exports = router;