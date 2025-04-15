import mongoose from "mongoose";

const LanguageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  icon: {
    type: String,
    default: "🌐",
  },
});

export default mongoose.model("Language", LanguageSchema);
