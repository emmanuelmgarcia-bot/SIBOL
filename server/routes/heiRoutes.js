const express = require('express');
const { getAllHeis } = require('../controllers/heiController');
const router = express.Router();

router.get('/', getAllHeis);

module.exports = router;