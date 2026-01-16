const express = require('express');
const { loginUser, resetPasswordToDefault, updateCredentials } = require('../controllers/authController');
const router = express.Router();

router.post('/login', loginUser);
router.post('/reset-password', resetPasswordToDefault);
router.post('/update-credentials', updateCredentials);

module.exports = router;
