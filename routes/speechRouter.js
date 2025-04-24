import express from "express";
import fs from "fs";
import path from "path";
import formidable from "formidable";
import axios from "axios";
import dotenv from "dotenv";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";

dotenv.config();
const router = express.Router();

ffmpeg.setFfmpegPath(ffmpegPath);

router.post("/speech-to-text", async (req, res) => {
  const form = formidable({
    multiples: false,
    uploadDir: path.resolve("uploads"),
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("❌ Upload error:", err);
      return res.status(400).json({ error: "Upload failed" });
    }

    const file = Array.isArray(files.audio) ? files.audio[0] : files.audio;
    if (!file || !file.filepath) {
      return res.status(400).json({
        error: "No valid audio file uploaded",
        file,
      });
    }

    const wavPath = file.filepath.replace(path.extname(file.filepath), ".wav");

    try {
      // 🔄 Convert to WAV format (PCM 16kHz mono)
      await new Promise((resolve, reject) => {
        ffmpeg(file.filepath)
          .outputOptions(["-ar 16000", "-ac 1", "-f wav"])
          .toFormat("wav")
          .on("end", resolve)
          .on("error", reject)
          .save(wavPath);
      });

      const wavBuffer = fs.readFileSync(wavPath);

      const response = await axios.post(
        `https://${process.env.AZURE_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=es-ES`,
        wavBuffer,
        {
          headers: {
            "Ocp-Apim-Subscription-Key": process.env.AZURE_SPEECH_KEY,
            "Content-Type": "audio/wav",
          },
        }
      );

      const recognizedText = response.data.DisplayText || "N/A";
      console.log("✅ Transcris:", recognizedText);

      res.json({ text: recognizedText });
    } catch (err) {
      console.error("🧨 Azure error:", err.response?.data || err.message);
      res.status(500).json({ error: "Speech recognition failed" });
    } finally {
      // 🧹 Clean up temp files
      [file.filepath, wavPath].forEach((fp) =>
        fs.unlink(fp, (err) => {
          if (err) console.warn("⚠️ Nu am putut șterge:", fp);
        })
      );
    }
  });
});

export default router;
