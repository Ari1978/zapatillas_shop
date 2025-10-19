import { Router } from "express";
import passport from "passport";
import { generateJWToken } from "../utils.js";

const router = Router();

// --- REGISTER ---
router.post(
  "/register",
  passport.authenticate("register", { failureRedirect: "/api/sessions/fail-register", failureMessage: true }),
  (req, res) => {
    const user = req.user;
    const token = generateJWToken(user);

    res.cookie("jwtCookieToken", token, { httpOnly: true, maxAge: 2 * 60 * 60 * 1000 });
    res.status(201).json({
      status: "success",
      message: "Usuario registrado correctamente",
      redirect: "/vistas/shop"
    });
  }
);

// --- LOGIN ---
router.post("/login", (req, res, next) => {
  passport.authenticate("login", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ status: "error", message: info?.message || "Credenciales incorrectas" });

    req.session.user = {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role
    };
    const token = generateJWToken(user);
    res.cookie("jwtCookieToken", token, { httpOnly: true, maxAge: 2 * 60 * 60 * 1000 });

    const redirectUrl = user.role === "admin" ? "/vistas/adminPanel" : "/vistas/shop";
    return res.json({ status: "success", redirect: redirectUrl });
  })(req, res, next);
});

// --- LOGOUT ---
router.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send({ error: "Error al cerrar sesión" });
    res.clearCookie("jwtCookieToken");
    return res.redirect("/vistas/home");
  });
});

// --- FAILS ---
router.get("/fail-login", (req, res) => res.status(401).send({ error: "Login fallido" }));
router.get("/fail-register", (req, res) => res.status(401).send({ error: "Registro fallido" }));

export default router;
