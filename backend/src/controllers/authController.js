const prisma = require("../config/db.js");
const bcrypt = require("bcrypt");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hash
      },
      select: { id: true, name: true, email: true }
    });

    res.status(201).json({ message: "✅ User registered", user });
  } catch (err) {
    if (err.code === "P2002") {
      res.status(400).json({ error: "Email already exists" });
    } else {
      console.error(err);
      res.status(500).json({ error: "Something went wrong" });
    }
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user)
    return res.status(401).json({ error: "Invalid email or password" });
  const match = await bcrypt.compare(password, user.password);

  if (!match)
    return res.status(401).json({ error: "Invalid email or password" });

  req.session.user = { id: user.id, email: user.email };

  // ✅ Log the session for debugging
  console.log("Logged-in user session:", req.session);

  res.json({ message: "✅ Login successful" });
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ message: "✅ Logged out" });
  });
};
