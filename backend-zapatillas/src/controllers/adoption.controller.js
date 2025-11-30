
import AdoptionService from "../services/adoption.service.js";

const service = new AdoptionService();

export const getAdoptions = async (req, res) => {
  const data = await service.getAll();
  res.json({ status: "success", data });
};

export const createAdoption = async (req, res) => {
  const { pet, owner } = req.body;
  if (!pet || !owner) {
    return res.status(400).json({ status: "error", message: "Datos incompletos" });
  }
  const newAdoption = await service.create({ pet, owner });
  res.status(201).json({ status: "success", data: newAdoption });
};

export const getAdoptionById = async (req, res) => {
  const adoption = await service.getById(req.params.id);
  if (!adoption) {
    return res.status(404).json({ status: "error", message: "No encontrado" });
  }
  res.json({ status: "success", data: adoption });
};

export const deleteAdoption = async (req, res) => {
  const adoption = await service.delete(req.params.id);
  if (!adoption) {
    return res.status(404).json({ status: "error", message: "No encontrado" });
  }
  res.json({ status: "success", message: "Eliminado" });
};
