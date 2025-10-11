// src/controllers/ProductController.js
import ProductService from "../services/product.service.js";

export class ProductController {
  static async getProducts(req, res) {
    try {
      const products = await ProductService.getAllProducts();
      res.json({ status: "Success", payload: products });
    } catch (error) {
      res.status(500).json({ status: "Error", message: error.message });
    }
  }

  static async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await ProductService.getProductById(id);
      if (!product) return res.status(404).json({ status: "Error", message: "Producto no encontrado" });
      res.json({ status: "Success", payload: product });
    } catch (error) {
      res.status(500).json({ status: "Error", message: error.message });
    }
  }

  static async createProduct(req, res) {
    try {
      const product = await ProductService.createProduct(req.body);
      res.status(201).json({ status: "Success", payload: product });
    } catch (error) {
      res.status(500).json({ status: "Error", message: error.message });
    }
  }

  static async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const updatedProduct = await ProductService.updateProduct(id, req.body);
      res.json({ status: "Success", payload: updatedProduct });
    } catch (error) {
      res.status(500).json({ status: "Error", message: error.message });
    }
  }

  static async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      await ProductService.deleteProduct(id);
      res.json({ status: "Success", message: "Producto eliminado" });
    } catch (error) {
      res.status(500).json({ status: "Error", message: error.message });
    }
  }
}

