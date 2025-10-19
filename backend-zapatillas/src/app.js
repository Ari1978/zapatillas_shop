import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { create } from "express-handlebars";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import cookieParser from "cookie-parser";
import helpers from "handlebars-helpers";
import { fileURLToPath } from "url";
import { dirname } from "path";

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// --- Middlewares base ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(__dirname + "/public"));

// --- Handlebars helpers ---
const multihelpers = helpers();
multihelpers.multiply = (a, b) => (Number(a) * Number(b) || 0).toFixed(2);
multihelpers.calculateTotal = (products) =>
  (products?.reduce(
    (acc, item) =>
      acc +
      (Number(item.product?.price ?? item.price) * Number(item.quantity || 0)),
    0
  ) || 0).toFixed(2);
multihelpers.formatDate = (dateStr) =>
  dateStr
    ? new Date(dateStr).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

const hbs = create({
  helpers: multihelpers,
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");

// --- Session + Passport ---
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 180, // minutos
    }),
    secret: process.env.SESSION_SECRET || "c0d3rS3cr3t",
    resave: false,
    saveUninitialized: false,
  })
);

initializePassport();
app.use(passport.initialize());
app.use(passport.session());

// --- Routers API ---
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/users", usersRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/github", githubViewsRouter);
app.use("/api/tickets", ticketsRouter);

// --- Routers de vistas ---
app.use("/vistas", viewsRouter);
app.use("/users", customUsersRouter);
app.use("/views/users", usersViewsRouter);
app.use("/carts", cartsRouter);
app.use("/tickets", ticketsRouter);
app.use("/admin", adminRouter);


export default app;
