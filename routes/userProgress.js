import express from "express";
import mongoose from "mongoose";
import UserProgress from "../models/UserProgress.js";

const router = express.Router();

// GET - progresul userului
router.get("/:userId", async (req, res) => {
  const userId = req.params.userId;
  console.log("UserId: ", userId);

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "ID invalid" });
  }

  try {
    const progress = await UserProgress.find({
      userId: userId,
    });
    res.json(progress);
    console.log(progress);
  } catch (err) {
    res.status(500).json({ message: "Eroare la server", error: err.message });
  }
});

export default router;
