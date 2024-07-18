const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  message: { type: String, required: true, min: 1 },
  senderId: { type: String, required: true, default: "without sender"},
  recipientId: { type: String, required: true, default: "without recipient" },
  status: { type: String, required: true, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;