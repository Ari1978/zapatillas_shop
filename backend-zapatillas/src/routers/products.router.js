import { Router } from "express";
import productModel from "../models/product.model.js";

const router = Router();


//  API JSON - obtener todos los productos
router.get("/", async (req, res) => {
  try {
    const products = await productModel.find({});
    res.json({ success: true, products }); // devolver JSON puro
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// Crear producto
router.post("/", async (req, res) => {
  try {
    const product = await productModel.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// Vista HTML - Handlebars
router.get("/shop", async (req, res) => {
  try {
    const products = await productModel.find({});
    res.render("shop", {
      title: "Tienda",
      user: req.user || null,
      products,
      jwtToken: req.cookies?.jwtCookieToken || "", // si usas JWT
    });
  } catch (err) {
    res.status(500).send("Error al cargar productos");
  }
});

export default router;
