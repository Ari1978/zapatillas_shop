import { Router } from "express";
import { TicketController } from "../controllers/ticket.controller.js";
import { authRequired } from "../utils.js";

const router = Router();
const ticketController = new TicketController();

// Generar ticket
router.post("/purchase", authRequired, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const ticket = await ticketController.createTicket(userId);
    res.status(201).json({ success: true, ticket });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Renderizar ticket por ID
router.get("/:ticketId", authRequired, async (req, res) => {
  try {
    const ticket = await ticketController.getTicketById(req.params.ticketId);
    res.render("ticket", { title: "Detalle de Compra", ticket, user: req.user });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

export default router;
