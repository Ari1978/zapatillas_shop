import CartRepository from "../repositories/cart.repository.js";

const repo = new CartRepository();

export default class CartService {

  // Obtener carrito por usuario
  static async getCartByUser(userId) {
    const cart = await repo.findByUser(userId);
    return cart || { products: [] };
  }

  // Calcular total
  static async calculateTotal(userId) {
    const cart = await repo.findByUser(userId);
    if (!cart || !cart.products.length) return 0;

    return cart.products
      .reduce((sum, item) => {
        const price = Number(item.product?.price ?? item.price);
        const quantity = Number(item.quantity ?? 0);
        return sum + price * quantity;
      }, 0)
      .toFixed(2);
  }

  // Crear carrito si no existe
  static async createCart(userId) {
    let cart = await repo.findByUser(userId);
    if (!cart) cart = await repo.createCart(userId);
    return cart;
  }

  // Agregar producto
  static async addProduct(userId, productId, quantity = 1) {
    let cart = await this.createCart(userId);

    const existing = cart.products.find(p => p.product.toString() === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }

    await repo.save(cart);
    return cart;
  }

  // Quitar producto
  static async removeProduct(userId, productId) {
    const cart = await repo.findByUser(userId);
    if (!cart) throw new Error("Carrito no encontrado");

    cart.products = cart.products.filter(
      (p) => p.product.toString() !== productId
    );

    await repo.save(cart);
    return cart;
  }

  // Vaciar carrito
  static async clearCart(userId) {
    const cart = await repo.findByUser(userId);
    if (!cart) throw new Error("Carrito no encontrado");

    cart.products = [];
    await repo.save(cart);
    return cart;
  }
}
