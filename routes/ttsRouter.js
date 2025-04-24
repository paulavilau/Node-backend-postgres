import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { db } from "../server.js";
import { v4 as uuidv4 } from "uuid";

dotenv.config();
const router = express.Router();

router.post("/tts", async (req, res) => {
  const { text, language, contentId } = req.body;

  const voiceId = {
    es: "EXAVITQu4vr4xnSDxMaL",
    fr: "TxGEqnHWrfWFTfGW9XjX",
    en: "ErXwobaYiN019PkySvjV",
  }[language];

  if (!voiceId) {
    return res.status(400).json({ error: "Unsupported language" });
  }

  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: "eleven_multilingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      },
      {
        headers: {
          "xi-api-key": process.env.ELEVEN_API_KEY,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    );

    const filename = `${uuidv4()}.mp3`;
    const filepath = path.join("public", "tts", filename);
    fs.writeFileSync(filepath, response.data);

    const relativeUrl = `${filename}`;

    await db.query(`UPDATE lesson_content SET audio_url = $1 WHERE id = $2`, [
      relativeUrl,
      contentId,
    ]);

    res.json({ audioUrl: "tts/" + relativeUrl });
  } catch (err) {
    console.error("TTS error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to generate speech" });
  }
});

export default router;
