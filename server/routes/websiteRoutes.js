const express = require('express');
const { getWebsiteContent, saveWebsiteContent } = require('../controllers/websiteController');

const router = express.Router();

router.get('/content', getWebsiteContent);
router.post('/content', saveWebsiteContent);

module.exports = router;

