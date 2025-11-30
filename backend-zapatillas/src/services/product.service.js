import ProductRepository from "../repositories/product.repository.js";

export default class ProductService {
  constructor() {
    this.repo = new ProductRepository();
  }

  // ---------------------------
  // Métodos reales del servicio
  // ---------------------------
  async getAllProducts() {
    return await this.repo.findAll();
  }

  async getProductById(id) {
    return await this.repo.findById(id);
  }

  async createProduct(data) {
    if (!data.code || data.code.trim() === "") {
      data.code = "PROD-" + Date.now();
    }

    if (!data.stock || data.stock < 0) {
      data.stock = 0;
    }

    return await this.repo.create(data);
  }

  async updateProduct(id, data) {
    return await this.repo.update(id, data);
  }

  async deleteProduct(id) {
    return await this.repo.delete(id);
  }

  // ==========================================================
  // 🔥 Métodos que tus TESTS NECESITAN (unitarios)
  // ==========================================================

  calculateTotal(products = []) {
    return products.reduce(
      (acc, p) => acc + Number(p.price) * Number(p.quantity),
      0
    );
  }

  isStockAvailable(stock, needed) {
    return Number(stock) >= Number(needed);
  }
}
