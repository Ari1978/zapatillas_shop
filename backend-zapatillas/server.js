import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import userModel from "./src/models/user.model.js";
import productModel from "./src/models/product.model.js";

dotenv.config();

const PORT = process.env.PORT || 9090;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI no definida");
  process.exit(1);
}

// Crear admin
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

// Conexión a Mongo
let dbReady = false;
const initMongo = async () => {
  if (!dbReady) {
    await mongoose.connect(MONGO_URI);
    dbReady = true;
    console.log("✅ Conectado a MongoDB");
    await seedAdmin();
  }
};

// Servidor y Socket.io
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

io.on("connection", async (socket) => {
  console.log(`🔌 Cliente conectado: ${socket.id}`);
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

// Solo local
initMongo().then(() => {
  server.listen(PORT, () => console.log(`🚀 Servidor local en http://localhost:${PORT}`));
});
