import mongoose from "mongoose";
import dotenv from "dotenv";
import Language from "./models/Language.js"; // adaptează path-ul

dotenv.config();

const languages = [
  { name: "English", code: "en", icon: "🇬🇧" },
  { name: "French", code: "fr", icon: "🇫🇷" },
  { name: "Spanish", code: "es", icon: "🇪🇸" },
  { name: "German", code: "de", icon: "🇩🇪" },
  { name: "Italian", code: "it", icon: "🇮🇹" },
  { name: "Japanese", code: "ja", icon: "🇯🇵" },
  { name: "Chinese", code: "zh", icon: "🇨🇳" },
  { name: "Romanian", code: "ro", icon: "🇷🇴" },
];

async function seedLanguages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectat la MongoDB");
    await Language.deleteMany(); // curăță colecția înainte (opțional)
    const result = await Language.insertMany(languages);
    console.log("✅ Limbile au fost inserate cu succes:", result);
    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Eroare la inserare:", err);
    mongoose.disconnect();
  }
}

seedLanguages();
