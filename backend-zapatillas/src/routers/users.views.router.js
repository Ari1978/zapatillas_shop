import { Router } from "express";
import { passportCall, authorization } from "../utils.js";

const router = Router();

// Login y Register (solo vistas)
router.get("/login", (req, res) => res.render("login"));
router.get("/register", (req, res) => res.render("register"));

// Panel Admin (solo admin)
router.get("/admin",
  passportCall('jwt'),
  authorization(['admin']),
  (req, res) => {
    res.render("adminPanel", { user: req.user });
  }
);

// Perfil (usuario o admin)
router.get("/profile",
  passportCall('jwt'),
  authorization(['user', 'admin']),
  (req, res) => {
    res.render("profile", { user: req.user });
  }
);

export default router;
