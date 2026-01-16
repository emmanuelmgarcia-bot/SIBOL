const express = require('express');
const { getAllHeis, uploadSubmission, getSubmissions } = require('../controllers/heiController');
const router = express.Router();

router.get('/', getAllHeis);
router.post('/submissions', uploadSubmission);
router.get('/submissions', getSubmissions);

module.exports = router;
