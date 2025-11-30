
import ticketModel from "../models/ticket.model.js";

export default class TicketRepository {
  async create(data) {
    return await ticketModel.create(data);
  }

  async findById(id) {
    return await ticketModel.findById(id).populate("products.product").lean();
  }

  async findByUser(userId) {
    return await ticketModel
      .find({ purchaser: userId })
      .sort({ purchase_datetime: -1 })
      .lean();
  }
}
