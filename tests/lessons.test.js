import request from "supertest";
import app from "../server.js";
import { getToken } from "./setupTests.js";

describe("Lessons Endpoints", () => {
  it("should return lessons for a certain language", async () => {
    const token = getToken();

    const response = await request(app)
      .get("/api/user-progress/lessons/1") // limbaj ID = 1 (English)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);

    const lesson = response.body[0];
    expect(lesson).toHaveProperty("lesson_id");
    expect(lesson).toHaveProperty("title");
    expect(lesson).toHaveProperty("order_index");
    expect(lesson).toHaveProperty("status");
  });
});
