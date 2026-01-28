const express = require('express');
const { getWebsiteContent, saveWebsiteContent, getStats } = require('../controllers/websiteController');

const router = express.Router();

router.get('/content', getWebsiteContent);
router.post('/content', saveWebsiteContent);
router.get('/stats', getStats);

module.exports = router;

