import UserService from "../services/user.service.js";

export default class AdminController {
  // Renderizar todos los usuarios
  static async renderUsers(req, res) {
    try {
      const users = await UserService.getAllUsers();
      console.log(users);
      
      res.render("admin-users", { users, year: new Date().getFullYear() });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al cargar usuarios");
    }
  }

  // Renderizar formulario de edición
  static async renderEditUser(req, res) {
    try {
      const user = await UserService.getUserById(req.params.id);
      if (!user) return res.status(404).send("Usuario no encontrado");
      res.render("userEdit", { user, year: new Date().getFullYear() });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al cargar formulario de edición");
    }
  }

  // Actualizar usuario
  static async updateUser(req, res) {
    try {
      await UserService.updateUser(req.params.id, req.body);
      res.redirect("/admin/users");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al actualizar usuario");
    }
  }

  // Renderizar confirmación antes de eliminar
  static async renderDeleteUser(req, res) {
    try {
      const user = await UserService.getUserById(req.params.id);
      if (!user) return res.status(404).send("Usuario no encontrado");
      res.render("userDelete", { user, year: new Date().getFullYear() });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al cargar confirmación de eliminación");
    }
  }

  // Eliminar usuario
  static async deleteUser(req, res) {
    try {
      await UserService.deleteUser(req.params.id);
      res.redirect("/admin/users");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al eliminar usuario");
    }
  }
}
