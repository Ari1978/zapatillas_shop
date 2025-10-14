
import CartService from "./cart.service.js";
import ProductService from "./product.service.js";
import ticketModel from "../models/ticket.model.js";

const cartService = new CartService();
const productService = new ProductService();

export default class TicketService {
  // Crear un ticket a partir del carrito de un usuario
  async createTicket(userId) {
    if (!userId) throw new Error("User ID es requerido para obtener carrito");

    // Obtener carrito del usuario
    const cart = await cartService.getCartByUser(userId);
    if (!cart || cart.products.length === 0) {
      throw new Error("Carrito vacío, no se puede generar ticket");
    }

    let total = 0;
    const purchasedProducts = [];

    // Preparar productos comprados
    for (const item of cart.products) {
      const product = await productService.getProductById(item.product._id);
      if (!product) continue;

      if (product.stock >= item.quantity) {
        purchasedProducts.push({
          product: product._id,
          title: product.title,
          quantity: item.quantity,
          price: product.price
        });

        product.stock -= item.quantity;
        await product.save();

        total += product.price * item.quantity;
      }
    }

    if (purchasedProducts.length === 0) {
      throw new Error("No hay productos disponibles para la compra");
    }

    // Crear ticket
    const ticketData = {
      code: "TCKT-" + Date.now(),
      purchaser: userId,
      products: purchasedProducts,
      amount: total,
      purchase_datetime: new Date()
    };

    const ticket = await ticketModel.create(ticketData);

    // Limpiar carrito solo de los productos comprados
    cart.products = cart.products.filter(
      item => !purchasedProducts.some(p => p.product.toString() === item.product._id.toString())
    );
    await cart.save();

    return ticket;
  }

  // Obtener ticket por ID
  async getTicketById(ticketId) {
    const ticket = await ticketModel.findById(ticketId).populate("products.product");
    if (!ticket) throw new Error("Ticket no encontrado");
    return ticket;
  }

  // Obtener tickets de un usuario
  static async getTicketsByUser(userId) {
    try {
      return await ticketModel.find({ purchaser: userId }).sort({ purchase_datetime: -1 }).lean();
    } catch (error) {
      console.error("Error obteniendo tickets:", error);
      return [];
    }
  }
}
