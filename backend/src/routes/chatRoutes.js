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
 *                 description: Text message (use this OR audio)
 *               audio:
 *                 type: string
 *                 description: Base64 encoded audio (use this OR text)
 *     responses:
 *       200:
 *         description: AI response with text and audio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 text:
 *                   type: string
 *                 audio:
 *                   type: string
 *                   description: Base64 encoded audio
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Failed to process message
 */
router.post('/message', isAuth, chatController.sendMessage);

/**
 * @swagger
 * /chat/bond:
 *   get:
 *     summary: Get current bond type
 *     tags: [Chat]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current bond type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bondType:
 *                   type: string
 *       401:
 *         description: Not authenticated
 *   put:
 *     summary: Update bond type
 *     tags: [Chat]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bondType
 *             properties:
 *               bondType:
 *                 type: string
 *                 enum: [Mother, Father, Sister, Brother, Grandmother, Grandfather, Aunt, Uncle, Cousin, Godparent, Mentor, Like a sister, Like a brother, Girlfriend, Boyfriend, Partner, Significant Other, Wife, Husband, Fiancé, Fiancée, Best Friend, Close Friend, Confidant, Companion, Neighbor, Teammate, Colleague, Coworker]
 *     responses:
 *       200:
 *         description: Bond type updated
 *       401:
 *         description: Not authenticated
 */
router.put('/bond', isAuth, chatController.updateBondType);
router.get('/bond', isAuth, chatController.getBondType);

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
 *       401:
 *         description: Not authenticated
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
 *     responses:
 *       200:
 *         description: API keys status
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
 *               deepgramApiKey:
 *                 type: string
 *     responses:
 *       200:
 *         description: API keys updated
 */
router.get('/api-keys', isAuth, chatController.getApiKeys);
router.put('/api-keys', isAuth, chatController.updateApiKeys);

module.exports = router;
