import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import productModel from "../models/product.model.js";
import { PRIVATE_KEY, authorization } from "../utils.js";

const router = Router();

// -------------------------------------------
// Home público - muestra productos sin carrito
// -------------------------------------------
router.get("/", async (req, res) => {
  try {
    const products = await productModel.find().lean();
    res.render("home", {
      title: "ZapatillasShop",
      products,
      user: req.session.user || null,
      year: new Date().getFullYear()
    });
  } catch (err) {
    console.error("Error cargando home:", err);
    res.status(500).send("Error cargando productos");
  }
});

// -------------------------------------------
// Shop - solo para usuarios logueados
// -------------------------------------------
router.get("/shop", async (req, res) => {
  try {
    const products = await productModel.find().lean();
    const user = req.session.user || null;

    // Generar JWT si hay usuario
    let jwtToken = null;
    if (user) {
      jwtToken = jwt.sign({ user }, PRIVATE_KEY, { expiresIn: "2h" });
    }

    res.render("shop", {
      title: "Tienda",
      products,
      user,
      jwtToken,
      year: new Date().getFullYear()
    });
  } catch (err) {
    console.error("Error cargando shop:", err);
    res.status(500).send("Error cargando tienda");
  }
});

// -------------------------------------------
// RealTimeProducts - Admin en tiempo real
// -------------------------------------------
router.get(
  "/realTimeProducts",
  passport.authenticate("jwt", { session: false }),
  authorization(["admin"]),
  async (req, res) => {
    try {
      const products = await productModel.find().lean();
      res.render("realtimeProducts", {
        title: "Productos en Tiempo Real",
        products,
        user: req.user,
        year: new Date().getFullYear()
      });
    } catch (err) {
      res.status(500).send("Error cargando productos");
    }
  }
);


// -------------------------------------------
// Admin Panel
// -------------------------------------------
router.get(
  "/adminPanel",
  passport.authenticate("jwt", { session: false }), // protección con JWT
  authorization(["admin"]), // solo Admin
  async (req, res) => {
    try {
      res.render("adminPanel", {
        title: "Panel de Administración",
        user: req.user,
        year: new Date().getFullYear()
      });
    } catch (err) {
      console.error("Error cargando adminPanel:", err);
      res.status(500).send("Error cargando panel de administración");
    }
  }
);

export default router;
