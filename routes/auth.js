import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config(); // Incarcare variabile de mediu

const router = express.Router();

// Ruta pentru inregistrare
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Verificam daca un user cu acelasi email exista deja
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email deja folosit" });

    // Genereaza un salt si hash pentru parola ????
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // Crearea utilizator nou
    user = new User({ name, email, password: hashed });
    await user.save();

    // Creare token JWT pentru utilizator
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user: { id: user._id, name, email } });
  } catch (err) {
    res.status(500).json({ message: "Serverul a intampinat o eroare!" + err });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Cautare user dupa email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email gresit" });

    // Verificare parola
    const isMatching = await bcrypt.compare(password, user.password);
    if (!isMatching) return res.status(400).json({ message: "Parola gresita" });

    // Crearea tokenului JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user: { id: user._id, name: user.name, email } });
  } catch (err) {
    res.status(500).json({ message: "Eroare la server! " + err });
  }
});

export default router;
