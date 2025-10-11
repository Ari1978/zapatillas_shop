// api/index.js
import serverless from "serverless-http";
import app from "../src/app.js";
import mongoose from "mongoose";
import userModel from "../src/models/user.model.js";
import bcrypt from "bcrypt";

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

// Seed admin seguro
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
      role: "admin"
    });
    console.log("✅ Admin creado automáticamente");
  }
};

async function connectDB(uri) {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri).then(m => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Conectamos a MongoDB **antes de exportar el handler**
await connectDB(process.env.MONGO_URI);
await seedAdmin();

// Exportamos **una función** compatible con Vercel
export const handler = serverless(app);