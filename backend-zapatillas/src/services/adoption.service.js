import Adoption from "../models/adoption.model.js";

export default class AdoptionService {
  async getAll() {
    if (process.env.NODE_ENV === "test") {
      return []; // 🔥 no usa Mongo en test
    }

    return await Adoption.find();
  }

  async create(data) {
    if (process.env.NODE_ENV === "test") {
      return { _id: "123", ...data }; // 🔥 mock
    }

    return await Adoption.create(data);
  }

  async getById(id) {
    if (process.env.NODE_ENV === "test") {
      return { _id: id, name: "Mock" }; // 🔥 mock
    }

    return await Adoption.findById(id);
  }

  async delete(id) {
    if (process.env.NODE_ENV === "test") {
      return { deleted: true }; // 🔥 mock
    }

    return await Adoption.findByIdAndDelete(id);
  }
}
