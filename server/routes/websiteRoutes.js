const express = require('express');
const { getWebsiteContent, saveWebsiteContent, getWebsiteStats } = require('../controllers/websiteController');

const router = express.Router();

router.get('/content', getWebsiteContent);
router.post('/content', saveWebsiteContent);
router.get('/stats', getWebsiteStats);

module.exports = router;

