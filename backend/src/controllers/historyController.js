const prisma = require("../config/db.js");

exports.getHistory = async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    const conversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    // Group by date and create topics
    const grouped = {};
    conversations.forEach(conv => {
      const date = new Date(conv.createdAt).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(conv);
    });

    const topics = Object.entries(grouped).map(([date, msgs]) => ({
      id: date,
      title: msgs[0].content.substring(0, 50) + '...',
      date,
      messageCount: msgs.length,
      messages: msgs
    }));

    res.json(topics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get history" });
  }
};
