
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

import app from "./app.js";
import userModel from "./models/user.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ MONGO_URI no definida");
  process.exit(1);
}

// Crear admin si no existe
const seedAdmin = async () => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return;

  const existingAdmin = await userModel.findOne({ email: ADMIN_EMAIL });
  if (!existingAdmin) {
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

// Inicializar MongoDB (una sola vez)
let dbReady = false;
const initMongo = async () => {
  if (!dbReady) {
    await mongoose.connect(MONGO_URI);
    dbReady = true;
    console.log("✅ Conectado a MongoDB");
    await seedAdmin();
  }
};

// Handler para Vercel
export default async function handler(req, res) {
  await initMongo();
  return app(req, res);
}
