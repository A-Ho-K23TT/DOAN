// controllers/uploadcareController.js
const crypto = require('crypto');
const axios = require('axios');

class UploadcareController {
  constructor() {
    this.publicKey = process.env.UPLOADCARE_PUBLIC_KEY;
    this.secretKey = process.env.UPLOADCARE_SECRET_KEY;
    this.apiBase = 'https://api.uploadcare.com';
  }

  // 1. SINH SIGNATURE CHO SIGNED UPLOAD
  generateSignature(req, res) {
    try {
      const expire = Math.floor(Date.now() / 1000) + 3600;
      const signature = crypto
        .createHmac('sha256', this.secretKey)
        .update(expire.toString())
        .digest('hex');

      res.json({ success: true, data: { publicKey: this.publicKey, signature, expire } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Khong the tao signature' });
    }
  }

  // 2. LAY DANH SACH FILE
  async getFiles(req, res) {
    try {
      const response = await axios.get(`${this.apiBase}/files/`, {
        headers: { Authorization: `Uploadcare ${this.secretKey}:${this.publicKey}` },
        params: { limit: req.query.limit || 10, offset: req.query.offset || 0, ordering: '-datetime_uploaded' },
      });
      res.json({ success: true, data: response.data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Khong the lay danh sach file', error: error.response?.data });
    }
  }

  // 3. LAY THONG TIN CHI TIET FILE
  async getFileInfo(req, res) {
    try {
      const { fileId } = req.params;
      const response = await axios.get(`${this.apiBase}/files/${fileId}/`, {
        headers: { Authorization: `Uploadcare ${this.secretKey}:${this.publicKey}` },
      });
      res.json({ success: true, data: response.data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Khong the lay thong tin file' });
    }
  }

  // 4. XOA FILE
  async deleteFile(req, res) {
    try {
      const { fileId } = req.params;
      const response = await axios.delete(`${this.apiBase}/files/${fileId}/`, {
        headers: { Authorization: `Uploadcare ${this.secretKey}:${this.publicKey}` },
      });
      res.json({ success: true, message: 'File da duoc xoa', data: response.data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Khong the xoa file' });
    }
  }

  // 5. XAC THUC WEBHOOK
  verifyWebhook(req, res) {
    try {
      const signature = req.headers['x-uc-signature'];
      const payload = JSON.stringify(req.body);
      const expectedSig = crypto
        .createHmac('sha256', this.secretKey)
        .update(payload)
        .digest('hex');

      if (signature === expectedSig) {
        console.log('Webhook hop le:', req.body);
        res.json({ success: true, message: 'Webhook verified' });
      } else {
        res.status(403).json({ success: false, message: 'Chu ky khong hop le' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Loi xac thuc webhook' });
    }
  }
}

module.exports = new UploadcareController();