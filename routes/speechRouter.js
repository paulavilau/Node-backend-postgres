import express from "express";
import fs from "fs";
import path from "path";
import formidable from "formidable";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

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
    const referenceText = fields.referenceText;

    if (!file || !file.filepath || !referenceText) {
      return res.status(400).json({ error: "Audio file sau text lipsă." });
    }

    try {
      const audioBuffer = fs.readFileSync(file.filepath);

      const pronunciationAssessmentConfig = {
        referenceText: referenceText,
        gradingSystem: "HundredMark",
        granularity: "Phoneme",
        dimension: "Comprehensive",
      };

      const response = await axios.post(
        `https://${process.env.AZURE_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=es-ES`,
        audioBuffer,
        {
          headers: {
            "Ocp-Apim-Subscription-Key": process.env.AZURE_SPEECH_KEY,
            "Content-Type": "audio/mpeg",
            "Pronunciation-Assessment": JSON.stringify(
              pronunciationAssessmentConfig
            ),
          },
        }
      );

      const result = response.data;
      console.log("✅ Răspuns evaluare:", result);

      res.json({
        recognizedText: result.DisplayText || "N/A",
        pronunciationScore: result.NBest?.[0]?.PronunciationAssessment || null,
      });
    } catch (err) {
      console.error("🧨 Azure error:", err.response?.data || err.message);
      res.status(500).json({ error: "Speech assessment failed" });
    } finally {
      fs.unlink(file.filepath, (err) => {
        if (err) console.warn("⚠️ Nu am putut șterge fișierul:", err.message);
        else console.log("🗑️ Fișier temporar șters:", file.filepath);
      });
    }
  });
});

router.post("/test-pronunciation", async (req, res) => {
  const form = formidable({
    multiples: false,
    uploadDir: path.resolve("uploads"),
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ error: "Upload failed", err });

    const file = Array.isArray(files.audio) ? files.audio[0] : files.audio;
    const referenceText = "Hello, how are you?";

    if (!file || !file.filepath) {
      return res.status(400).json({ error: "No valid audio file uploaded" });
    }

    try {
      const audioBuffer = fs.readFileSync(file.filepath);

      const config = {
        referenceText,
        gradingSystem: "HundredMark",
        granularity: "Phoneme",
        dimension: "Comprehensive",
        enableMiscue: true,
      };

      const response = await axios.post(
        `https://${process.env.AZURE_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US`,
        audioBuffer,
        {
          headers: {
            "Ocp-Apim-Subscription-Key": process.env.AZURE_SPEECH_KEY,
            "Content-Type": "audio/wav",
            "Pronunciation-Assessment": JSON.stringify(config),
          },
        }
      );

      res.json(response.data);
    } catch (error) {
      console.error("🧨 Azure error:", error.response?.data || error.message);
      res.status(500).json({ error: "Pronunciation assessment failed" });
    } finally {
      fs.unlink(file.filepath, () => {});
    }
  });
});

export default router;
