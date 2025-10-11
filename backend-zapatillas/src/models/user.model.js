import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" }, // 'user' o 'admin'
  age: { type: Number, required: true }
});

const userModel = mongoose.model("User", userSchema);

export default userModel;

