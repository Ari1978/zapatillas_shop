import ticketModel from "../models/ticket.model.js";
import cartModel from "../models/cart.model.js";
import { v4 as uuidv4 } from "uuid"; 

export class TicketController {
  // Crear ticket
  async createTicket(userId) {
    // Obtener carrito del usuario
    const cart = await cartModel.findOne({ user: userId }).populate("products.product");

    if (!cart || cart.products.length === 0) {
      throw new Error("El carrito está vacío");
    }

    // Calcular total
    const total = cart.products.reduce((sum, item) => {
      const price = Number(item.product?.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + price * quantity;
    }, 0);

    // Preparar datos del ticket
    const ticketData = {
      code: uuidv4(),
      purchaser: userId,
      amount: total.toFixed(2),
      products: cart.products.map(p => ({
        product: p.product._id,
        quantity: p.quantity,
        price: p.product.price
      }))
    };

    // Crear ticket en DB
    const ticket = await ticketModel.create(ticketData);

    // Vaciar carrito
    cart.products = [];
    await cart.save();

    return ticket;
  }

  // Obtener ticket por ID
  async getTicketById(ticketId) {
    const ticket = await ticketModel.findById(ticketId).populate("products.product");

    if (!ticket) {
      throw new Error("Ticket no encontrado");
    }

    return ticket;
  }
}
