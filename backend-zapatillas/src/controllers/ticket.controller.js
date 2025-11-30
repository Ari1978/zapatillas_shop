import ticketModel from "../models/ticket.model.js";
import cartModel from "../models/cart.model.js";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../config/logger.js";

export class TicketController {
  async createTicket(userId) {
    logger.debug(`Creando ticket para usuario ${userId}`);

    const cart = await cartModel.findOne({ user: userId }).populate("products.product");

    if (!cart || cart.products.length === 0) {
      logger.warning(`Carrito vacío para usuario ${userId}`);
      throw new Error("El carrito está vacío");
    }

    const total = cart.products.reduce((sum, item) => {
      const price = Number(item.product?.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + price * quantity;
    }, 0);

    const ticketData = {
      code: uuidv4(),
      purchaser: userId,
      amount: total.toFixed(2),
      products: cart.products.map(p => ({
        product: p.product._id,
        quantity: p.quantity,
        price: p.product.price
      })),
    };

    const ticket = await ticketModel.create(ticketData);
    logger.info(`Ticket creado: ${ticket.code}`);

    cart.products = [];
    await cart.save();

    return ticket;
  }

  async getTicketById(ticketId) {
    logger.debug(`Buscando ticket ${ticketId}`);
    const ticket = await ticketModel.findById(ticketId).populate("products.product");

    if (!ticket) {
      logger.error(`Ticket no encontrado: ${ticketId}`);
      throw new Error("Ticket no encontrado");
    }

    logger.info(`Ticket encontrado: ${ticket.code}`);
    return ticket;
  }
}
