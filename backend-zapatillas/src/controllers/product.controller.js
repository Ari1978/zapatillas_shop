
import ProductService from "../services/product.service.js";
import { logger } from "../config/logger.js";

export class ProductController {
  static async getProducts(req, res) {
    try {
      logger.debug("Solicitando lista de productos");
      const products = await ProductService.getAllProducts();
      logger.info(`Productos encontrados: ${products.length}`);
      res.json({ status: "Success", payload: products });
    } catch (error) {
      logger.error("Error obteniendo productos: " + error.message);
      res.status(500).json({ status: "Error", message: error.message });
    }
  }

  static async getProductById(req, res) {
    try {
      const { id } = req.params;
      logger.debug(`Buscando producto con ID ${id}`);
      const product = await ProductService.getProductById(id);

      if (!product) {
        logger.warning(`Producto no encontrado: ${id}`);
        return res.status(404).json({ status: "Error", message: "Producto no encontrado" });
      }

      logger.info(`Producto encontrado: ${product._id}`);
      res.json({ status: "Success", payload: product });
    } catch (error) {
      logger.error("Error al obtener producto: " + error.message);
      res.status(500).json({ status: "Error", message: error.message });
    }
  }

  static async createProduct(req, res) {
    try {
      logger.debug("Creando nuevo producto");
      const product = await ProductService.createProduct(req.body);
      logger.info(`Producto creado: ${product._id}`);
      res.status(201).json({ status: "Success", payload: product });
    } catch (error) {
      logger.error("Error creando producto: " + error.message);
      res.status(500).json({ status: "Error", message: error.message });
    }
  }

  static async updateProduct(req, res) {
    try {
      const { id } = req.params;
      logger.debug(`Actualizando producto ${id}`);
      const updatedProduct = await ProductService.updateProduct(id, req.body);
      logger.info(`Producto actualizado: ${id}`);
      res.json({ status: "Success", payload: updatedProduct });
    } catch (error) {
      logger.error("Error actualizando producto: " + error.message);
      res.status(500).json({ status: "Error", message: error.message });
    }
  }

  static async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      logger.warning(`Eliminando producto ${id}`);
      await ProductService.deleteProduct(id);
      res.json({ status: "Success", message: "Producto eliminado" });
    } catch (error) {
      logger.error("Error eliminando producto: " + error.message);
      res.status(500).json({ status: "Error", message: error.message });
    }
  }
}
