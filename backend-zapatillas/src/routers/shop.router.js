import { Router } from "express";
import productModel  from "../models/product.model.js";

const router = Router();

router.get("/shop", async (req, res) => {
  const products = await productModel.find({});
  res.render("shop", {
    title: "Tienda",
    user: req.session.user,
    products
  });
});

export default router;

