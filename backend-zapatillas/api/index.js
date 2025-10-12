import app from "../app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import serverless from "serverless-http";

dotenv.config();

let conn = null;

const seedAdmin = async () => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return;

  const existing = await userModel.findOne({ email: ADMIN_EMAIL });
  if (!existing) {
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await userModel.create({
      first_name: "Admin",
      last_name: "Master",
      email: ADMIN_EMAIL,
      age: 30,
      password: hashed,
      role: "admin",
    });
    console.log("✅ Admin creado automáticamente");
  }
};

export default async function handler(req, res) {
  if (!conn) {
    conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB");
    await seedAdmin();
  }

  const handle = serverless(app);
  return handle(req, res);
}
