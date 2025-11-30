import { createHash, isValidPassword } from "../utils.js";
import { UserDTO } from "../dto/user.dto.js";
import UserRepository from "../repositories/user.repository.js";

const repo = new UserRepository();

class UserService {
  // Crear usuario con contraseña hasheada
  static async createUser(data) {
    data.password = createHash(data.password);
    const user = await repo.create(data);
    return new UserDTO(user);
  }

  // Obtener todos los usuarios
  static async getAllUsers() {
    const users = await repo.findAll();
    return users.map(user => new UserDTO(user));
  }

  // Buscar usuario por email
  static async getUserByEmail(email) {
    const user = await repo.findByEmail(email);
    return user ? new UserDTO(user) : null;
  }

  // Buscar usuario por ID
  static async getUserById(id) {
    const user = await repo.findById(id);
    return user ? new UserDTO(user) : null;
  }

  // Validar credenciales
  static async validateUser(email, password) {
    const user = await repo.findByEmail(email);
    if (!user) return false;
    return isValidPassword(user, password) ? new UserDTO(user) : false;
  }

  // Actualizar usuario
  static async updateUser(id, data) {
    if (data.password) data.password = createHash(data.password);
    const updatedUser = await repo.update(id, data);
    return updatedUser ? new UserDTO(updatedUser) : null;
  }

  // Eliminar usuario
  static async deleteUser(id) {
    await repo.delete(id);
    return true;
  }
}

export default UserService;

