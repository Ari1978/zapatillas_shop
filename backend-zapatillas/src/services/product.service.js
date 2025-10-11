// src/services/product.service.js
import productModel from "../models/product.model.js";

export default class ProductService {
  async getAllProducts() {
    return await productModel.find();
  }

  async getProductById(id) {
    return await productModel.findById(id);
  }

  async createProduct(data) {
    // ✅ Validar y generar código único si no viene
    if (!data.code || data.code.trim() === "") {
      data.code = "PROD-" + Date.now(); // genera uno único
    }

    // ✅ Validar stock
    if (data.stock == null || data.stock < 0) {
      data.stock = 0; // por seguridad
    }

    // ✅ Crear el producto
    const product = await productModel.create(data);
    return product;
  }

  async updateProduct(id, data) {
    return await productModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteProduct(id) {
    return await productModel.findByIdAndDelete(id);
  }
}
