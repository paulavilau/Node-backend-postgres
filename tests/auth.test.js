import request from "supertest";
import app from "../server.js";

describe("Auth Endpoints", () => {
  it("ar trebui să facă login corect și să returneze un token", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "testuser@example.com", // userul creat automat
      password: "testpassword123",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body.token).not.toBeNull();
    expect(typeof response.body.token).toBe("string");
  });

  it("ar trebui să dea eroare la login greșit", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "testuser@example.com",
      password: "gresit123",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toMatch(/Parolă greșită/i);
  });
});
