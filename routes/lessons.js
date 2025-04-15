import express from "express";
import Language from "../models/Language.js";

const router = express.Router();

router.get("/all-languages", async (req, res) => {
  try {
    const languages = await Language.find();
    res.json(languages);
  } catch (err) {
    res.status(500).json({ message: "Eroare la server", error: err.message });
  }
});

export default router;
