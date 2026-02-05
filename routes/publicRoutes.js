const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');
const { validateRegistration } = require('../utils/validator');

router.post('/register', async (req, res) => {
    // Jalankan validasi input dulu
    const validation = validateRegistration(req.body);
    if (!validation.isValid) {
        return res.status(400).json({ errors: validation.errors });
    }
    
    // Jika lolos, jalankan controller
    publicController.registerIntern(req, res);
});

module.exports = router;