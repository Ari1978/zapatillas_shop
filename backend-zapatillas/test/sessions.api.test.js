import express from "express";
import request from "supertest";
import { expect } from "chai";

const app = express();
app.use(express.json());

// Ruta de login simulada
app.post("/api/sessions/login", (req, res) => {
  const { email, password } = req.body;

  if (email === "test@test.com" && password === "123456") {
    return res.status(200).json({
      status: "success",
      user: { email, role: "user" },
    });
  }

  return res.status(401).json({
    status: "error",
    message: "Credenciales incorrectas",
  });
});

describe("TEST LOGIN /api/sessions/login", () => {
  
  it("debería loguear correctamente", async () => {
    const res = await request(app)
      .post("/api/sessions/login")
      .send({ email: "test@test.com", password: "123456" });

    expect(res.status).to.equal(200);
    expect(res.body.status).to.equal("success");
  });

  it("no debería permitir login incorrecto", async () => {
    const res = await request(app)
      .post("/api/sessions/login")
      .send({ email: "test@test.com", password: "0000" });

    expect(res.status).to.equal(401);
  });
});
