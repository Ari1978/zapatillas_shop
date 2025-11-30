
import userModel from "../models/user.model.js";

export default class UserRepository {
  async findAll() {
    return await userModel.find().lean();
  }

  async findById(id) {
    return await userModel.findById(id).lean();
  }

  async findByEmail(email) {
    return await userModel.findOne({ email }).lean();
  }

  async create(data) {
    return await userModel.create(data);
  }

  async update(id, data) {
    return await userModel.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async delete(id) {
    return await userModel.findByIdAndDelete(id);
  }
}
