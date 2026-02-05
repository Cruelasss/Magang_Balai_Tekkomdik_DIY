const express = require('express');
const router = express.Router();
const logbookController = require('../controllers/logbookController');
const authMiddleware = require('../middleware/authMiddleware');

// Endpoint: POST /api/logbook/submit
router.post('/submit', authMiddleware, logbookController.submitLogbook);

module.exports = router;