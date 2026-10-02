const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/authMiddleware.js');
const chatController = require('../controllers/chatController.js');

/**
 * @swagger
 * /chat/message:
 *   post:
 *     summary: Send text or voice message to AI
 *     tags: [Chat]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *               audio:
 *                 type: string
 *                 description: Base64 encoded audio
 *     responses:
 *       200:
 *         description: AI response with text and audio
 *       401:
 *         description: Not authenticated
 */
router.post('/message', isAuth, chatController.sendMessage);

/**
 * @swagger
 * /chat/history:
 *   delete:
 *     summary: Clear chat history
 *     tags: [Chat]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Chat history cleared
 */
router.delete('/history', isAuth, chatController.clearHistory);

/**
 * @swagger
 * /chat/api-keys:
 *   get:
 *     summary: Check if user has API keys
 *     tags: [Chat]
 *     security:
 *       - cookieAuth: []
 *   put:
 *     summary: Update user API keys
 *     tags: [Chat]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groqApiKey:
 *                 type: string
 *               elevenLabsApiKey:
 *                 type: string
 */
router.get('/api-keys', isAuth, chatController.getApiKeys);
router.put('/api-keys', isAuth, chatController.updateApiKeys);
router.get('/voice', isAuth, chatController.getVoice);
router.put('/voice', isAuth, chatController.updateVoice);

module.exports = router;
