import { fileURLToPath } from "url";
import { dirname } from "path";
import multer from "multer";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import dotenv from "dotenv";

// Cargar variables de entorno lo antes posible
dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export default __dirname;

// --- Hash de contraseña ---
export const createHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(10));
export const isValidPassword = (user, passwordClient) =>
  user?.password ? bcrypt.compareSync(passwordClient.toString(), user.password.toString()) : false;

// --- Multer ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, `${__dirname}/public/img`),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});
export const uploader = multer({ storage });

// --- JWT ---
export const PRIVATE_KEY = process.env.PRIVATE_KEY;

// --- Generar JWT ---
export const generateJWToken = (user) =>
  jwt.sign(
    {
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role || "user"
      }
    },
    PRIVATE_KEY,
    { expiresIn: "2h" }
  );

// --- Middleware: validar JWT desde cookie ---
export const authRequired = (req, res, next) => {
  try {
    // Mostrar cookies recibidas
    console.log("Cookies recibidas:", req.cookies);

    const token = req.cookies?.jwtCookieToken; // nombre exacto de tu cookie JWT
    if (!token) {
      console.log("No se encontró cookie JWT");
      return res.status(400).json({ status: "Error", message: "Usuario no logueado" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, PRIVATE_KEY);
    } catch (err) {
      console.log("Error verificando JWT:", err.message);
      return res.status(400).json({ status: "Error", message: "Token inválido o expirado" });
    }

    if (!decoded || !decoded.user) {
      console.log("JWT válido pero sin usuario");
      return res.status(400).json({ status: "Error", message: "Usuario no logueado" });
    }

    req.user = decoded.user; // asigna usuario a req
    console.log("Usuario autenticado:", req.user);
    next();
  } catch (err) {
    console.log("Error inesperado en authRequired:", err);
    res.status(500).json({ status: "Error", message: "Error de autenticación" });
  }
};

// --- Middleware JWT por header ---
export const authToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send({ error: "Token no provisto" });
  const token = authHeader.split(" ")[1];
  jwt.verify(token, PRIVATE_KEY, (err, credentials) => {
    if (err) return res.status(403).send({ error: "Token inválido" });
    req.user = credentials.user;
    next();
  });
};

// --- Passport ---
export const passportCall = (strategy) => (req, res, next) =>
  passport.authenticate(strategy, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).send({ error: info?.message || "No autenticado" });
    req.user = user;
    next();
  })(req, res, next);

// --- Autorización por roles ---
export const authorization = (roles = []) => (req, res, next) => {
  if (!req.user) return res.status(401).send({ error: "Usuario no encontrado en JWT" });
  if (!roles.includes(req.user.role)) return res.status(403).send({ error: "No tiene permisos para esta acción" });
  next();
};

// --- Middleware para admin ---
export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).send("Acceso denegado: Solo administradores");
  }
  next();
};


// --- Redirección si no está autenticado ---
export function isAuthenticated(req, res, next) {
  const token = req.cookies?.jwtCookieToken;
  if (token) {
    try {
      const decoded = jwt.verify(token, PRIVATE_KEY);
      req.user = decoded.user;
      return next();
    } catch {
      return res.redirect("/login");
    }
  }
  res.redirect("/login");
}
