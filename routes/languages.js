import express from "express";
import { db } from "../server.js";

const router = express.Router();

router.get("/all-languages", async (req, res) => {
  db.query("SELECT * FROM languages ORDER BY name", (err, resp) => {
    if (err) {
      console.error("Error executing query", err.stack);
    } else {
      res.json(resp.rows);
    }
  });
});

export default router;
