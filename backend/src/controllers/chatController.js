const prisma = require("../config/db.js");
const deepgramService = require("../services/deepgramService.js");
const groqService = require("../services/groqService.js");

exports.sendMessage = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { text, audio } = req.body;

    if (!text && !audio) {
      return res.status(400).json({ error: "Either text or audio is required" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    let userMessage = text;

    if (audio && !text) {
      const audioBuffer = Buffer.from(audio, "base64");
      userMessage = await deepgramService.speechToText(audioBuffer, user.deepgramApiKey);
    }

    await prisma.conversation.create({
      data: { userId, role: "user", content: userMessage }
    });

    const history = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      take: 10
    });

    const messages = history.map(h => ({ role: h.role, content: h.content }));
    const aiResponse = await groqService.getAIResponse(messages, user.bondType, user.groqApiKey);

    await prisma.conversation.create({
      data: { userId, role: "assistant", content: aiResponse }
    });

    const audioResponse = await deepgramService.textToSpeech(aiResponse, user.deepgramApiKey);

    res.json({
      text: aiResponse,
      audio: audioResponse.toString("base64")
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process message" });
  }
};

exports.updateBondType = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { bondType } = req.body;

    await prisma.user.update({
      where: { id: userId },
      data: { bondType }
    });

    res.json({ message: "Bond type updated", bondType });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update bond type" });
  }
};

exports.getBondType = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { bondType: true }
    });

    res.json({ bondType: user.bondType });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get bond type" });
  }
};

exports.updateApiKeys = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { groqApiKey, deepgramApiKey } = req.body;

    await prisma.user.update({
      where: { id: userId },
      data: { groqApiKey, deepgramApiKey }
    });

    res.json({ message: "API keys updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update API keys" });
  }
};

exports.getApiKeys = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { groqApiKey: true, deepgramApiKey: true }
    });

    res.json({
      hasGroqKey: !!user.groqApiKey,
      hasDeepgramKey: !!user.deepgramApiKey
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get API keys" });
  }
};

exports.clearHistory = async (req, res) => {
  try {
    const userId = req.session.user.id;
    await prisma.conversation.deleteMany({ where: { userId } });
    res.json({ message: "Chat history cleared" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to clear history" });
  }
};
