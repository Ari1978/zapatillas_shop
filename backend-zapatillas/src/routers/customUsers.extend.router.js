import CustomRouter from "./customRouter.js";

export default class UsersExtendRouter extends CustomRouter {
  init() {
    console.log("UsersExtendRouter inicializado");

    // Ruta pública
    this.get("/", ["PUBLIC"], (req, res) => {
      res.send({ message: "Ruta pública: cualquier usuario puede acceder." });
    });

    // Ruta solo para ADMIN
    this.get("/admin", ["ADMIN"], (req, res) => {
      res.render("adminPanel", {
        title: "Panel de Admin",
        user: req.user,
        year: new Date().getFullYear()
      });
    });

    // Ruta perfil usuario
    this.get("/profile", ["USER", "ADMIN"], (req, res) => {
      res.render("profile", {
        title: "Mi Perfil",
        user: req.user,
        year: new Date().getFullYear()
      });
    });
  }
}
