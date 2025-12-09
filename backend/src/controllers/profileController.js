const prisma = require("../config/db.js");

exports.getProfile = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        bondType: true,
        createdAt: true
      }
    });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get profile" });
  }
};
