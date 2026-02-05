const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Endpoint: POST http://localhost:5000/api/auth/login
router.post('/login', authController.login);

// INI YANG PALING PENTING BREE:
module.exports = router;