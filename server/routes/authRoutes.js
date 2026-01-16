const express = require('express');
const { loginUser, resetPasswordToDefault } = require('../controllers/authController');
const router = express.Router();

router.post('/login', loginUser);
router.post('/reset-password', resetPasswordToDefault);

module.exports = router;
