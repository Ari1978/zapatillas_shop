import { CartService } from "../services/cart.service.js";
import { logger } from "../config/logger.js";

export class CartController {
  static async getCart(req, res) {
    try {
      const userId = req.user._id;
      logger.debug(`Obteniendo carrito de usuario ${userId}`);
      const cart = await CartService.getCartByUser(userId);
      res.json({ status: "Success", payload: cart });
    } catch (error) {
      logger.error("Error al obtener carrito: " + error.message);
      res.status(500).json({ status: "Error", message: error.message });
    }
  }

  static async addToCart(req, res) {
    try {
      const userId = req.user._id;
      logger.debug(`Agregando al carrito de usuario ${userId}`);
      const { productId, quantity } = req.body;

      if (!productId || !quantity) {
        logger.warning("Faltan datos para agregar al carrito");
        return res.status(400).json({ status: "Error", message: "Faltan datos" });
      }

      const updatedCart = await CartService.addProductToCart(userId, productId, quantity);
      logger.info(`Producto ${productId} agregado`);
      res.json({ status: "Success", payload: updatedCart });
    } catch (error) {
      logger.error("Error al agregar producto al carrito: " + error.message);
      res.status(500).json({ status: "Error", message: error.message });
    }
  }

  static async removeFromCart(req, res) {
    try {
      const userId = req.user._id;
      logger.debug(`Quitando producto del carrito de ${userId}`);
      const { productId } = req.body;

      const updatedCart = await CartService.removeProductFromCart(userId, productId);
      logger.info(`Producto eliminado: ${productId}`);
      res.json({ status: "Success", payload: updatedCart });
    } catch (error) {
      logger.error("Error al remover producto: " + error.message);
      res.status(500).json({ status: "Error", message: error.message });
    }
  }

  static async clearCart(req, res) {
    try {
      const userId = req.user._id;
      logger.warning(`Vaciando carrito de usuario ${userId}`);
      const clearedCart = await CartService.clearCart(userId);
      res.json({ status: "Success", payload: clearedCart });
    } catch (error) {
      logger.error("Error al limpiar carrito: " + error.message);
      res.status(500).json({ status: "Error", message: error.message });
    }
  }
}
