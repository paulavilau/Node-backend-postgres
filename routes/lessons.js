import express from "express";
import { db } from "../server.js";

const router = express.Router();

// GET /api/user-languages/:userId
router.get("/user-languages", async (req, res) => {
  const userId = req.user.id;
  console.log(userId);

  try {
    const result = await db.query(
      `
      SELECT 
        l.id,
        l.name,
        l.icon,
        l.code,
        COUNT(DISTINCT up.completed_at) FILTER (WHERE up.completed_at IS NOT NULL) AS completed_lessons,
        (SELECT COUNT(*) FROM lessons les WHERE les.language_id = l.id) AS total_lessons
      FROM user_progress up
      JOIN lessons les ON up.lesson_id = les.id
      JOIN languages l ON les.language_id = l.id
      WHERE up.user_id = $1
      GROUP BY l.id, l.name, l.icon;
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Eroare la extragerea limbilor:", err);
    res.status(500).json({ message: "Eroare la server." });
  }
});

router.get("/lessons/:languageId", async (req, res) => {
  const userId = req.user.id;
  const { languageId } = req.params;

  try {
    const result = await db.query(
      `
    SELECT 
      l.id AS lesson_id,
      l.title,
      l.order_index,
      CASE 
        WHEN l.order_index = 1 THEN true -- prima lecție e întotdeauna deblocată
        WHEN EXISTS (
          SELECT 1
          FROM user_progress up_prev
          JOIN lessons l_prev ON l_prev.id = up_prev.lesson_id
          WHERE up_prev.user_id = $1
            AND l_prev.language_id = $2
            AND l_prev.order_index = l.order_index - 1
            AND up_prev.completed_at IS NOT NULL
        ) THEN true
        ELSE false
      END AS is_unlocked,
      CASE 
        WHEN up.completed_at IS NOT NULL THEN 'completed'
        WHEN up.started_at IS NOT NULL THEN 'in_progress'
        ELSE 'not_started'
      END AS status
    FROM lessons l
    LEFT JOIN user_progress up 
      ON up.lesson_id = l.id AND up.user_id = $1
    WHERE l.language_id = $2
    ORDER BY l.order_index;

      `,
      [userId, languageId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Eroare la aducerea lecțiilor:", err);
    res.status(500).json({ message: "Eroare server." });
  }
});

router.get("/lesson-details/:lessonId", async (req, res) => {
  const { lessonId } = req.params;

  try {
    const result = await db.query(
      `
      SELECT 
        l.id AS lesson_id,
        l.language_id,
        l.title,
        l.description,
        l.objectives,
        l.image_url,
        l.order_index,
        json_agg(
          json_build_object(
            'id', lc.id,
            'text', lc.text,
            'en', lc.en,
            'ro', lc.ro,
            'audio_url', lc.audio_url,
            'order_index', lc.order_index
          )
          ORDER BY lc.order_index
        ) AS content
      FROM lessons l
      LEFT JOIN lesson_content lc ON l.id = lc.lesson_id
      WHERE l.id = $1
      GROUP BY l.id;
      `,
      [lessonId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Lecție inexistentă." });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Eroare la lesson-details:", err);
    res.status(500).json({ message: "Eroare server." });
  }
});

router.post("/lesson-progress", async (req, res) => {
  const { lessonId, status } = req.body;
  const userId = req.user.id;

  try {
    // Cautam sa vedem daca userul are deja un progres pentru aceasta lectie
    const existingProgress = await db.query(
      `
      SELECT * FROM user_progress 
      WHERE user_id = $1 AND lesson_id = $2;
      `,
      [userId, lessonId]
    );

    // Daca exista, actualizam progresul
    if (existingProgress.rows.length > 0) {
      const query = `
        UPDATE user_progress 
        SET ${status === "completed" ? "completed_at" : "started_at"} = NOW()
        WHERE user_id = $1 AND lesson_id = $2;
      `;
      await db.query(query, [userId, lessonId]);
    } else {
      // Daca nu exista, inseram un nou progres
      const query = `
        INSERT INTO user_progress (user_id, lesson_id, ${
          status === "completed" ? "completed_at" : "started_at"
        })
        VALUES ($1, $2, NOW())
      `;
      await db.query(query, [userId, lessonId]);
    }
    res.status(200).json({ message: "Progres salvat." });
  } catch (err) {
    console.error("Eroare la salvarea progresului:", err);
    res.status(500).json({ message: "Eroare server." });
  }
});

router.get("/last-lesson", async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await db.query(
      `
      SELECT 
        l.id AS lesson_id,
        l.title,
        l.order_index,
        l.language_id,
        lang.code AS language_code,
        lang.icon AS language_icon
      FROM user_progress up
      JOIN lessons l ON up.lesson_id = l.id
      JOIN languages lang ON l.language_id = lang.id
      WHERE up.user_id = $1 AND up.completed_at IS NULL
      ORDER BY up.started_at DESC
      LIMIT 1;
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json(null); // nu returnăm eroare, doar nimic
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error fetching last lesson:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
