import mongoose from "mongoose";

const UserProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  languageId: {
    type: String,
    required: true,
  },
  completedLessons: [String],
  lastAcces: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model(
  "UserProgress",
  UserProgressSchema,
  "userProgress"
);
