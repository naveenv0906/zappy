const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/authMiddleware.js');
const profileController = require('../controllers/profileController.js');

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Profile]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Not authenticated
 */
router.get('/', isAuth, profileController.getProfile);

module.exports = router;
