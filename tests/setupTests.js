import request from "supertest";
import app from "../server.js";
import { db } from "../server.js"; // 🔥 conectăm la DB pentru a face query-uri direct

let token = null;
const testUser = {
  email: "testuser@example.com",
  password: "testpassword123",
  name: "Test User",
};

beforeAll(async () => {
  // 1️⃣ Curățăm orice user cu acest email înainte
  await db.query("DELETE FROM users WHERE email = $1", [testUser.email]);

  // 2️⃣ Creăm user-ul de test
  await request(app).post("/api/auth/register").send({
    name: testUser.name,
    email: testUser.email,
    password: testUser.password,
  });

  // 3️⃣ Logăm user-ul de test pentru token
  const response = await request(app).post("/api/auth/login").send({
    email: testUser.email,
    password: testUser.password,
  });

  token = response.body.token;
});

afterAll(async () => {
  // 🔥 Ștergem user-ul de test după ce terminăm
  await db.query("DELETE FROM users WHERE email = $1", [testUser.email]);
  await db.end(); // Închidem conexiunea la DB
});

export function getToken() {
  return token;
}
