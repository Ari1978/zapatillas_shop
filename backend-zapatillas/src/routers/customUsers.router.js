import { Router } from "express";
import jwt from "jsonwebtoken";
import { PRIVATE_KEY } from "../utils.js";

export default class CustomRouter {
  constructor() {
    this.router = Router();
    this.init(); 
  }

  getRouter() {
    return this.router;
  }

  init() {
    
  }

  // Métodos HTTP
  get(path, policies = ["PUBLIC"], ...callbacks) {
    this.router.get(
      path,
      this.handlePolicies(policies),
      this.applyCallbacks(callbacks)
    );
  }

  post(path, policies = ["PUBLIC"], ...callbacks) {
    this.router.post(
      path,
      this.handlePolicies(policies),
      this.applyCallbacks(callbacks)
    );
  }

  // Middleware de control de roles y JWT
  handlePolicies = (policies) => (req, res, next) => {
    if (policies[0] === "PUBLIC") return next();

    const token = req.cookies?.jwtCookieToken;
    if (!token) return res.status(401).json({ error: "No token" });

    jwt.verify(token, PRIVATE_KEY, (err, decoded) => {
      if (err) return res.status(403).json({ error: "Token inválido" });

      req.user = decoded.user;

      if (!policies.includes(req.user.role.toUpperCase())) {
        return res.status(403).json({ error: "Sin permisos" });
      }

      next();
    });
  };

  applyCallbacks = (callbacks) => callbacks.map((cb) => cb);
}
