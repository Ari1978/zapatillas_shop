
import cartModel from "../models/cart.model.js";

export default class CartRepository {
  async findByUser(userId) {
    return await cartModel
      .findOne({ user: userId })
      .populate("products.product")
      .lean();
  }

  async createCart(userId) {
    return await cartModel.create({ user: userId, products: [] });
  }

  async save(cart) {
    return await cartModel.updateOne({ _id: cart._id }, cart);
  }
}
