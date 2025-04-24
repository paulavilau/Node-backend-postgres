import express from "express";
import { db } from "../server.js";

const router = express.Router();

// Get exercises for a specific lesson
router.get("/:lessonId", async (req, res) => {
  const { lessonId } = req.params;

  try {
    const result = await db.query(
      `
        SELECT id, lesson_id, question, correct_answer, options, type, order_index
        FROM exercises
        WHERE lesson_id = $1
        ORDER BY order_index ASC;
        `,
      [lessonId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Eroare la aducerea exercițiilor:", err);
    res.status(500).json({ message: "Eroare server." });
  }
});

export default router;
