import CartService from "./cart.service.js";
import ProductService from "./product.service.js";
import TicketRepository from "../repositories/ticket.repository.js";

const ticketRepo = new TicketRepository();
const productService = new ProductService();

export default class TicketService {
  
  async createTicket(userId) {
    if (!userId) throw new Error("User ID requerido");

    // Obtener carrito
    const cart = await CartService.getCartByUser(userId);
    if (!cart || cart.products.length === 0) {
      throw new Error("Carrito vacío");
    }

    let total = 0;
    const purchasedProducts = [];

    // Validar stock y preparar productos comprados
    for (const item of cart.products) {
      const product = await productService.getProductById(item.product._id);
      if (!product) continue;

      if (product.stock >= item.quantity) {
        purchasedProducts.push({
          product: product._id,
          title: product.title,
          quantity: item.quantity,
          price: product.price,
        });

        product.stock -= item.quantity;
        await product.save();

        total += product.price * item.quantity;
      }
    }

    if (!purchasedProducts.length) {
      throw new Error("No hay stock suficiente");
    }

    // Crear ticket
    const ticketData = {
      code: "TCKT-" + Date.now(),
      purchaser: userId,
      products: purchasedProducts,
      amount: total,
      purchase_datetime: new Date(),
    };

    const ticket = await ticketRepo.create(ticketData);

    // Limpiar carrito
    cart.products = cart.products.filter(
      (item) =>
        !purchasedProducts.some(
          (p) => p.product.toString() === item.product._id.toString()
        )
    );

    // Guardar carrito
    await CartService.clearCart(userId);

    return ticket;
  }

  async getTicketById(ticketId) {
    return await ticketRepo.findById(ticketId);
  }

  static async getTicketsByUser(userId) {
    return await ticketRepo.findByUser(userId);
  }
}
