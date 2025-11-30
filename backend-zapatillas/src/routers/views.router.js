import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { join} from "path";
import productModel from "../models/product.model.js";
import userModel from "../models/user.model.js";
import { PRIVATE_KEY, authorization, createHash } from "../utils.js";

const router = Router();

const __dirname = process.cwd();
// -----------------------
// INDEX - HTML estático
// -----------------------
router.get("/", (req, res) => {
  res.sendFile(join(__dirname, "src", "public", "index.html"));
});

// -----------------------
// HOME - Productos
// -----------------------
router.get("/home", async (req, res) => {
  try {
    const products = await productModel.find().lean();
    res.render("home", { 
      title: "Tienda",
      products,
      user: req.session?.user || null,
      year: new Date().getFullYear()
    });
  } catch (err) {
    console.error("Error en home:", err);
    res.status(500).send("Error cargando productos");
  }
});

// -----------------------
// SHOP - Usuarios logueados
// -----------------------
router.get("/shop", async (req, res) => {
  try {
    const products = await productModel.find().lean();
    const user = req.session.user || null;

    let jwtToken = null;
    if (user) {
      jwtToken = jwt.sign({ user }, PRIVATE_KEY, { expiresIn: "2h" });
    }

    res.render("shop", {
      title: "Tienda",
      products,
      user,
      jwtToken,
      year: new Date().getFullYear()
    });
  } catch (err) {
    console.error("Error cargando shop:", err);
    res.status(500).send("Error cargando tienda");
  }
});

// -----------------------
// REALTIME PRODUCTS - Solo admin
// -----------------------
router.get(
  "/realTimeProducts",
  passport.authenticate("jwt", { session: false }),
  authorization(["admin"]),
  async (req, res) => {
    try {
      const products = await productModel.find().lean();
      res.render("realTimeProducts", {
        title: "Productos en Tiempo Real",
        products,
        user: req.user,
        year: new Date().getFullYear()
      });
    } catch (err) {
      res.status(500).send("Error cargando productos");
    }
  }
);

// -----------------------
// ADMIN PANEL - Solo admin
// -----------------------
router.get(
  "/adminPanel",
  passport.authenticate("jwt", { session: false }),
  authorization(["admin"]),
  async (req, res) => {
    try {
      res.render("adminPanel", {
        title: "Panel de Administración",
        user: req.user,
        year: new Date().getFullYear()
      });
    } catch (err) {
      console.error("Error cargando adminPanel:", err);
      res.status(500).send("Error cargando panel de administración");
    }
  }
);

// -----------------------
// PROFILE EDIT - Usuario propio / Admin editando
// -----------------------
// GET - Editar perfil / Admin editando usuario
router.get(
  ["/profile/edit", "/admin/users/edit/:uid"],
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      let user, isAdmin = false, formAction;

      if (req.params.uid) {
        // Admin editando otro usuario
        isAdmin = true; // <- esto indica que es admin
        user = await userModel.findById(req.params.uid).lean();
        formAction = `/vistas/admin/users/edit/${req.params.uid}`;
      } else {
        user = await userModel.findById(req.user.id).lean();
        formAction = "/vistas/profile/edit";
      }

      const cancelUrl = isAdmin ? "/vistas/adminPanel" : "/vistas/shop";

      res.render("userEdit", {
        user,
        isAdmin, // <- asegurate de pasar esta variable
        formAction,
        cancelUrl,
      });

    } catch (err) {
      console.error(err);
      res.status(500).send("Error cargando perfil");
    }
  }
);

// -----------------------
// POST - Guardar cambios de perfil
// -----------------------
router.post(
  ["/profile/edit", "/admin/users/edit/:uid"],
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      let userId;

      if (req.params.uid) {
        // Admin editando otro usuario
        userId = req.params.uid;
      } else {
        // Usuario propio
        userId = req.user.id;
      }

      const { first_name, last_name, age, role } = req.body;

      const updateData = { first_name, last_name, age };
      if (role && req.user.role === "admin") {
        updateData.role = role;
      }

      await userModel.findByIdAndUpdate(userId, updateData);

      const redirectUrl = req.params.uid ? "/vistas/adminPanel" : "/vistas/shop";
      res.redirect(redirectUrl);

    } catch (err) {
      console.error("Error actualizando perfil:", err);
      res.status(500).send("Error actualizando perfil");
    }
  }
);

// -----------------------
// CHANGE PASSWORD - GET
// -----------------------
router.get(
  ["/profile/change-password", "/admin/users/change-password/:uid"],
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      let user, isAdmin = false;

      if (req.params.uid) {
        isAdmin = true;

        if (req.params.uid === req.user.id) {
          return res.status(400).send("Usá /vistas/profile/change-password para cambiar tu propia contraseña");
        }

        user = await userModel.findById(req.params.uid).lean();
      } else {
        user = await userModel.findById(req.user.id).lean();
      }

      res.render("changePassword", {
        title: isAdmin ? "Cambiar contraseña de usuario" : "Cambiar mi contraseña",
        user,
        isAdmin,
        formAction: isAdmin ? `/vistas/admin/users/change-password/${user._id}` : "/vistas/profile/change-password",
        cancelUrl: isAdmin ? "/vistas/adminPanel" : "/vistas/shop",
        year: new Date().getFullYear()
      });
    } catch (err) {
      console.error("Error cargando formulario de cambio de contraseña:", err);
      res.status(500).send("Error cargando formulario");
    }
  }
);

// -----------------------
// POST - Cambiar contraseña
// -----------------------
router.post(
  ["/profile/change-password", "/admin/users/change-password/:uid"],
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { password } = req.body;
      let userId;

      if (req.params.uid) {
        // Admin cambiando contraseña de otro usuario
        if (req.user.role !== "admin") return res.status(403).send("No autorizado");

        if (req.params.uid === req.user.id) {
          return res.status(400).send("Usá /vistas/profile/change-password para cambiar tu propia contraseña");
        }

        userId = req.params.uid;
      } else {
        // Usuario propio (incluido admin)
        userId = req.user.id;
      }

      if (!password || password.length < 6) {
        return res.status(400).send("Contraseña inválida (mínimo 6 caracteres)");
      }

      const hashedPassword = createHash(password);
      await userModel.findByIdAndUpdate(userId, { password: hashedPassword });

      const redirectUrl = req.params.uid ? "/vistas/adminPanel" : "/vistas/shop";
      res.redirect(redirectUrl);

    } catch (err) {
      console.error("Error cambiando contraseña:", err);
      res.status(500).send("Error cambiando contraseña");
    }
  }
);



export default router;