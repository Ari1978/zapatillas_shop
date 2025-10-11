import { CartService } from "../services/cart.service.js";

export class CartController {
  static async getCart(req, res) {
    try {
      const userId = req.user._id;
      const cart = await CartService.getCartByUser(userId);
      res.json({ status: "Success", payload: cart });
    } catch (error) {
      res.status(500).json({ status: "Error", message: error.message });
    }
  }

  static async addToCart(req, res) {
    try {
      const userId = req.user._id;
      const { productId, quantity } = req.body;

      if (!productId || !quantity) return res.status(400).json({ status: "Error", message: "Faltan datos" });

      const updatedCart = await CartService.addProductToCart(userId, productId, quantity);
      res.json({ status: "Success", payload: updatedCart });
    } catch (error) {
      res.status(500).json({ status: "Error", message: error.message });
    }
  }

  static async removeFromCart(req, res) {
    try {
      const userId = req.user._id;
      const { productId } = req.body;
      const updatedCart = await CartService.removeProductFromCart(userId, productId);
      res.json({ status: "Success", payload: updatedCart });
    } catch (error) {
      res.status(500).json({ status: "Error", message: error.message });
    }
  }

  static async clearCart(req, res) {
    try {
      const userId = req.user._id;
      const clearedCart = await CartService.clearCart(userId);
      res.json({ status: "Success", payload: clearedCart });
    } catch (error) {
      res.status(500).json({ status: "Error", message: error.message });
    }
  }
}
