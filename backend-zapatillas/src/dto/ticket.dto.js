export class TicketDTO {
  constructor(ticket) {
    this.id = ticket._id;
    this.code = ticket.code;
    this.purchase_datetime = ticket.purchase_datetime;
    this.amount = ticket.amount;
    this.purchaser = ticket.purchaser; // email o id del usuario
    this.products = ticket.products.map(p => ({
      productId: p.product._id,
      title: p.product.title,
      quantity: p.quantity,
      price: p.product.price
    }));
  }
}

