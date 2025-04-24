// Importare librarii necesare
import express from "express";
import cors from "cors";
import pg from "pg";
import dotenv from "dotenv";

// Importarea rutelor ---------------------------------------------
import authRoutes from "./routes/auth.js";
import lessonsRoutes from "./routes/languages.js";
import userProgressRoutes from "./routes/lessons.js";
import exercisesRoutes from "./routes/exercises.js";
import ttsRouter from "./routes/ttsRouter.js";
import speechRouter from "./routes/speechRouter.js";

// Importarea middleware-ului de autentificare
import { authenticateToken } from "./middleware/auth.js";
// ----------------------------------------------------------------

// Incarcare variabile din .env
dotenv.config();
const PORT = process.env.PORT || 5000;

// Initializare server Express
const app = express();

// Adaugare middleware-uri
app.use(cors());
app.use(express.json()); // Permite procesarea body-ului in format JSON

// Configureaza rutele ---------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/lessons", lessonsRoutes);
app.use("/api/user-progress", authenticateToken, userProgressRoutes);
app.use("/api/exercises", authenticateToken, exercisesRoutes);
app.use("/api", ttsRouter);
app.use("/tts", express.static("public/tts"));
app.use("/api", speechRouter);
// ----------------------------------------------------------------

export const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "ml-lang",
  password: "test",
  port: 5432,
});

export default app;

db.connect()
  .then(() => {
    console.log("✅ Connected to PostgreSQL");

    if (process.env.NODE_ENV !== "test") {
      app.listen(process.env.PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
      });
    }
  })
  .catch((err) => {
    console.error("❌ Failed to connect to DB", err);
  });

// Definire ruta basic pentru testare
app.get("/", (req, res) => {
  res.send("Serverul rulează și s-a conectat la PostgreSQL!");
});
