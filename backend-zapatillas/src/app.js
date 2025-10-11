// app.js
import dotenv from "dotenv";
dotenv.config(); // 🔹 debe ir primero

import express, { application } from "express";
import { create } from "express-handlebars";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import cookieParser from "cookie-parser";
import helpers from "handlebars-helpers";

import { fileURLToPath } from "url";
import { dirname, join } from "path";

import initializePassport from "./config/passport.config.js";

// Routers
import productsRouter from "./routers/products.router.js";
import cartsRouter from "./routers/cart.router.js";
import viewsRouter from "./routers/views.router.js";
import usersRouter from "./routers/users.router.js";
import sessionsRouter from "./routers/sessions.router.js";
import githubViewsRouter from "./routers/github.views.js";
import customUsersRouter from "./routers/customUsers.router.js";
import usersViewsRouter from "./routers/users.views.router.js";
import ticketsRouter from "./routers/tickets.router.js";
import adminRouter from "./routers/admin.router.js";


// 🔹 __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// ======================================================
// 🔹 MIDDLEWARES BASE
// ======================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(join(__dirname, "public"))); // ✅ corregido para ES Modules

// ======================================================
// 🔹 HANDLEBARS CONFIG
// ======================================================
const multihelpers = helpers();

// Helper para multiplicar
multihelpers.multiply = (a, b) => {
  const numA = Number(a) || 0;
  const numB = Number(b) || 0;
  return (numA * numB).toFixed(2);
};

// Helper para calcular total del carrito
multihelpers.calculateTotal = (products) => {
  if (!products || products.length === 0) return "0.00";
  return products.reduce((acc, item) => {
    const price = Number(item.product?.price ?? item.price) || 0;
    const quantity = Number(item.quantity) || 0;
    return acc + price * quantity;
  }, 0).toFixed(2);
};

// Helper para formatear fechas
multihelpers.formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const hbs = create({
  helpers: multihelpers,
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
});


app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", join(__dirname, "views"));

// ======================================================
// 🔹 SESSION CONFIG
// ======================================================
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 180,
    }),
    secret: process.env.SESSION_SECRET || "c0d3rS3cr3t",
    resave: false,
    saveUninitialized: false,
  })
);

// ======================================================
// 🔹 PASSPORT CONFIG
// ======================================================
initializePassport();
app.use(passport.initialize());
app.use(passport.session());

// ======================================================
// 🔹 ROUTERS
// ======================================================
// API
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/users", usersRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/github", githubViewsRouter);
app.use("/api/tickets", ticketsRouter);


// VISTAS
app.use("/", viewsRouter);
app.use("/users", customUsersRouter);
app.use("/", usersViewsRouter);
app.use("/", cartsRouter)
app.use("/tickets", ticketsRouter);
app.use("/profile", ticketsRouter);
app.use("/admin", adminRouter);


// ======================================================
// 🔹 RUTA PRINCIPAL HOME
// ======================================================
app.get("/", (req, res) => {
  res.render("home", { title: "Inicio - Farmacia" });
});

export default app;
