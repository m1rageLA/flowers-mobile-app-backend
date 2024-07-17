const mongoose = require("mongoose");

const flowersSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: String, required: true },
  imgUrl: { type: String, required: true },
  modelUrl: { type: String, required: true },
});

const Flowers = mongoose.model("Flowers", flowersSchema);
module.exports = Flowers;
