
import productModel from "../models/product.model.js";

export default class ProductRepository {
  async findAll() {
    return await productModel.find().lean();
  }

  async findById(id) {
    return await productModel.findById(id).lean();
  }

  async create(data) {
    return await productModel.create(data);
  }

  async update(id, data) {
    return await productModel.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async delete(id) {
    return await productModel.findByIdAndDelete(id);
  }
}
