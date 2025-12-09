const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/authMiddleware.js');
const historyController = require('../controllers/historyController.js');

router.get('/', isAuth, historyController.getHistory);

module.exports = router;
