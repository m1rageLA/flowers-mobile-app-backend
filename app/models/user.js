const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  uniqueId: { type: String, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

//Тест?
const generateUniqueId = async () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 4; i++) {
    id += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  const existingUser = await User.findOne({ uniqueId: id });
  return existingUser ? generateUniqueId() : id;
};

userSchema.pre("save", async function (next) {
  if (!this.uniqueId) {
    this.uniqueId = await generateUniqueId();
  }
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
