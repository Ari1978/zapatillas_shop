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
import adoptionRouter from "./routers/adoption.router.js";

// Seguridad y logs
import { swaggerUi, swaggerSpecs } from "./config/swagger.js";
import { loggerMiddleware } from "./middlewares/logger.middleware.js";
import morganMiddleware from "./config/morgan.js";

import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";

import initializePassport from "./config/passport.config.js";

if (process.env.NODE_ENV === "test") {
  console.log(">>> Test mode: NO mongoose.connect()");
}


// Paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ---------------------------------------------
//  APP
// ---------------------------------------------
const app = express();

console.log(">>> MODE:", process.env.NODE_ENV);

// ---------------------------------------------
//  Seguridad (desactivada en test)
// ---------------------------------------------
app.disable("x-powered-by");

if (process.env.NODE_ENV !== "test") {

  // --- CORS PRIMERO ---
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // --- Permitir preflight global ---
  app.options("*", cors({
    origin: "http://localhost:3000",
    credentials: true,
  }));

  // --- Helmet DESPUÉS DE CORS ---
  app.use(helmet());

  app.use(xss());
  app.use(mongoSanitize());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Demasiadas solicitudes desde esta IP",
  });
  app.use(limiter);

} else {
  // TEST → CORS sin restricciones
  app.use(
    cors({
      origin: "*",
      credentials: true,
    })
  );
}


// ---------------------------------------------
//  Middlewares base
// ---------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(__dirname + "/public"));

// ---------------------------------------------
//  Handlebars helpers
// ---------------------------------------------
const multihelpers = helpers();
multihelpers.multiply = (a, b) =>
  (Number(a) * Number(b) || 0).toFixed(2);

multihelpers.calculateTotal = (products) =>
  (
    products?.reduce(
      (acc, item) =>
        acc +
        (Number(item.product?.price ?? item.price) *
          Number(item.quantity || 0)),
      0
    ) || 0
  ).toFixed(2);

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

// ---------------------------------------------
//  Sessions + Passport (DESACTIVADOS EN TEST)
// ---------------------------------------------
if (process.env.NODE_ENV !== "test") {

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

  initializePassport();
  app.use(passport.initialize());
  app.use(passport.session());

} else {
  // Sesión ficticia para evitar errores en supertest
  app.use((req, res, next) => {
    req.session = {};
    next();
  });
}

// ---------------------------------------------
//  Swagger + Logs
// ---------------------------------------------
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.use(loggerMiddleware);
app.use(morganMiddleware);

// ---------------------------------------------
//  Routers API
// ---------------------------------------------
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/users", usersRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/github", githubViewsRouter);
app.use("/api/tickets", ticketsRouter);
app.use("/api/adoption", adoptionRouter);

// ---------------------------------------------
//  Routers de vistas
// ---------------------------------------------
app.use("/vistas", viewsRouter);
app.use("/users", customUsersRouter);
app.use("/views/users", usersViewsRouter);
app.use("/carts", cartsRouter);
app.use("/tickets", ticketsRouter);
app.use("/admin", adminRouter);

export default app;
