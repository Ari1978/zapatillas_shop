import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  purchaser: { type: String, required: true },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      title: String,
      quantity: Number,
      price: Number
    }
  ],
  amount: { type: Number, required: true },
  purchase_datetime: { type: Date, default: Date.now }
});

const ticketModel = mongoose.model("Ticket", ticketSchema);

export default ticketModel;
