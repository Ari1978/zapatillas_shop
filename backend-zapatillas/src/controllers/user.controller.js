
import TicketService from "../services/ticket.service.js";
import CartService from "../services/cart.service.js";
import UserService from "../services/user.service.js";

export default class UserController {
  // Obtener todos los usuarios (solo admins)
  static async getUsers(req, res) {
    try {
      const users = await UserService.getAllUsers();
      res.json({ status: "Success", payload: users });
    } catch (error) {
      res.status(500).json({ status: "Error", message: error.message });
    }
  }

  // Obtener usuario por ID
  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(id);
      if (!user) return res.status(404).json({ status: "Error", message: "Usuario no encontrado" });
      res.json({ status: "Success", payload: user });
    } catch (error) {
      res.status(500).json({ status: "Error", message: error.message });
    }
  }

  // Actualizar usuario
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updatedUser = await UserService.updateUser(id, req.body);
      res.json({ status: "Success", payload: updatedUser });
    } catch (error) {
      res.status(500).json({ status: "Error", message: error.message });
    }
  }

  // Eliminar usuario
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      await UserService.deleteUser(id);
      res.json({ status: "Success", message: "Usuario eliminado" });
    } catch (error) {
      res.status(500).json({ status: "Error", message: error.message });
    }
  }

  // Renderizar perfil del usuario
  static async renderProfile(req, res) {
    try {
      const user = req.user; // proviene de JWT / sesión
      if (!user) return res.redirect("/login");

      // Historial de tickets
      const tickets = await TicketService.getTicketsByUser(user._id) || [];

      // Carrito actual
      const cart = await CartService.getCartByUser(user._id) || { products: [] };
      const cartTotal = await CartService.calculateTotal(user._id) || 0;

      res.render("profile", {
        user,
        tickets,
        cart,
        cartTotal
      });
    } catch (error) {
      console.error("Error renderizando perfil:", error);
      res.status(500).send("Error al cargar el perfil");
    }
  }
}
