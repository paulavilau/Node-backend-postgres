// Importare librarii necesare
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Importarea rutelor ---------------------------------------------
import authRoutes from "./routes/auth.js";
import lessonsRoutes from "./routes/lessons.js";
import userProgressRoutes from "./routes/userProgress.js";
// ----------------------------------------------------------------

// Incarcare variabile din .env
dotenv.config();

// Initializare server Express
const app = express();

// Adaugare middleware-uri
app.use(cors());
app.use(express.json()); // Permite procesarea body-ului in format JSON

// Configureaza rutele ---------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/lessons", lessonsRoutes);
app.use("/api/user-progress", userProgressRoutes);
// ----------------------------------------------------------------

// Conectare la baza de date MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Conectat la MongoDB");
    app.listen(process.env.PORT, () =>
      console.log(`Serverul ruleaza pe portul ${process.env.PORT}`)
    );
  })
  .catch((err) => {
    console.log(err);
  });

// Definire ruta basic pentru testare
app.get("/", (req, res) => {
  res.send("Serverul rulează și s-a conectat la MongoDB!");
});
