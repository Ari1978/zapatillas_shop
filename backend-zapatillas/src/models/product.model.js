import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  category: String,
  image: String,
  code: { type: String, unique: true },
  thumbnails: { type: Array, default: [] } 
}, { timestamps: true });


const productModel = mongoose.model("Product", productSchema);

export default productModel;
