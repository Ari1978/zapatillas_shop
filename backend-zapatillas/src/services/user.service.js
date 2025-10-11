import userModel from "../models/user.model.js";
import { createHash, isValidPassword } from "../utils.js";
import { UserDTO } from "../dto/user.dto.js";

class UserService {
  // Crear usuario con contraseña hasheada
  static async createUser(data) {
    data.password = createHash(data.password);
    const user = await userModel.create(data);
    return new UserDTO(user);
  }

  // Obtener todos los usuarios
  static async getAllUsers() {
    const users = await userModel.find().lean();
    return users.map(user => new UserDTO(user));
  }

  // Buscar usuario por email
  static async getUserByEmail(email) {
    const user = await userModel.findOne({ email }).lean();
    return user ? new UserDTO(user) : null;
  }

  // Buscar usuario por ID
  static async getUserById(id) {
    const user = await userModel.findById(id).lean();
    return user ? new UserDTO(user) : null;
  }

  // Validar credenciales
  static async validateUser(email, password) {
    const user = await userModel.findOne({ email });
    if (!user) return false;
    return isValidPassword(user, password) ? new UserDTO(user) : false;
  }

  // Actualizar usuario
  static async updateUser(id, data) {
    if (data.password) data.password = createHash(data.password);
    const updatedUser = await userModel.findByIdAndUpdate(id, data, { new: true }).lean();
    return updatedUser ? new UserDTO(updatedUser) : null;
  }

  // Eliminar usuario
  static async deleteUser(id) {
    await userModel.findByIdAndDelete(id);
    return true;
  }
}

export default UserService;

