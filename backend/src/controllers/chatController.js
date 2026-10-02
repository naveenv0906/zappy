const prisma = require("../config/db.js");
const elevenLabsService = require("../services/elevenLabsService.js");
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
      userMessage = await elevenLabsService.speechToText(audioBuffer, user.elevenLabsApiKey);
    }

    await prisma.conversation.create({
      data: { userId, role: "user", content: userMessage }
    });

    const history = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 6
    });
    history.reverse();

    const messages = history.map(h => ({ role: h.role, content: h.content }));
    const aiResponse = await groqService.getAIResponse(messages, user.groqApiKey);

    if (!aiResponse || aiResponse.trim() === '') {
      throw new Error('Empty AI response from Groq');
    }

    await prisma.conversation.create({
      data: { userId, role: "assistant", content: aiResponse }
    });

    const audioResponse = await elevenLabsService.textToSpeech(aiResponse, user.elevenLabsApiKey, user.aiVoice);

    res.json({
      text: aiResponse,
      audio: audioResponse ? audioResponse.toString("base64") : ""
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process message" });
  }
};

exports.updateApiKeys = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { groqApiKey, elevenLabsApiKey } = req.body;

    await prisma.user.update({
      where: { id: userId },
      data: { groqApiKey, elevenLabsApiKey }
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
      select: { groqApiKey: true, elevenLabsApiKey: true }
    });

    res.json({
      hasGroqKey: !!user.groqApiKey,
      hasElevenLabsKey: !!user.elevenLabsApiKey
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get API keys" });
  }
};

exports.updateVoice = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { aiVoice } = req.body;

    await prisma.user.update({
      where: { id: userId },
      data: { aiVoice }
    });

    res.json({ message: "Voice updated", aiVoice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update voice" });
  }
};

exports.getVoice = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { aiVoice: true }
    });

    res.json({ aiVoice: user.aiVoice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get voice" });
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
