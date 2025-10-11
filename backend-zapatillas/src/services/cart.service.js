// src/services/cart.service.js
import cartModel from "../models/cart.model.js";

export default class CartService {

  // -----------------------
  // MÉTODOS ESTÁTICOS
  // -----------------------

  // Obtener carrito por usuario
  static async getCartByUser(userId) {
    try {
      const cart = await cartModel
        .findOne({ user: userId })
        .populate("products.product")
        .lean();
      return cart || { products: [] };
    } catch (error) {
      console.error("Error obteniendo carrito:", error);
      return { products: [] };
    }
  }

  // Calcular total del carrito
  static async calculateTotal(userId) {
    try {
      const cart = await this.getCartByUser(userId);
      if (!cart.products || cart.products.length === 0) return 0;

      return cart.products.reduce((sum, item) => {
        const price = Number(item.product?.price ?? 0);
        const quantity = Number(item.quantity ?? 0);
        return sum + price * quantity;
      }, 0).toFixed(2);
    } catch (error) {
      console.error("Error calculando total del carrito:", error);
      return 0;
    }
  }

  // Crear carrito si no existe
  static async createCart(userId) {
    let cart = await cartModel.findOne({ user: userId });
    if (!cart) {
      cart = new cartModel({ user: userId, products: [] });
      await cart.save();
    }
    return cart;
  }

  // Agregar producto al carrito
  static async addProduct(userId, productId, quantity = 1) {
    const cart = await this.createCart(userId);
    const productInCart = cart.products.find(p => p.product.toString() === productId);

    if (productInCart) {
      productInCart.quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }

    await cart.save();
    return cart;
  }

  // Quitar producto del carrito
  static async removeProduct(userId, productId) {
    const cart = await this.getCartByUser(userId);
    if (!cart) throw new Error("Carrito no encontrado");

    cart.products = cart.products.filter(p => p.product._id.toString() !== productId);
    await cartModel.updateOne({ _id: cart._id }, cart);
    return cart;
  }

  // Vaciar carrito
  static async clearCart(userId) {
    const cart = await this.getCartByUser(userId);
    if (!cart) throw new Error("Carrito no encontrado");

    cart.products = [];
    await cartModel.updateOne({ _id: cart._id }, cart);
    return cart;
  }
}
