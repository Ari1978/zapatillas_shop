export class CartDTO {
  constructor(cart) {
    this.id = cart._id;
    this.user = cart.user; // podría ser solo user id
    this.products = cart.products.map(p => ({
      productId: p.product._id,
      title: p.product.title,
      quantity: p.quantity,
      price: p.product.price
    }));
    this.totalPrice = this.products.reduce((acc, p) => acc + p.quantity * p.price, 0);
  }
}

