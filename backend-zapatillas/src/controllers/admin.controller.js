import UserService from "../services/user.service.js";
import { logger } from "../config/logger.js";

export default class AdminController {
  static async renderUsers(req, res) {
    try {
      logger.debug("Renderizando vista admin: lista de usuarios");
      const users = await UserService.getAllUsers();
      logger.info(`Usuarios cargados: ${users.length}`);
      res.render("admin-users", { users, year: new Date().getFullYear() });
    } catch (error) {
      logger.error("Error cargando usuarios en admin: " + error.message);
      res.status(500).send("Error al cargar usuarios");
    }
  }

  static async renderEditUser(req, res) {
    try {
      logger.debug(`Renderizando edición para usuario ${req.params.id}`);
      const user = await UserService.getUserById(req.params.id);
      if (!user) {
        logger.warning("Usuario no encontrado al editar");
        return res.status(404).send("Usuario no encontrado");
      }
      res.render("userEdit", { user, year: new Date().getFullYear() });
    } catch (error) {
      logger.error("Error render edit: " + error.message);
      res.status(500).send("Error al cargar formulario de edición");
    }
  }

  static async updateUser(req, res) {
    try {
      logger.debug(`Actualizando usuario ${req.params.id}`);
      await UserService.updateUser(req.params.id, req.body);
      logger.info(`Usuario actualizado: ${req.params.id}`);
      res.redirect("/admin/users");
    } catch (error) {
      logger.error("Error al actualizar usuario: " + error.message);
      res.status(500).send("Error al actualizar usuario");
    }
  }

  static async renderDeleteUser(req, res) {
    try {
      logger.debug(`Renderizando eliminación para usuario ${req.params.id}`);
      const user = await UserService.getUserById(req.params.id);
      if (!user) return res.status(404).send("Usuario no encontrado");

      res.render("userDelete", { user, year: new Date().getFullYear() });
    } catch (error) {
      logger.error("Error render delete: " + error.message);
      res.status(500).send("Error al cargar confirmación de eliminación");
    }
  }

  static async deleteUser(req, res) {
    try {
      logger.warning(`Eliminando usuario ${req.params.id}`);
      await UserService.deleteUser(req.params.id);
      res.redirect("/admin/users");
    } catch (error) {
      logger.error("Error al eliminar usuario: " + error.message);
      res.status(500).send("Error al eliminar usuario");
    }
  }
}
