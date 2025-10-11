import { Router } from "express";
import AdminController from "../controllers/admin.controller.js";
import { authRequired, authorization } from "../utils.js";

const router = Router();

// Todas las rutas de admin requieren login y rol admin
router.use(authRequired, authorization(["admin"]));

// Listar usuarios
router.get("/users", AdminController.renderUsers);

// Editar usuario
router.get("/users/edit/:id", AdminController.renderEditUser);
router.post("/users/edit/:id", AdminController.updateUser);

// Confirmar eliminación
router.get("/users/delete/:id", AdminController.renderDeleteUser);

// Ejecutar eliminación
router.post("/users/delete/:id", AdminController.deleteUser);

export default router;
