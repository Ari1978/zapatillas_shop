
import mongoose from "mongoose";

const adoptionSchema = new mongoose.Schema(
  {
    pet: { type: String, required: true },
    owner: { type: String, required: true },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("Adoption", adoptionSchema);
