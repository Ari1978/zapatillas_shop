// src/server.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import http from "http";

import app from "./app.js";
import productModel from "./models/product.model.js";
import userModel from "./models/user.model.js";
import { PRIVATE_KEY } from "./utils.js";

dotenv.config();

const PORT = process.env.PORT || 9090;
const MONGO_URI = process.env.MONGO_URI;

// ❌ Detener si no hay URI
if (!MONGO_URI) {
  console.error("❌ MONGO_URI no definida");
  process.exit(1);
}

// ✅ Crear admin si no existe
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

// ✅ Inicializa Mongo una sola vez
let dbReady = false;
const initMongo = async () => {
  if (!dbReady) {
    await mongoose.connect(MONGO_URI);
    dbReady = true;
    console.log("✅ Conectado a MongoDB");
    await seedAdmin();
  }
};

// ======================================================
// 🔹 Configuración HTTP y Socket.io
// ======================================================
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// Middleware JWT para sockets
io.use((socket, next) => {
  let token = socket.handshake.auth?.token;

  if (!token && socket.handshake.headers.cookie) {
    const cookies = Object.fromEntries(
      socket.handshake.headers.cookie
        .split(";")
        .map(c => c.trim().split("="))
    );
    token = cookies.jwtCookieToken;
  }

  if (!token) return next(new Error("Token no provisto"));

  jwt.verify(token, PRIVATE_KEY, (err, decoded) => {
    if (err) return next(new Error("Token inválido"));
    socket.user = decoded.user;
    next();
  });
});

io.on("connection", async (socket) => {
  console.log(`🔌 Cliente conectado: ${socket.id} | Usuario: ${socket.user?.email}`);

  const products = await productModel.find({}).lean();
  socket.emit("productsUpdated", products);

  socket.on("nuevoProducto", async (producto) => {
    await productModel.create(producto);
    io.emit("productsUpdated", await productModel.find({}).lean());
  });

  socket.on("eliminarProducto", async (id) => {
    await productModel.deleteOne({ _id: id });
    io.emit("productsUpdated", await productModel.find({}).lean());
  });
});

// ======================================================
// 🔹 MODO LOCAL
// ======================================================
if (process.env.NODE_ENV !== "production") {
  initMongo().then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Servidor local corriendo en http://localhost:${PORT}`);
    });
  });
}

// ======================================================
// 🔹 EXPORT PARA VERCEL / SERVERLESS
// ======================================================
export default async function handler(req, res) {
  await initMongo();
  return app(req, res);
}
