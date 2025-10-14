import { Router } from "express";
import { authRequired } from "../utils.js";
import cartModel from "../models/cart.model.js";
import productModel  from "../models/product.model.js";

const router = Router();

// Obtener carrito del usuario
router.get("/cart", authRequired, async (req, res) => {
  try {
    let cart = await cartModel
      .findOne({ user: req.user.id })
      .populate("products.product")
      .lean();

    if (!cart) {
      cart = { products: [] };
    }

    res.render("cart", {
      title: "Carrito - ZapatillasShop",
      user: req.user,
      cart,
      year: new Date().getFullYear()
    });
  } catch (err) {
    console.error("Error al obtener carrito:", err);
    res.status(500).send("Error del servidor");
  }
});


// Agregar producto al carrito
router.post("/add", authRequired, async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    const product = await productModel.findById(productId);
    if (!product) return res.status(404).json({ status: "error", message: "Producto no encontrado" });
    if (quantity > product.stock) return res.status(400).json({ status: "error", message: "Cantidad supera stock disponible" });

    let cart = await cartModel.findOne({ user: req.user.id });
    if (!cart) cart = await cartModel.create({ user: req.user.id, products: [] });

    const existingProduct = cart.products.find(p => p.product.toString() === productId);
    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }

    await cart.save();
    res.json({ status: "Success", message: "Producto agregado al carrito" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Error al agregar producto" });
  }
});

// Eliminar producto del carrito

router.delete("/remove", authRequired, async (req, res) => {
  const { productId } = req.body;

  if (!productId) return res.status(400).json({ status: "error", message: "Falta el productId" });

  try {
    const cart = await cartModel.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

    // Filtrar el producto a eliminar
    cart.products = cart.products.filter(p => p.product.toString() !== productId);

    await cart.save();
    return res.json({ status: "Success", message: "Producto eliminado correctamente" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: "Error al eliminar el producto" });
  }
});


// Obtener cantidad de productos en el carrito actual
router.get("/current", authRequired, async (req, res) => {
  try {
    const cart = await cartModel.findOne({ user: req.user.id }).populate("products.product");

    if (!cart) return res.json({ status: "Success", count: 0 });

    const count = cart.products.reduce((acc, p) => acc + p.quantity, 0);
    res.json({ status: "Success", count });
  } catch (err) {
    console.error("Error al obtener carrito actual:", err);
    res.status(500).json({ status: "error", message: "Error al obtener carrito" });
  }
});


export default router;
