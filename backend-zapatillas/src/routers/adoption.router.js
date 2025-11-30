
import { Router } from "express";
import {
  getAdoptions,
  createAdoption,
  getAdoptionById,
  deleteAdoption
} from "../controllers/adoption.controller.js";

const router = Router();

router.get("/", getAdoptions);
router.post("/", createAdoption);
router.get("/:id", getAdoptionById);
router.delete("/:id", deleteAdoption);

export default router;
