import TicketService from "../services/ticket.service.js";
import CartService from "../services/cart.service.js";
import UserService from "../services/user.service.js";
import { logger } from "../config/logger.js";

export default class UserController {
  static async getUsers(req, res) {
    try {
      logger.debug("Listando usuarios");
      const users = await UserService.getAllUsers();
      logger.info(`Usuarios encontrados: ${users.length}`);
      res.json({ status: "Success", payload: users });
    } catch (error) {
      logger.error("Error al obtener usuarios: " + error.message);
      res.status(500).json({ status: "Error", message: error.message });
    }
  }

  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      logger.debug(`Buscando usuario ${id}`);
      const user = await UserService.getUserById(id);

      if (!user) {
        logger.warning(`Usuario no encontrado: ${id}`);
        return res.status(404).json({ status: "Error", message: "Usuario no encontrado" });
      }

      logger.info(`Usuario encontrado: ${id}`);
      res.json({ status: "Success", payload: user });
    } catch (error) {
      logger.error("Error al obtener usuario: " + error.message);
      res.status(500).json({ status: "Error", message: error.message });
    }
  }

  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      logger.debug(`Actualizando usuario ${id}`);
      const updatedUser = await UserService.updateUser(id, req.body);
      logger.info(`Usuario actualizado: ${id}`);
      res.json({ status: "Success", payload: updatedUser });
    } catch (error) {
      logger.error("Error actualizando usuario: " + error.message);
      res.status(500).json({ status: "Error", message: error.message });
    }
  }

  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      logger.warning(`Eliminando usuario ${id}`);
      await UserService.deleteUser(id);
      res.json({ status: "Success", message: "Usuario eliminado" });
    } catch (error) {
      logger.error("Error eliminando usuario: " + error.message);
      res.status(500).json({ status: "Error", message: error.message });
    }
  }

  static async renderProfile(req, res) {
    try {
      const user = req.user;
      logger.debug(`Renderizando perfil para ${user?.email}`);

      const tickets = await TicketService.getTicketsByUser(user._id);
      const cart = await CartService.getCartByUser(user._id);
      const cartTotal = await CartService.calculateTotal(user._id);

      res.render("profile", { user, tickets, cart, cartTotal });
    } catch (error) {
      logger.error("Error renderizando perfil: " + error.message);
      res.status(500).send("Error al cargar el perfil");
    }
  }
}
