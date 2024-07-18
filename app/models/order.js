const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  flower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Flower",
    required: true,
  },
  quantity: { type: Number, required: true, min: 1 },
  sessionId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { type: String, required: true, default: "pending" },
  recipientId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
